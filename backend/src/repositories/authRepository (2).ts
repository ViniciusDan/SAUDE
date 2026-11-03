/**
 * AuthRepository - Repositório de autenticação
 */

import { prisma } from '../lib/prisma';

export const authRepository = {
  /**
   * Busca credenciais por username (CPF)
   */
  async findCredentialsByUsername(username: string) {
    return prisma.patientCredential.findUnique({
      where: { username },
      include: {
        patient: {
          include: {
            names: true,
            identifiers: true,
          },
        },
      },
    });
  },

  /**
   * Busca paciente e credenciais por ID do paciente
   */
  async findPatientWithCredentials(patientId: string) {
    return prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        credential: true,
        names: true,
        identifiers: true,
      },
    });
  },

  /**
   * Cria credenciais para um paciente
   */
  async createCredential(patientId: string, username: string, passwordHash: string) {
    return prisma.patientCredential.create({
      data: {
        patientId,
        username,
        passwordHash,
      },
    });
  },

  /**
   * Atualiza senha do paciente
   */
  async updatePassword(patientId: string, newPasswordHash: string) {
    return prisma.patientCredential.update({
      where: { patientId },
      data: {
        passwordHash: newPasswordHash,
      },
    });
  },
};

