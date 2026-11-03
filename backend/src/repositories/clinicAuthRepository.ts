import { prisma } from "../lib/prisma";

export const clinicAuthRepository = {
  async findCredentialsForLogin(identifier: string) {
    return prisma.clinicCredential.findFirst({
      where: {
        OR: [
          { username: identifier },
          {
            clinic: {
              identifier
            }
          }
        ]
      },
      include: {
        clinic: true
      }
    });
  }
};