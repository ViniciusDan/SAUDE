import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middlewares/authenticate";
import { getPatientSummary } from "../services/patientSummaryService";

const paramsSchema = z.object({
  patientId: z.string().min(1)
});

export async function getPatientSummaryController(req: AuthenticatedRequest, res: Response) {
  const parsedParams = paramsSchema.parse(req.params);

  if (req.user && req.user.sub !== parsedParams.patientId) {
    return res.status(403).json({ message: "Acesso negado" });
  }

  const summary = await getPatientSummary(parsedParams.patientId);
  res.json(summary);
}


