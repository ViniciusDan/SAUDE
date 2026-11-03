/**
 * Auth Controller
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../../services/auth/authService';

const loginSchema = z.object({
  cpf: z.string().min(11, 'CPF é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const authController = {
  /**
   * POST /auth/login
   * Autentica o usuário
   */
  async login(req: Request, res: Response) {
    const { cpf, password } = loginSchema.parse(req.body);

    const result = await authService.login(cpf, password);

    return res.json(result);
  },

  /**
   * GET /auth/me
   * Retorna dados do usuário autenticado
   */
  async me(req: Request, res: Response) {
    // O middleware authenticate já validou o token e anexou req.user
    return res.json({
      user: req.user,
    });
  },
};

