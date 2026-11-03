import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { prisma } from "../lib/prisma";

const MOCK_USER = {
  id: "patient-123",
  cpf: "12345678910",
  password: "12345",
  name: "Maria Oliveira"
};

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    cpf: string;
  };
};

export async function authenticate(cpf: string, password: string): Promise<AuthResponse> {
  const normalizedCpf = cpf.replace(/\D/g, "");

  if (env.ENABLE_MOCK_AUTH) {
    if (normalizedCpf === MOCK_USER.cpf && password === MOCK_USER.password) {
      return generateToken({
        id: MOCK_USER.id,
        name: MOCK_USER.name,
        cpf: MOCK_USER.cpf
      });
    }
    throw new AppError("Credenciais inválidas", 401);
  }

  const credential = await prisma.patientCredential.findUnique({
    where: { username: normalizedCpf },
    include: {
      patient: {
        include: {
          names: true,
          identifiers: true
        }
      }
    }
  });

  if (!credential || !credential.patient) {
    throw new AppError("Usuário não encontrado", 401);
  }

  const match = await bcrypt.compare(password, credential.passwordHash);
  if (!match) {
    throw new AppError("Credenciais inválidas", 401);
  }

  const officialName =
    credential.patient.names.find((name) => name.use === "official") ??
    credential.patient.names[0];
  const patientName = officialName?.text ?? `${officialName?.given ?? ""} ${officialName?.family ?? ""}`.trim();

  return generateToken({
    id: credential.patient.id,
    name: patientName || "Paciente",
    cpf: normalizedCpf
  });
}

function generateToken(payload: { id: string; name: string; cpf: string }): AuthResponse {
  const token = jwt.sign(
    {
      cpf: payload.cpf
    },
    env.JWT_SECRET,
    {
      subject: payload.id,
      expiresIn: "1h"
    }
  );

  return {
    token,
    user: payload
  };
}


