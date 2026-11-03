import axios from "axios";
import type { PatientSummaryBundle } from "../types/fhir";

const API_URL = "/api";

async function getPatientSummary(patientId: string, token: string): Promise<PatientSummaryBundle> {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/summary`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.warn("Falling back to mock data, erro ao chamar backend:", error);
    return getMockSummary();
  }
}

function getMockSummary(): PatientSummaryBundle {
  const now = new Date();
  return {
    patient: {
      id: "patient-123",
      resourceType: "Patient",
      name: [
        {
          use: "official",
          given: ["Maria"],
          family: "Oliveira",
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
        id: "encounter-001",
        resourceType: "Encounter",
        status: "finished",
        class: {
          code: "AMB",
          display: "Ambulatorial"
        },
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
      },
      {
        id: "encounter-002",
        resourceType: "Encounter",
        status: "finished",
        type: [
          {
            text: "Coleta de exame de sangue"
          }
        ],
        period: {
          start: "2025-09-20T08:30:00-03:00",
          end: "2025-09-20T09:15:00-03:00"
        },
        serviceProvider: {
          id: "org-clinica-vida-nova",
          display: "Clínica Vida Nova"
        }
      },
      {
        id: "encounter-003",
        resourceType: "Encounter",
        status: "finished",
        type: [
          {
            text: "Atendimento de emergência"
          }
        ],
        period: {
          start: "2025-08-11T23:20:00-03:00",
          end: "2025-08-12T02:15:00-03:00"
        },
        serviceProvider: {
          id: "org-hospital-municipal",
          display: "Hospital Municipal Esperança"
        },
        reasonCode: [
          {
            text: "Dor abdominal intensa"
          }
        ]
      }
    ],
    observations: [
      {
        id: "obs-hemograma",
        resourceType: "Observation",
        status: "final",
        category: [{ text: "Laboratório" }],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "58410-2",
              display: "Hemograma completo"
            }
          ],
          text: "Hemograma completo"
        },
        issued: now.toISOString(),
        value: {
          kind: "String",
          value: "Dentro da normalidade"
        }
      },
      {
        id: "obs-glicose",
        resourceType: "Observation",
        status: "final",
        category: [{ text: "Laboratório" }],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "14743-9",
              display: "Glicose plasmática em jejum"
            }
          ],
          text: "Glicose em jejum"
        },
        effectiveDateTime: "2025-09-20T08:45:00-03:00",
        value: {
          kind: "Quantity",
          value: 97,
          unit: "mg/dL",
          system: "http://unitsofmeasure.org",
          code: "mg/dL"
        },
        interpretation: [
          {
            text: "Normal"
          }
        ]
      },
      {
        id: "obs-urina",
        resourceType: "Observation",
        status: "final",
        category: [{ text: "Laboratório" }],
        code: {
          text: "Urina tipo I"
        },
        value: {
          kind: "String",
          value: "Sem alterações significativas"
        }
      }
    ],
    allergies: [
      {
        id: "allergy-001",
        resourceType: "AllergyIntolerance",
        code: {
          text: "Dipirona"
        },
        criticality: "high",
        clinicalStatus: {
          text: "Ativa"
        }
      },
      {
        id: "allergy-002",
        resourceType: "AllergyIntolerance",
        code: {
          text: "Crustáceos"
        },
        criticality: "high",
        clinicalStatus: {
          text: "Ativa"
        }
      }
    ],
    conditions: [],
    procedures: [],
    medications: []
  };
}

export const fhirClient = {
  getPatientSummary
};


