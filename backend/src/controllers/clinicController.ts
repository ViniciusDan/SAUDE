import type { RequestHandler } from "express";
import { z } from "zod";
import { patientRepository } from "../repositories/patientRepository";
import { getPatientSummary } from "../services/patientSummaryService";
import { AppError } from "../errors/AppError";

const searchPatientSchema = z.object({
  cpf: z.string().min(11, "CPF inválido")
});

const patientParamsSchema = z.object({
  patientId: z.string().min(1)
});

export const searchPatientByCpfController: RequestHandler = async (req, res, next) => {
  try {
    const parsedQuery = searchPatientSchema.parse(req.query);

    const patient = await patientRepository.findByCPF(parsedQuery.cpf);

    if (!patient) {
      throw new AppError("Paciente não encontrado", 404);
    }

    return res.json({
      id: patient.id,
      cpf: patient.cpf,
      name:
        patient.names?.[0]?.text ||
        [patient.names?.[0]?.given, patient.names?.[0]?.family].filter(Boolean).join(" ") ||
        "Paciente sem nome",
      birthDate: patient.birthDate,
      gender: patient.gender
    });
  } catch (error) {
    next(error);
  }
};

export const getClinicPatientSummaryController: RequestHandler = async (req, res, next) => {
  try {
    const parsedParams = patientParamsSchema.parse(req.params);
    const summary = await getPatientSummary(parsedParams.patientId);
    return res.json(summary);
  } catch (error) {
    next(error);
  }
};