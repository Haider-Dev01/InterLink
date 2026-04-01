import { prisma } from '../../shared/config/prismaClient';

export class ChatRepository {
  /**
   * Sauvegarde un message dans chat_messages.
   * @param userId  ID de l'utilisateur authentifié
   * @param role    "user" ou "assistant"
   * @param content Contenu du message
   * @param context Métadonnées RAG optionnelles (sources, scores…)
   */
  async saveMessage(
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    context?: Record<string, unknown> | null,
  ) {
    return prisma.chatMessage.create({
      data: {
        userId,
        role,
        content,
        context: context ?? undefined,
      },
    });
  }

  /**
   * Récupère l'historique de chat d'un utilisateur, du plus récent au plus ancien.
   * @param userId ID de l'utilisateur
   * @param limit  Nombre maximum de messages (défaut 50)
   * @param offset Décalage pour la pagination (défaut 0)
   */
  async getHistory(userId: string, limit = 50, offset = 0) {
    return prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        role: true,
        content: true,
        context: true,
        createdAt: true,
      },
    });
  }

  /**
   * Compte le nombre total de messages pour un utilisateur (utile pour la pagination).
   */
  async countHistory(userId: string) {
    return prisma.chatMessage.count({ where: { userId } });
  }
}
