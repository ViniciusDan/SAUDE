import type { RequestHandler } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middlewares/authenticate";
import { getPatientSummary } from "../services/patientSummaryService";
import { AppError } from "../errors/AppError";
import { patientRepository } from "../repositories/patientRepository";
import {
  mapPatientToResource,
  mapAllergyToResource,
  mapConditionToResource,
  mapMedicationToResource
} from "../utils/fhirMappers";

const paramsSchema = z.object({
  patientId: z.string().min(1)
});

const allergyParamsSchema = z.object({
  patientId: z.string().min(1),
  allergyId: z.string().min(1)
});

const conditionParamsSchema = z.object({
  patientId: z.string().min(1),
  conditionId: z.string().min(1)
});

const medicationParamsSchema = z.object({
  patientId: z.string().min(1),
  medicationId: z.string().min(1)
});

const updateProfileSchema = z.object({
  fullName: z.string().min(3, "Informe o nome completo"),
  gender: z.enum(["male", "female", "other", "unknown"]).optional().or(z.literal("")),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  addressLine1: z.string().max(120).optional().or(z.literal("")),
  addressLine2: z.string().max(120).optional().or(z.literal("")),
  district: z.string().max(80).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  state: z.string().max(2).optional().or(z.literal("")),
  postalCode: z.string().max(12).optional().or(z.literal(""))
});

const allergySchema = z.object({
  substance: z.string().min(2, "Informe a substância/alérgeno"),
  criticality: z.enum(["low", "high", "unable-to-assess"]).optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal(""))
});

const conditionSchema = z.object({
  name: z.string().min(2, "Informe a condição"),
  clinicalStatus: z.enum(["active", "inactive", "resolved"]).optional().or(z.literal("")),
  severity: z.enum(["mild", "moderate", "severe"]).optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal(""))
});

const medicationSchema = z.object({
  name: z.string().min(2, "Informe o medicamento"),
  status: z.enum(["active", "completed", "stopped"]).optional().or(z.literal("")),
  dosage: z.string().max(120).optional().or(z.literal("")),
  route: z.string().max(80).optional().or(z.literal("")),
  note: z.string().max(500).optional().or(z.literal(""))
});

function ensurePatientOwnership(req: AuthenticatedRequest, patientId: string) {
  if (req.user && req.user.sub !== patientId) {
    throw new AppError("Acesso negado", 403);
  }
}

export const getPatientSummaryController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const summary = await getPatientSummary(parsedParams.patientId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

export const updatePatientProfileController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const parsedBody = updateProfileSchema.parse(req.body);

    const updatedPatient = await patientRepository.updateProfile(parsedParams.patientId, {
      fullName: parsedBody.fullName,
      gender: parsedBody.gender || undefined,
      birthDate: parsedBody.birthDate || undefined,
      phone: parsedBody.phone || undefined,
      email: parsedBody.email || undefined,
      addressLine1: parsedBody.addressLine1 || undefined,
      addressLine2: parsedBody.addressLine2 || undefined,
      district: parsedBody.district || undefined,
      city: parsedBody.city || undefined,
      state: parsedBody.state || undefined,
      postalCode: parsedBody.postalCode || undefined
    });

    if (!updatedPatient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    res.json({
      message: "Perfil atualizado com sucesso",
      patient: mapPatientToResource(updatedPatient)
    });
  } catch (error) {
    next(error);
  }
};

export const listPatientAllergiesController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const allergies = await patientRepository.listEditableAllergies(parsedParams.patientId);
    res.json(allergies.map(mapAllergyToResource));
  } catch (error) {
    next(error);
  }
};

export const createPatientAllergyController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);
    const parsedBody = allergySchema.parse(req.body);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const allergy = await patientRepository.createEditableAllergy(parsedParams.patientId, {
      substance: parsedBody.substance,
      criticality: parsedBody.criticality || undefined,
      note: parsedBody.note || undefined
    });

    res.status(201).json(mapAllergyToResource(allergy));
  } catch (error) {
    next(error);
  }
};

export const updatePatientAllergyController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = allergyParamsSchema.parse(req.params);
    const parsedBody = allergySchema.parse(req.body);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const allergy = await patientRepository.updateEditableAllergy(parsedParams.patientId, parsedParams.allergyId, {
      substance: parsedBody.substance,
      criticality: parsedBody.criticality || undefined,
      note: parsedBody.note || undefined
    });

    if (!allergy) {
      throw new AppError("Alergia não encontrada", 404);
    }

    res.json(mapAllergyToResource(allergy));
  } catch (error) {
    next(error);
  }
};

export const deletePatientAllergyController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = allergyParamsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const deleted = await patientRepository.deleteEditableAllergy(parsedParams.patientId, parsedParams.allergyId);

    if (!deleted) {
      throw new AppError("Alergia não encontrada", 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listPatientConditionsController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const conditions = await patientRepository.listEditableConditions(parsedParams.patientId);
    res.json(conditions.map(mapConditionToResource));
  } catch (error) {
    next(error);
  }
};

export const createPatientConditionController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);
    const parsedBody = conditionSchema.parse(req.body);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const condition = await patientRepository.createEditableCondition(parsedParams.patientId, {
      name: parsedBody.name,
      clinicalStatus: parsedBody.clinicalStatus || undefined,
      severity: parsedBody.severity || undefined,
      note: parsedBody.note || undefined
    });

    res.status(201).json(mapConditionToResource(condition));
  } catch (error) {
    next(error);
  }
};

export const updatePatientConditionController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = conditionParamsSchema.parse(req.params);
    const parsedBody = conditionSchema.parse(req.body);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const condition = await patientRepository.updateEditableCondition(parsedParams.patientId, parsedParams.conditionId, {
      name: parsedBody.name,
      clinicalStatus: parsedBody.clinicalStatus || undefined,
      severity: parsedBody.severity || undefined,
      note: parsedBody.note || undefined
    });

    if (!condition) {
      throw new AppError("Condição não encontrada", 404);
    }

    res.json(mapConditionToResource(condition));
  } catch (error) {
    next(error);
  }
};

export const deletePatientConditionController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = conditionParamsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const deleted = await patientRepository.deleteEditableCondition(parsedParams.patientId, parsedParams.conditionId);

    if (!deleted) {
      throw new AppError("Condição não encontrada", 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listPatientMedicationsController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const medications = await patientRepository.listEditableMedications(parsedParams.patientId);
    res.json(medications.map(mapMedicationToResource));
  } catch (error) {
    next(error);
  }
};

export const createPatientMedicationController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = paramsSchema.parse(req.params);
    const parsedBody = medicationSchema.parse(req.body);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const medication = await patientRepository.createEditableMedication(parsedParams.patientId, {
      name: parsedBody.name,
      status: parsedBody.status || undefined,
      dosage: parsedBody.dosage || undefined,
      route: parsedBody.route || undefined,
      note: parsedBody.note || undefined
    });

    res.status(201).json(mapMedicationToResource(medication));
  } catch (error) {
    next(error);
  }
};

export const updatePatientMedicationController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = medicationParamsSchema.parse(req.params);
    const parsedBody = medicationSchema.parse(req.body);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const medication = await patientRepository.updateEditableMedication(parsedParams.patientId, parsedParams.medicationId, {
      name: parsedBody.name,
      status: parsedBody.status || undefined,
      dosage: parsedBody.dosage || undefined,
      route: parsedBody.route || undefined,
      note: parsedBody.note || undefined
    });

    if (!medication) {
      throw new AppError("Medicamento não encontrado", 404);
    }

    res.json(mapMedicationToResource(medication));
  } catch (error) {
    next(error);
  }
};

export const deletePatientMedicationController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsedParams = medicationParamsSchema.parse(req.params);

    ensurePatientOwnership(authReq, parsedParams.patientId);

    const deleted = await patientRepository.deleteEditableMedication(parsedParams.patientId, parsedParams.medicationId);

    if (!deleted) {
      throw new AppError("Medicamento não encontrado", 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};