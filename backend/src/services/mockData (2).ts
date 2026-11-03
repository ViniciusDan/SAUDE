import type { PatientSummaryBundle } from "../types/fhir";

export const mockSummary: PatientSummaryBundle = {
  patient: {
    resourceType: "Patient",
    id: "patient-123",
    name: [
      {
        use: "official",
        text: "Maria Oliveira"
      }
    ],
    identifier: [
      {
        system: "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRCPFCidadao",
        value: "12345678910"
      }
    ],
    gender: "female",
    birthDate: "1985-05-10"
  },
  encounters: [
    {
      resourceType: "Encounter",
      id: "encounter-001",
      status: "finished",
      type: [
        {
          text: "Consulta de rotina"
        }
      ],
      period: {
        start: "2025-10-02T09:00:00-03:00",
        end: "2025-10-02T09:30:00-03:00"
      },
      serviceProvider: {
        id: "org-hospital-santa-luzia",
        display: "Hospital Santa Luzia"
      }
    }
  ],
  observations: [
    {
      resourceType: "Observation",
      id: "obs-hemograma",
      status: "final",
      category: [
        {
          text: "Laboratório"
        }
      ],
      code: {
        text: "Hemograma completo"
      },
      issued: new Date().toISOString(),
      value: {
        kind: "String",
        value: "Dentro da normalidade"
      }
    }
  ],
  allergies: [
    {
      resourceType: "AllergyIntolerance",
      id: "allergy-001",
      code: {
        text: "Dipirona"
      },
      criticality: "high"
    }
  ],
  conditions: [],
  procedures: [],
  medications: []
};


