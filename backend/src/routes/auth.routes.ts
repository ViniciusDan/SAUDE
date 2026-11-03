/**
 * Rotas de autenticação
 */

import { Router } from 'express';
import { authController } from '../controllers/auth/authController';
import { authenticate } from '../middlewares/authenticate';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

/**
 * POST /auth/login
 * Autentica o usuário e retorna token JWT
 */
router.post('/login', asyncHandler(authController.login));

/**
 * GET /auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
