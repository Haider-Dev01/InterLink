import { Router } from 'express';
import { ChatController } from './chat.controller';
import { authenticate } from '../../shared/middleware/authenticate';

const router = Router();
const chatController = new ChatController();

/**
 * @route   POST /api/chat/message
 * @desc    Envoyer un message et recevoir une réponse RAG
 * @access  Privé (Candidat ou Recruteur)
 */
router.post('/message', authenticate, chatController.sendMessage);

/**
 * @route   GET /api/chat/history
 * @desc    Récupérer l'historique de chat de l'utilisateur
 * @access  Privé (Candidat ou Recruteur)
 */
router.get('/history', authenticate, chatController.getHistory);

export default router;
