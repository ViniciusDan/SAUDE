/**
 * FHIR Patient Controller
 * Controllers para endpoints FHIR do paciente
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { patientFHIRService } from '../../services/fhir/patientService';
import { AppError } from '../../errors/AppError';

// Schemas de validação
const cpfSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
});

const patientIdSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
});

const categorySchema = z.object({
  category: z.string().optional(),
});

export const patientFHIRController = {
  /**
   * GET /fhir/patient/:cpf
   * Busca paciente por CPF
   */
  async getPatientByCPF(req: Request, res: Response) {
    const { cpf } = cpfSchema.parse(req.params);

    const bundle = await patientFHIRService.getPatientByCPF(cpf);

    return res.json(bundle);
  },

  /**
   * GET /fhir/patient/:patientId/history
   * Busca histórico completo do paciente (RAC)
   */
  async getPatientHistory(req: Request, res: Response) {
    const { patientId } = patientIdSchema.parse(req.params);

    // Verifica se o usuário autenticado pode acessar este paciente
    const authenticatedPatientId = req.user?.sub;
    if (authenticatedPatientId !== patientId) {
      throw new AppError('Acesso negado: você só pode acessar seus próprios dados', 403);
    }

    const bundle = await patientFHIRService.getPatientHistory(patientId);

    return res.json(bundle);
  },

  /**
   * GET /fhir/encounters/:patientId
   * Busca encontros do paciente
   */
  async getPatientEncounters(req: Request, res: Response) {
    const { patientId } = patientIdSchema.parse(req.params);

    // Verifica autorização
    const authenticatedPatientId = req.user?.sub;
    if (authenticatedPatientId !== patientId) {
      throw new AppError('Acesso negado', 403);
    }

    const bundle = await patientFHIRService.getPatientEncounters(patientId);

    return res.json(bundle);
  },

  /**
   * GET /fhir/observations/:patientId
   * Busca observações do paciente
   */
  async getPatientObservations(req: Request, res: Response) {
    const { patientId } = patientIdSchema.parse(req.params);
    const { category } = categorySchema.parse(req.query);

    // Verifica autorização
    const authenticatedPatientId = req.user?.sub;
    if (authenticatedPatientId !== patientId) {
      throw new AppError('Acesso negado', 403);
    }

    const bundle = await patientFHIRService.getPatientObservations(patientId, category);

    return res.json(bundle);
  },

  /**
   * GET /fhir/conditions/:patientId
   * Busca condições/problemas do paciente
   */
  async getPatientConditions(req: Request, res: Response) {
    const { patientId } = patientIdSchema.parse(req.params);

    // Verifica autorização
    const authenticatedPatientId = req.user?.sub;
    if (authenticatedPatientId !== patientId) {
      throw new AppError('Acesso negado', 403);
    }

    const bundle = await patientFHIRService.getPatientConditions(patientId);

    return res.json(bundle);
  },

  /**
   * GET /fhir/allergies/:patientId
   * Busca alergias do paciente
   */
  async getPatientAllergies(req: Request, res: Response) {
    const { patientId } = patientIdSchema.parse(req.params);

    // Verifica autorização
    const authenticatedPatientId = req.user?.sub;
    if (authenticatedPatientId !== patientId) {
      throw new AppError('Acesso negado', 403);
    }

    const bundle = await patientFHIRService.getPatientAllergies(patientId);

    return res.json(bundle);
  },

  /**
   * GET /fhir/procedures/:patientId
   * Busca procedimentos do paciente
   */
  async getPatientProcedures(req: Request, res: Response) {
    const { patientId } = patientIdSchema.parse(req.params);

    // Verifica autorização
    const authenticatedPatientId = req.user?.sub;
    if (authenticatedPatientId !== patientId) {
      throw new AppError('Acesso negado', 403);
    }

    const bundle = await patientFHIRService.getPatientProcedures(patientId);

    return res.json(bundle);
  },

  /**
   * GET /fhir/medications/:patientId
   * Busca medicamentos do paciente
   */
  async getPatientMedications(req: Request, res: Response) {
    const { patientId } = patientIdSchema.parse(req.params);

    // Verifica autorização
    const authenticatedPatientId = req.user?.sub;
    if (authenticatedPatientId !== patientId) {
      throw new AppError('Acesso negado', 403);
    }

    const bundle = await patientFHIRService.getPatientMedications(patientId);

    return res.json(bundle);
  },
};

