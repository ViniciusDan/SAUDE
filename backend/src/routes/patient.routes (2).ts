import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { getPatientSummaryController } from "../controllers/patientController";

export const patientRoutes = Router();

patientRoutes.use(authenticate);
patientRoutes.get("/:patientId/summary", getPatientSummaryController);


