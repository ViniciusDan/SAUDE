/**
 * Rotas FHIR - Endpoints compatíveis com FHIR BR Core
 * Simula o comportamento da RNDS (RAC)
 */

import { Router } from 'express';
import { patientFHIRController } from '../controllers/fhir/patientController';
import { authenticate } from '../middlewares/authenticate';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

/**
 * GET /fhir/patient/:cpf
 * Busca paciente por CPF (requer autenticação)
 */
router.get('/patient/:cpf', authenticate, asyncHandler(patientFHIRController.getPatientByCPF));

/**
 * GET /fhir/patient/:patientId/history
 * Busca histórico completo do paciente (RAC)
 */
router.get('/patient/:patientId/history', authenticate, asyncHandler(patientFHIRController.getPatientHistory));

/**
 * GET /fhir/encounters/:patientId
 * Busca encontros/atendimentos do paciente
 */
router.get('/encounters/:patientId', authenticate, asyncHandler(patientFHIRController.getPatientEncounters));

/**
 * GET /fhir/observations/:patientId
 * Busca observações (exames, sinais vitais) do paciente
 * Query params: ?category=laboratory|vital-signs|exam
 */
router.get('/observations/:patientId', authenticate, asyncHandler(patientFHIRController.getPatientObservations));

/**
 * GET /fhir/conditions/:patientId
 * Busca condições/problemas de saúde do paciente
 */
router.get('/conditions/:patientId', authenticate, asyncHandler(patientFHIRController.getPatientConditions));

/**
 * GET /fhir/allergies/:patientId
 * Busca alergias e intolerâncias do paciente
 */
router.get('/allergies/:patientId', authenticate, asyncHandler(patientFHIRController.getPatientAllergies));

/**
 * GET /fhir/procedures/:patientId
 * Busca procedimentos realizados no paciente
 */
router.get('/procedures/:patientId', authenticate, asyncHandler(patientFHIRController.getPatientProcedures));

/**
 * GET /fhir/medications/:patientId
 * Busca medicamentos do paciente
 */
router.get('/medications/:patientId', authenticate, asyncHandler(patientFHIRController.getPatientMedications));

export default router;

