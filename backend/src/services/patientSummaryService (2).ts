import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { prisma } from "../lib/prisma";
import type { PatientSummaryBundle } from "../types/fhir";
import {
  mapAllergiesToResource,
  mapConditionsToResource,
  mapEncountersToResource,
  mapMedicationsToResource,
  mapObservationsToResource,
  mapPatientToResource,
  mapProceduresToResource
} from "../utils/fhirMappers";
import { mockSummary } from "./mockData";

export async function getPatientSummary(patientId: string): Promise<PatientSummaryBundle> {
  if (env.ENABLE_MOCK_AUTH && patientId === mockSummary.patient.id) {
    return mockSummary;
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      names: true,
      identifiers: true,
      telecoms: true,
      addresses: true
    }
  });

  if (!patient) {
    throw new AppError("Paciente não encontrado", 404);
  }

  const [encounters, observations, allergies, conditions, procedures, medications] =
    await Promise.all([
      prisma.encounter.findMany({
        where: { patientId },
        orderBy: { start: "desc" },
        take: 10,
        include: {
          serviceProvider: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.observation.findMany({
        where: { patientId },
        orderBy: { effectiveDateTime: "desc" },
        take: 15,
        include: {
          components: true
        }
      }),
      prisma.allergyIntolerance.findMany({
        where: { patientId },
        orderBy: { updatedAt: "desc" },
        take: 15
      }),
      prisma.condition.findMany({
        where: { patientId },
        orderBy: { recordedDate: "desc" },
        take: 20
      }),
      prisma.procedure.findMany({
        where: { patientId },
        orderBy: { performedStart: "desc" },
        take: 20
      }),
      prisma.medicationStatement.findMany({
        where: { patientId },
        orderBy: { effectiveStart: "desc" },
        take: 20
      })
    ]);

  return {
    patient: mapPatientToResource(patient),
    encounters: mapEncountersToResource(encounters),
    observations: mapObservationsToResource(observations),
    allergies: mapAllergiesToResource(allergies),
    conditions: mapConditionsToResource(conditions),
    procedures: mapProceduresToResource(procedures),
    medications: mapMedicationsToResource(medications)
  };
}


