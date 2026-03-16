import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authRateLimiter } from '../../shared/middleware/rateLimiter';
import { authenticate } from '../../shared/middleware/authenticate';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Enregistrer un nouvel utilisateur (Candidat ou Recruteur)
 * @access  Public
 */
router.post('/register', authRateLimiter, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Connecter un utilisateur existant
 * @access  Public
 */
router.post('/login', authRateLimiter, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchir l'Access Token avec le Refresh Token (Cookie)
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnecter l'utilisateur (révoquer le Refresh Token)
 * @access  Public/Private
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir l'utilisateur courant (via JWT)
 * @access  Privé
 */
router.get('/me', authenticate, authController.me);

export default router;
