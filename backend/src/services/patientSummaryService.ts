import { patientRepository } from "../repositories/patientRepository";
import {
  mapAllergiesToResource,
  mapConditionToResource,
  mapEncountersToResource,
  mapMedicationToResource,
  mapObservationsToResource,
  mapPatientToResource,
  mapProceduresToResource
} from "../utils/fhirMappers";
import { AppError } from "../errors/AppError";

export async function getPatientSummary(patientId: string) {
  const history = await patientRepository.findPatientHistory(patientId);

  if (!history.patient) {
    throw new AppError("Paciente não encontrado", 404);
  }

  return {
    patient: mapPatientToResource(history.patient),
    encounters: mapEncountersToResource(history.encounters),
    observations: mapObservationsToResource(history.observations),
    allergies: mapAllergiesToResource(history.allergies),
    conditions: (history.conditions || []).map(mapConditionToResource),
    procedures: mapProceduresToResource(history.procedures),
    medications: (history.medications || []).map(mapMedicationToResource)
  };
}