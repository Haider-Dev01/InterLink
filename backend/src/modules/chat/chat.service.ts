import axios, { AxiosError } from 'axios';
import { ChatRepository } from './chat.repository';
import { AppError } from '../../shared/errors/AppError';

interface RAGQueryRequest {
    question: string;
    userId: string;
    userRole: 'candidate' | 'recruiter';
    documents: unknown[];
}

interface RAGQueryResponse {
    answer: string;
    sources: unknown[];
}

export class ChatService {
    private readonly aiServiceUrl = 'http://localhost:8002';
    private readonly queryTimeout = 15000; // 15 seconds

    constructor(private chatRepository: ChatRepository) {}

    async sendMessage(
        userId: string,
        userRole: 'candidate' | 'recruiter',
        question: string
    ): Promise<{ answer: string; sources: unknown[] }> {
        try {
            // Get relevant documents based on user role
            const documents = await this.getRelevantDocuments(userRole);

            // Call AI Service with timeout
            const ragResponse = await this.callAIService({
                question,
                userId,
                userRole,
                documents,
            });

            // Save user message
            await this.chatRepository.saveMessage({
                userId,
                role: 'user',
                content: question,
            });

            // Save assistant response
            await this.chatRepository.saveMessage({
                userId,
                role: 'assistant',
                content: ragResponse.answer,
                sources: ragResponse.sources,
            });

            return {
                answer: ragResponse.answer,
                sources: ragResponse.sources,
            };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getHistory(userId: string): Promise<unknown[]> {
        try {
            const messages = await this.chatRepository.getHistory(userId);
            return messages.sort(
                (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private async getRelevantDocuments(userRole: 'candidate' | 'recruiter'): Promise<unknown[]> {
        // TODO: Implement based on userRole
        // Candidate: get last 10 published offers with skills
        // Recruiter: get last 10 active parsed CVs with skills
        return [];
    }

    private async callAIService(payload: RAGQueryRequest): Promise<RAGQueryResponse> {
        try {
            const response = await axios.post<RAGQueryResponse>(
                `${this.aiServiceUrl}/rag/query`,
                payload,
                { timeout: this.queryTimeout }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new AppError(
                    error.response?.status || 500,
                    error.response?.data?.message || 'AI Service error'
                );
            }
            throw error;
        }
    }

    private handleError(error: unknown): Error {
        if (error instanceof AppError) {
            return error;
        }
        if (error instanceof Error) {
            return new AppError(500, error.message);
        }
        return new AppError(500, 'Unknown error occurred');
    }
}