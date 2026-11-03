import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3333),
  ENABLE_MOCK_AUTH: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((value) => value === "true")
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET ?? "change-me-secret-key",
  PORT: process.env.PORT ?? "3333",
  ENABLE_MOCK_AUTH: process.env.ENABLE_MOCK_AUTH ?? "false"
});

if (!parsed.success) {
  console.error("Erro ao carregar variáveis de ambiente:", parsed.error.flatten().fieldErrors);
  throw new Error("Configuração de ambiente inválida");
}

export const env = parsed.data;


