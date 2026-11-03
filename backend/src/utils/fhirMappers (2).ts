import type {
  Prisma,
  AllergyIntolerance,
  Condition,
  Encounter,
  Identifier as PrismaIdentifier,
  MedicationStatement,
  Observation as PrismaObservation,
  Patient as PrismaPatient,
  Procedure
} from "@prisma/client";
import type {
  AllergyIntoleranceResource,
  ConditionResource,
  EncounterResource,
  Identifier,
  MedicationStatementResource,
  ObservationResource,
  ObservationValue,
  PatientResource,
  ProcedureResource
} from "../types/fhir";

type PatientWithRelations = PrismaPatient & {
  names: {
    use: string | null;
    text: string | null;
    family: string | null;
    given: string | null;
  }[];
  identifiers: PrismaIdentifier[];
  telecoms?: Array<{
    system: string | null;
    value: string | null;
    use: string | null;
  }>;
  addresses?: Array<{
    use: string | null;
    type: string | null;
    text: string | null;
    line1: string | null;
    line2: string | null;
    district: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  }>;
};

export function mapPatientToResource(patient: PatientWithRelations): PatientResource {
  const identifier: Identifier[] = patient.identifiers.map((item) => ({
    use: item.use ?? undefined,
    system: item.system ?? undefined,
    value: item.value,
    type: item.typeCode
      ? {
          coding: [
            {
              system: item.system ?? undefined,
              code: item.typeCode ?? undefined,
              display: item.typeDisplay ?? undefined
            }
          ]
        }
      : undefined
  }));

  const patientResource: PatientResource = {
    resourceType: "Patient",
    id: patient.id,
    identifier,
    name: patient.names.map((name) => ({
      use: name.use ?? undefined,
      text: name.text ?? undefined,
      family: name.family ?? undefined,
      given: name.given ? name.given.split(" ") : undefined
    })),
    gender: patient.gender ?? undefined,
    birthDate: patient.birthDate?.toISOString().split("T")[0]
  };

  // Adiciona CPF e CNS se não estiverem nos identifiers
  if (patient.cpf) {
    const hasCpf = patientResource.identifier?.some(
      (id) => id.system?.includes("CPF") || id.value === patient.cpf
    );
    if (!hasCpf) {
      patientResource.identifier = patientResource.identifier || [];
      patientResource.identifier.push({
        system: "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRCPFCidadao",
        value: patient.cpf
      });
    }
  }

  if (patient.cns) {
    const hasCns = patientResource.identifier?.some(
      (id) => id.system?.includes("CNS") || id.value === patient.cns
    );
    if (!hasCns) {
      patientResource.identifier = patientResource.identifier || [];
      patientResource.identifier.push({
        system: "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRCNS",
        value: patient.cns
      });
    }
  }

  // Adiciona telecoms se disponíveis
  if ((patient as any).telecoms && (patient as any).telecoms.length > 0) {
    patientResource.telecom = (patient as any).telecoms.map((tel: any) => ({
      system: tel.system as any,
      value: tel.value ?? undefined,
      use: tel.use as any
    }));
  }

  // Adiciona addresses se disponíveis
  if ((patient as any).addresses && (patient as any).addresses.length > 0) {
    patientResource.address = (patient as any).addresses.map((addr: any) => ({
      use: addr.use as any,
      type: addr.type as any,
      text: addr.text ?? undefined,
      line: [addr.line1, addr.line2].filter(Boolean) as string[],
      city: addr.city ?? undefined,
      district: addr.district ?? undefined,
      state: addr.state ?? undefined,
      postalCode: addr.postalCode ?? undefined,
      country: addr.country ?? "BR"
    }));
  }

  return patientResource;
}

type EncounterWithOrg = Encounter & {
  serviceProvider?: {
    id: string;
    name: string;
  } | null;
};

export function mapEncountersToResource(encounters: EncounterWithOrg[]): EncounterResource[] {
  return encounters.map((encounter) => ({
    resourceType: "Encounter",
    id: encounter.id,
    status: encounter.status,
    class: encounter.classCode
      ? {
          code: encounter.classCode ?? undefined,
          display: encounter.classDisplay ?? undefined
        }
      : undefined,
    type: encounter.typeCode
      ? [
          {
            coding: [
              {
                code: encounter.typeCode ?? undefined,
                display: encounter.typeDisplay ?? undefined
              }
            ],
            text: encounter.typeDisplay ?? undefined
          }
        ]
      : undefined,
    reasonCode: encounter.reasonCode
      ? [
          {
            coding: [
              {
                code: encounter.reasonCode ?? undefined,
                display: encounter.reasonDisplay ?? undefined
              }
            ],
            text: encounter.reasonDisplay ?? undefined
          }
        ]
      : undefined,
    period: {
      start: encounter.start?.toISOString(),
      end: encounter.end?.toISOString()
    },
    serviceProvider: encounter.serviceProvider
      ? {
          id: encounter.serviceProvider.id,
          display: encounter.serviceProvider.name
        }
      : undefined
  }));
}

type ObservationWithRelations = PrismaObservation & {
  components: Array<{
    codeSystem: string | null;
    code: string | null;
    codeDisplay: string | null;
    valueQuantity: Prisma.Decimal | null;
    valueQuantityUnit: string | null;
    valueString: string | null;
    valueCodeSystem: string | null;
    valueCode: string | null;
    valueCodeDisplay: string | null;
  }>;
};

export function mapObservationsToResource(
  observations: ObservationWithRelations[]
): ObservationResource[] {
  return observations.map((observation) => {
    const value = resolveObservationValue(observation);

    return {
      resourceType: "Observation",
      id: observation.id,
      status: observation.status,
      category: observation.categoryCode
        ? [
            {
              coding: [
                {
                  code: observation.categoryCode ?? undefined,
                  display: observation.categoryDisplay ?? undefined
                }
              ],
              text: observation.categoryDisplay ?? undefined
            }
          ]
        : undefined,
      code: {
        coding: [
          {
            system: observation.codeSystem ?? undefined,
            code: observation.code ?? undefined,
            display: observation.codeDisplay ?? undefined
          }
        ],
        text: observation.codeDisplay ?? undefined
      },
      issued: observation.issued?.toISOString(),
      effectiveDateTime: observation.effectiveDateTime?.toISOString(),
      value,
      interpretation: observation.interpretationText
        ? [
            {
              text: observation.interpretationText ?? undefined,
              coding: [
                {
                  code: observation.interpretationCode ?? undefined
                }
              ]
            }
          ]
        : undefined
    };
  });
}

function resolveObservationValue(observation: PrismaObservation): ObservationValue | undefined {
  if (observation.valueQuantity !== null && observation.valueQuantity !== undefined) {
    return {
      kind: "Quantity",
      value: Number(observation.valueQuantity),
      unit: observation.valueQuantityUnit ?? undefined,
      system: "http://unitsofmeasure.org",
      code: observation.valueQuantityUnit ?? undefined
    };
  }

  if (observation.valueString) {
    return {
      kind: "String",
      value: observation.valueString
    };
  }

  if (observation.valueCode || observation.valueCodeDisplay) {
    return {
      kind: "CodeableConcept",
      value: {
        coding: [
          {
            system: observation.valueCodeSystem ?? undefined,
            code: observation.valueCode ?? undefined,
            display: observation.valueCodeDisplay ?? undefined
          }
        ],
        text: observation.valueCodeDisplay ?? undefined
      }
    };
  }

  return undefined;
}

export function mapAllergiesToResource(
  allergies: AllergyIntolerance[]
): AllergyIntoleranceResource[] {
  return allergies.map((allergy) => ({
    resourceType: "AllergyIntolerance",
    id: allergy.id,
    clinicalStatus: allergy.clinicalStatusText
      ? {
          text: allergy.clinicalStatusText ?? undefined
        }
      : undefined,
    verificationStatus: allergy.verificationStatus
      ? {
          text: allergy.verificationStatus ?? undefined
        }
      : undefined,
    code: allergy.codeDisplay
      ? {
          text: allergy.codeDisplay ?? undefined,
          coding: [
            {
              system: allergy.codeSystem ?? undefined,
              code: allergy.code ?? undefined,
              display: allergy.codeDisplay ?? undefined
            }
          ]
        }
      : undefined,
    criticality: allergy.criticality ?? undefined,
    lastOccurrence: allergy.lastOccurrence?.toISOString()
  }));
}

export function mapConditionsToResource(conditions: Condition[]): ConditionResource[] {
  return conditions.map((condition) => ({
    resourceType: "Condition",
    id: condition.id,
    clinicalStatus: condition.clinicalStatus
      ? {
          coding: [
            {
              code: condition.clinicalStatus,
              system: "http://terminology.hl7.org/CodeSystem/condition-clinical"
            }
          ],
          text: condition.clinicalStatus
        }
      : undefined,
    verificationStatus: condition.verificationStatus
      ? {
          coding: [
            {
              code: condition.verificationStatus,
              system: "http://terminology.hl7.org/CodeSystem/condition-ver-status"
            }
          ],
          text: condition.verificationStatus
        }
      : undefined,
    category: condition.categoryCode
      ? [
          {
            coding: [
              {
                code: condition.categoryCode
              }
            ]
          }
        ]
      : undefined,
    severity: condition.severity
      ? {
          coding: [
            {
              code: condition.severity
            }
          ],
          text: condition.severity
        }
      : undefined,
    code: condition.codeDisplay
      ? {
          coding: [
            {
              system: condition.codeSystem ?? undefined,
              code: condition.code ?? undefined,
              display: condition.codeDisplay ?? undefined
            }
          ],
          text: condition.codeDisplay ?? undefined
        }
      : undefined,
    onsetDateTime: condition.onsetDateTime?.toISOString(),
    abatementDateTime: condition.abatementDateTime?.toISOString(),
    recordedDate: condition.recordedDate?.toISOString(),
    note: condition.note ?? undefined
  }));
}

export function mapProceduresToResource(procedures: Procedure[]): ProcedureResource[] {
  return procedures.map((procedure) => ({
    resourceType: "Procedure",
    id: procedure.id,
    status: procedure.status ?? undefined,
    category: procedure.categoryCode
      ? {
          coding: [
            {
              code: procedure.categoryCode
            }
          ]
        }
      : undefined,
    code: procedure.codeDisplay
      ? {
          coding: [
            {
              system: procedure.codeSystem ?? undefined,
              code: procedure.code ?? undefined,
              display: procedure.codeDisplay ?? undefined
            }
          ],
          text: procedure.codeDisplay ?? undefined
        }
      : undefined,
    performedStart: procedure.performedStart?.toISOString(),
    performedEnd: procedure.performedEnd?.toISOString(),
    note: procedure.note ?? undefined
  }));
}

export function mapMedicationsToResource(
  medications: MedicationStatement[]
): MedicationStatementResource[] {
  return medications.map((medication) => ({
    resourceType: "MedicationStatement",
    id: medication.id,
    status: medication.status ?? undefined,
    category: medication.categoryCode
      ? {
          coding: [
            {
              code: medication.categoryCode
            }
          ],
          text: medication.categoryCode
        }
      : undefined,
    medication: medication.medicationDisplay
      ? {
          coding: [
            {
              code: medication.medicationCode ?? undefined,
              display: medication.medicationDisplay ?? undefined
            }
          ],
          text: medication.medicationDisplay ?? undefined
        }
      : undefined,
    dosage: medication.dosage ?? undefined,
    route: medication.route ?? undefined,
    effectiveStart: medication.effectiveStart?.toISOString(),
    effectiveEnd: medication.effectiveEnd?.toISOString(),
    taken: medication.taken ?? undefined,
    note: medication.note ?? undefined
  }));
}


