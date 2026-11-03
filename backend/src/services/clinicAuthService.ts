import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import { env } from "../config/env";
import { clinicAuthRepository } from "../repositories/clinicAuthRepository";

type ClinicLoginResponse = {
  accessToken: string;
  user: {
    id: string;
    identifier: string;
    name: string;
    role: "clinic";
  };
};

export const clinicAuthService = {
  async login(identifier: string, password: string): Promise<ClinicLoginResponse> {
    console.log("LOGIN CLINIC IDENTIFIER:", identifier);

    const credential = await clinicAuthRepository.findCredentialsForLogin(identifier);
    console.log("CREDENTIAL:", credential);

    if (!credential || !credential.clinic) {
      throw new AppError("Identificação ou senha incorretos", 401);
    }

    const passwordMatch = await bcrypt.compare(password, credential.passwordHash);
    console.log("PASSWORD MATCH:", passwordMatch);

    if (!passwordMatch) {
      throw new AppError("Identificação ou senha incorretos", 401);
    }

    if (!credential.clinic.active) {
      throw new AppError("Clínica inativa", 403);
    }

    const accessToken = jwt.sign(
      {
        sub: credential.clinic.id,
        identifier: credential.clinic.identifier,
        role: "clinic"
      },
      env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      accessToken,
      user: {
        id: credential.clinic.id,
        identifier: credential.clinic.identifier,
        name: credential.clinic.tradeName || credential.clinic.name,
        role: "clinic"
      }
    };
  }
};