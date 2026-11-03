import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AuthenticatedUser = {
  sub: string;
  cpf?: string;
  identifier?: string;
  role?: "patient" | "clinic";
};

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}