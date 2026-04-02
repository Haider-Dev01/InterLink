
import { ChatRepository } from './chat.repository';
import { prisma } from '../../shared/config/prismaClient';

interface RAGDocument {
  id: string;
  content: string;
  source?: string;
  score?: number;
}

interface RAGQueryRequest {
  question: string;
  userId: string;
  userRole: 'candidate' | 'recruiter' | 'admin';
  documents: RAGDocument[];
}

interface RAGQueryResponse {
  answer: string;
  sources: string[];
}

export class ChatService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8002';
  private readonly queryTimeout = 15000; // 15 seconds

  constructor(private chatRepository: ChatRepository) {}

  /**
   * Main entry point for sending a chat message.
   * Orchestrates document retrieval, AI service call, and persistence.
   */
  async sendMessage(
    userId: string,
    userRole: 'candidate' | 'recruiter' | 'admin',
    question: string
  ): Promise<{ answer: string; sources: string[] }> {
    // 1. Fetch relevant context based on role (top 10 latest entries)
    const documents = await this.getRelevantDocuments(userRole);

    let answer = "Désolé, le service d'intelligence artificielle est temporairement indisponible.";
    let sources: string[] = [];

    // 2. Call the AI RAG Service
    try {
      const response = await fetch(`${this.aiServiceUrl}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          userId,
          userRole,
          documents
        } as RAGQueryRequest),
        signal: AbortSignal.timeout(this.queryTimeout)
      });

      if (response.ok) {
        const data = await response.json() as RAGQueryResponse;
        answer = data.answer;
        sources = data.sources || [];
      } else {
        const errorData = await response.text();
        console.error(`AI Service error: HTTP ${response.status} - ${errorData}`);
      }
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        answer = "L'IA a mis trop de temps à répondre (timeout de 15s).";
      } else {
        console.error('Failed to call AI Service:', error);
      }
    }

    // 3. Persist the interaction
    // We save the user's question first
    await this.chatRepository.saveMessage(userId, 'user', question);
    
    // Then we save the assistant's answer with the sources in context
    await this.chatRepository.saveMessage(userId, 'assistant', answer, { sources });

    // 4. Return results to the controller
    return { answer, sources };
  }

  /**
   * Retrieves chat history for a user.
   */
  async getHistory(userId: string) {
    const messages = await this.chatRepository.getHistory(userId, 20);
    // Return in chronological order (oldest first)
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  /**
   * Internal helper to fetch context documents.
   * Candidate -> Latest Job Offers
   * Recruiter -> Latest active CVs
   */
  private async getRelevantDocuments(userRole: 'candidate' | 'recruiter' | 'admin'): Promise<RAGDocument[]> {
    try {
      if (userRole === 'candidate') {
        const offers = await prisma.jobOffer.findMany({
          where: { offerStatus: 'published', deletedAt: null },
          include: { 
            offerSkills: { include: { skill: true } },
            company: true
          },
          take: 10,
          orderBy: { publishedAt: 'desc' }
        });

        return offers.map(offer => ({
          id: offer.id,
          source: `${offer.title} @ ${offer.company.name}`,
          content: `Titre: ${offer.title}. Description: ${offer.description}. ` +
                   `Compétences requises: ${offer.offerSkills.map(os => os.skill.name).join(', ')}. ` +
                   `Localisation: ${offer.location || 'N/A'}. Durée: ${offer.durationMonths || '?'} mois.`
        }));
      }

      if (userRole === 'recruiter') {
        const cvs = await prisma.cvDocument.findMany({
          where: { parseStatus: 'done', isActive: true },
          include: { 
            extractedSkills: { include: { skill: true } }, 
            user: { include: { profile: true } } 
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        });

        return cvs.map(cv => {
          const profile = cv.user.profile;
          const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Candidat';
          return {
            id: cv.id,
            source: `CV de ${name}`,
            content: `Candidat: ${name}. Bio: ${profile?.bio || 'N/A'}. ` +
                     `Compétences: ${cv.extractedSkills.map(es => es.skill.name).join(', ')}. ` +
                     `Expériences/Texte: ${cv.parsedText?.slice(0, 1000) || ''}`
          };
        });
      }
    } catch (error) {
      console.error('Error fetching relevant documents:', error);
    }

    return [];
  }
}