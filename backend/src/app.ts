/**
 * Aplicação Express - API FHIR BR Core (Simulação RNDS/RAC)
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import authRoutes from "./routes/auth.routes";
import fhirRoutes from "./routes/fhir.routes";
import clinicAuthRoutes from "./routes/clinicAuth.routes";
import clinicRoutes from "./routes/clinic.routes";
import { patientRoutes } from "./routes/patient.routes";
import { AppError } from "./errors/AppError";

export const app = express();

// Middlewares de segurança e utilidades
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Arquivos estáticos
app.use("/uploads", express.static(path.resolve("uploads")));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "FHIR BR Core API (RNDS/RAC Simulation)",
    timestamp: new Date().toISOString()
  });
});

// Rotas principais
app.use("/auth", authRoutes);
app.use("/fhir", fhirRoutes);
app.use("/clinic/auth", clinicAuthRoutes);
app.use("/clinic", clinicRoutes);
app.use("/patients", patientRoutes);

// Rota 404
app.use((_req, res) => {
  res.status(404).json({
    message: "Endpoint não encontrado",
    hint: "Consulte /health para verificar se a API está rodando"
  });
});

// Error handler global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode
    });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Erro de validação",
      details: (err as any).errors
    });
  }

  console.error("Erro não tratado:", err);
  return res.status(500).json({
    error: "Erro interno do servidor",
    message: process.env.NODE_ENV === "development" ? err.message : "Ocorreu um erro inesperado"
  });
});