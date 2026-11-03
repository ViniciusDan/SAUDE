import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { clinicAuthController } from "../controllers/clinicAuthController";

const router = Router();

router.post("/login", asyncHandler(clinicAuthController.login));

export default router;