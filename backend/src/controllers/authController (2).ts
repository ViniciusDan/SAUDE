import type { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../services/authService";

const loginSchema = z.object({
  cpf: z.string().min(11),
  password: z.string().min(4)
});

export async function loginController(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: parsed.error.flatten().fieldErrors
    });
  }

  const { cpf, password } = parsed.data;
  const response = await authenticate(cpf, password);

  res.json(response);
}


