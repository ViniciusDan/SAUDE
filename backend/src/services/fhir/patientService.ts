/**
 * FHIR Patient Service - Serviço para consulta de pacientes no formato FHIR
 * Simula o comportamento da RNDS (RAC)
 */

import { patientRepository } from '../../repositories/patientRepository';
import { createBundle, mapPatientToFHIR, mapEncounterToFHIR, mapObservationToFHIR, mapConditionToFHIR, mapAllergyIntoleranceToFHIR, mapProcedureToFHIR, mapMedicationStatementToFHIR } from '../../domain/fhir';
import type { FHIRBundle } from '../../domain/fhir';
import { AppError } from '../../errors/AppError';

export const patientFHIRService = {
  /**
   * Busca paciente por CPF e retorna recurso FHIR
   */
  async getPatientByCPF(cpf: string): Promise<FHIRBundle> {
    const patient = await patientRepository.findByCPF(cpf);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    const bundle = createBundle('searchset');
    bundle.total = 1;
    bundle.entry.push({
      fullUrl: `Patient/${patient.fhirId}`,
      resource: mapPatientToFHIR(patient),
    });

    return bundle;
  },

  /**
   * Busca histórico completo do paciente em formato FHIR Bundle
   * Simula a resposta do RAC da RNDS
   */
  async getPatientHistory(patientId: string): Promise<FHIRBundle> {
    const history = await patientRepository.findPatientHistory(patientId);

    if (!history.patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    const bundle = createBundle('collection');

    // Adiciona o paciente
    bundle.entry.push({
      fullUrl: `Patient/${history.patient.fhirId}`,
      resource: mapPatientToFHIR(history.patient),
    });

    // Adiciona encontros
    history.encounters.forEach((encounter) => {
      bundle.entry.push({
        fullUrl: `Encounter/${encounter.fhirId}`,
        resource: mapEncounterToFHIR(encounter),
      });
    });

    // Adiciona observações
    history.observations.forEach((observation) => {
      bundle.entry.push({
        fullUrl: `Observation/${observation.fhirId}`,
        resource: mapObservationToFHIR(observation),
      });
    });

    // Adiciona condições
    history.conditions.forEach((condition) => {
      bundle.entry.push({
        fullUrl: `Condition/${condition.fhirId}`,
        resource: mapConditionToFHIR(condition),
      });
    });

    // Adiciona alergias
    history.allergies.forEach((allergy) => {
      bundle.entry.push({
        fullUrl: `AllergyIntolerance/${allergy.fhirId}`,
        resource: mapAllergyIntoleranceToFHIR(allergy),
      });
    });

    // Adiciona procedimentos
    history.procedures.forEach((procedure) => {
      bundle.entry.push({
        fullUrl: `Procedure/${procedure.fhirId}`,
        resource: mapProcedureToFHIR(procedure),
      });
    });

    // Adiciona medicamentos
    history.medications.forEach((medication) => {
      bundle.entry.push({
        fullUrl: `MedicationStatement/${medication.fhirId}`,
        resource: mapMedicationStatementToFHIR(medication),
      });
    });

    bundle.total = bundle.entry.length;
    bundle.timestamp = new Date().toISOString();

    return bundle;
  },

  /**
   * Busca encontros do paciente
   */
  async getPatientEncounters(patientId: string): Promise<FHIRBundle> {
    const encounters = await patientRepository.findEncounters(patientId);

    const bundle = createBundle('searchset');
    bundle.total = encounters.length;

    encounters.forEach((encounter) => {
      bundle.entry.push({
        fullUrl: `Encounter/${encounter.fhirId}`,
        resource: mapEncounterToFHIR(encounter),
      });
    });

    return bundle;
  },

  /**
   * Busca observações do paciente (exames, sinais vitais)
   */
  async getPatientObservations(patientId: string, category?: string): Promise<FHIRBundle> {
    const observations = await patientRepository.findObservations(patientId, category);

    const bundle = createBundle('searchset');
    bundle.total = observations.length;

    observations.forEach((observation) => {
      bundle.entry.push({
        fullUrl: `Observation/${observation.fhirId}`,
        resource: mapObservationToFHIR(observation),
      });
    });

    return bundle;
  },

  /**
   * Busca condições/problemas do paciente
   */
  async getPatientConditions(patientId: string): Promise<FHIRBundle> {
    const conditions = await patientRepository.findConditions(patientId);

    const bundle = createBundle('searchset');
    bundle.total = conditions.length;

    conditions.forEach((condition) => {
      bundle.entry.push({
        fullUrl: `Condition/${condition.fhirId}`,
        resource: mapConditionToFHIR(condition),
      });
    });

    return bundle;
  },

  /**
   * Busca alergias do paciente
   */
  async getPatientAllergies(patientId: string): Promise<FHIRBundle> {
    const allergies = await patientRepository.findAllergies(patientId);

    const bundle = createBundle('searchset');
    bundle.total = allergies.length;

    allergies.forEach((allergy) => {
      bundle.entry.push({
        fullUrl: `AllergyIntolerance/${allergy.fhirId}`,
        resource: mapAllergyIntoleranceToFHIR(allergy),
      });
    });

    return bundle;
  },

  /**
   * Busca procedimentos do paciente
   */
  async getPatientProcedures(patientId: string): Promise<FHIRBundle> {
    const procedures = await patientRepository.findProcedures(patientId);

    const bundle = createBundle('searchset');
    bundle.total = procedures.length;

    procedures.forEach((procedure) => {
      bundle.entry.push({
        fullUrl: `Procedure/${procedure.fhirId}`,
        resource: mapProcedureToFHIR(procedure),
      });
    });

    return bundle;
  },

  /**
   * Busca medicamentos do paciente
   */
  async getPatientMedications(patientId: string): Promise<FHIRBundle> {
    const medications = await patientRepository.findMedications(patientId);

    const bundle = createBundle('searchset');
    bundle.total = medications.length;

    medications.forEach((medication) => {
      bundle.entry.push({
        fullUrl: `MedicationStatement/${medication.fhirId}`,
        resource: mapMedicationStatementToFHIR(medication),
      });
    });

    return bundle;
  },
};

