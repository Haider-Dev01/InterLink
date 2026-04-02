import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);

export class ChatController {
  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question } = req.body;
      if (!question || typeof question !== 'string' || question.length < 2 || question.length > 500) {
        return res.status(400).json({ success: false, message: 'Question invalide' });
      }

      const userId = req.user!.id;
      const userRole = req.user!.role;

      const result = await chatService.sendMessage(userId, userRole as any, question);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const messages = await chatService.getHistory(userId);

      res.json({
        success: true,
        data: { messages }
      });
    } catch (error) {
      next(error);
    }
  };
}
