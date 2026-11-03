import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { requireClinicRole } from "../middlewares/requireClinicRole";
import {
  searchPatientByCpfController,
  getClinicPatientSummaryController
} from "../controllers/clinicController";
import { uploadClinicalDocument } from "../middlewares/uploadClinicalDocument";
import {
  uploadDocumentToPatientController,
  listClinicPatientDocumentsController,
  hideDocumentFromPatientController,
  showDocumentToPatientController,
  updateClinicDocumentController
} from "../controllers/clinicalDocumentController";

const router = Router();

router.use(authenticate);
router.use(requireClinicRole);

router.get("/patients/search", searchPatientByCpfController);
router.get("/patients/:patientId/summary", getClinicPatientSummaryController);

router.put("/documents/:documentId", updateClinicDocumentController);

router.post(
  "/patients/:patientId/documents",
  uploadClinicalDocument.single("file"),
  uploadDocumentToPatientController
);

router.get("/patients/:patientId/documents", listClinicPatientDocumentsController);
router.patch("/documents/:documentId/hide", hideDocumentFromPatientController);
router.patch("/documents/:documentId/show", showDocumentToPatientController);

export default router;