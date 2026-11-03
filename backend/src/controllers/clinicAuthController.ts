import type { Request, Response } from "express";
import { z } from "zod";
import { clinicAuthService } from "../services/clinicAuthService";

const loginSchema = z.object({
  identifier: z.string().min(3, "Identificação é obrigatória"),
  password: z.string().min(1, "Senha é obrigatória")
});

export const clinicAuthController = {
  async login(req: Request, res: Response) {
    const { identifier, password } = loginSchema.parse(req.body);
    const result = await clinicAuthService.login(identifier, password);
    return res.json(result);
  }
};