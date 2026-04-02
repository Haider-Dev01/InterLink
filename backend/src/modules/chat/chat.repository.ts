import { prisma } from '../../shared/config/prismaClient';

export class ChatRepository {
  async saveMessage(
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    context?: unknown | null
  ) {
    return await prisma.chatMessage.create({
      data: {
        userId,
        role,
        content,
        // Ensure context is passed as a valid JSON if defined (but Prisma handles Record<string, unknown> anyway)
        context: context ? JSON.parse(JSON.stringify(context)) : undefined,
      },
    });
  }

  async getHistory(userId: string, limit = 20) {
    return await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
