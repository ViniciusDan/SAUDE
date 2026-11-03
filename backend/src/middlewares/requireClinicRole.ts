import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./authenticate";

export function requireClinicRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "clinic") {
    return res.status(403).json({ message: "Acesso permitido apenas para clínicas" });
  }

  return next();
}