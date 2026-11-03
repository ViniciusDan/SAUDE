/**
 * Middleware de autenticação JWT
 */

import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth/authService';
import { AppError } from '../errors/AppError';

// Estende o tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        fhirId: string;
        cpf: string;
      };
    }
  }
}

export type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    fhirId: string;
    cpf: string;
  };
};

/**
 * Middleware que valida JWT e anexa dados do usuário em req.user
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Token não fornecido', 401));
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(new AppError('Formato de token inválido. Use: Bearer <token>', 401));
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Token inválido ou expirado', 401));
  }
}

/**
 * Middleware opcional de autenticação (não bloqueia se não houver token)
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next();
  }

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
  } catch {
    // Ignora erros silenciosamente
  }

  return next();
}
