import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { sendMessageSchema } from './chat.validation';
import { AppError } from '../../shared/middleware/errorHandler';

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);

export class ChatController {
  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const validatedData = sendMessageSchema.parse(req.body);

      const { answer, sources } = await chatService.sendMessage(
        userId,
        userRole,
        validatedData.question
      );

      res.status(200).json({
        success: true,
        data: {
          answer,
          sources,
        },
        message: 'Message traité avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const messages = await chatService.getHistory(userId);

      res.status(200).json({
        success: true,
        data: {
          messages,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
