import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { uploadClinicalDocument } from "../middlewares/uploadClinicalDocument";
import {
  getPatientSummaryController,
  updatePatientProfileController,
  listPatientAllergiesController,
  createPatientAllergyController,
  updatePatientAllergyController,
  deletePatientAllergyController,
  listPatientConditionsController,
  createPatientConditionController,
  updatePatientConditionController,
  deletePatientConditionController,
  listPatientMedicationsController,
  createPatientMedicationController,
  updatePatientMedicationController,
  deletePatientMedicationController
} from "../controllers/patientController";
import {
  listPatientDocumentsController,
  uploadPersonalDocumentController,
  listPersonalDocumentsController,
  updatePersonalDocumentController
} from "../controllers/clinicalDocumentController";

export const patientRoutes = Router();

patientRoutes.use(authenticate);

patientRoutes.get("/:patientId/summary", getPatientSummaryController);
patientRoutes.put("/:patientId/profile", updatePatientProfileController);

patientRoutes.get("/:patientId/allergies", listPatientAllergiesController);
patientRoutes.post("/:patientId/allergies", createPatientAllergyController);
patientRoutes.put("/:patientId/allergies/:allergyId", updatePatientAllergyController);
patientRoutes.delete("/:patientId/allergies/:allergyId", deletePatientAllergyController);

patientRoutes.get("/:patientId/conditions", listPatientConditionsController);
patientRoutes.post("/:patientId/conditions", createPatientConditionController);
patientRoutes.put("/:patientId/conditions/:conditionId", updatePatientConditionController);
patientRoutes.delete("/:patientId/conditions/:conditionId", deletePatientConditionController);

patientRoutes.get("/:patientId/medications", listPatientMedicationsController);
patientRoutes.post("/:patientId/medications", createPatientMedicationController);
patientRoutes.put("/:patientId/medications/:medicationId", updatePatientMedicationController);
patientRoutes.delete("/:patientId/medications/:medicationId", deletePatientMedicationController);

patientRoutes.get("/:patientId/documents", listPatientDocumentsController);

patientRoutes.post(
  "/:patientId/personal-documents",
  uploadClinicalDocument.single("file"),
  uploadPersonalDocumentController
);

patientRoutes.put(
  "/:patientId/personal-documents/:documentId",
  uploadClinicalDocument.single("file"),
  updatePersonalDocumentController
);

patientRoutes.get("/:patientId/personal-documents", listPersonalDocumentsController);