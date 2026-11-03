/**
 * Auth Service - Serviço de autenticação
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from '../../repositories/authRepository';
import { AppError } from '../../errors/AppError';
import { env } from '../../config/env';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    fhirId: string;
    name: string;
    cpf: string;
  };
}

// Usuário mock para desenvolvimento
const MOCK_USER = {
  id: 'patient-mock-123',
  fhirId: 'patient-123',
  cpf: '12345678910',
  name: 'Maria Oliveira',
  password: '12345',
};

export const authService = {
  /**
   * Autentica o usuário e retorna token JWT
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    // Modo mock (desenvolvimento)
    if (env.ENABLE_MOCK_AUTH) {
      if (username === MOCK_USER.cpf && password === MOCK_USER.password) {
        const accessToken = jwt.sign(
          {
            sub: MOCK_USER.id,
            fhirId: MOCK_USER.fhirId,
            cpf: MOCK_USER.cpf,
          },
          env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        return {
          accessToken,
          user: {
            id: MOCK_USER.id,
            fhirId: MOCK_USER.fhirId,
            name: MOCK_USER.name,
            cpf: MOCK_USER.cpf,
          },
        };
      }

      throw new AppError('CPF ou senha incorretos', 401);
    }

    // Modo real (produção)
    const credential = await authRepository.findCredentialsByUsername(username);

    if (!credential) {
      throw new AppError('CPF ou senha incorretos', 401);
    }

    const passwordMatch = await bcrypt.compare(password, credential.passwordHash);

    if (!passwordMatch) {
      throw new AppError('CPF ou senha incorretos', 401);
    }

    if (!credential.patient.active) {
      throw new AppError('Usuário inativo', 403);
    }

    // Gera token JWT
    const accessToken = jwt.sign(
      {
        sub: credential.patient.id,
        fhirId: credential.patient.fhirId,
        cpf: credential.patient.cpf,
      },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Pega o nome do paciente
    const name = credential.patient.names?.[0]?.text || credential.patient.names?.[0]?.given || 'Paciente';

    return {
      accessToken,
      user: {
        id: credential.patient.id,
        fhirId: credential.patient.fhirId,
        name,
        cpf: credential.patient.cpf || username,
      },
    };
  },

  /**
   * Valida um token JWT e retorna o payload
   */
  verifyToken(token: string): { sub: string; fhirId: string; cpf: string } {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as any;
      return {
        sub: payload.sub,
        fhirId: payload.fhirId,
        cpf: payload.cpf,
      };
    } catch (error) {
      throw new AppError('Token inválido ou expirado', 401);
    }
  },

  /**
   * Cria hash de senha
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  /**
   * Verifica se senha corresponde ao hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};

