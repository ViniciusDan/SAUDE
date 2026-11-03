/**
 * FHIRMapper - Conversor unificado de entidades Prisma para recursos FHIR BR Core
 * Simula o comportamento de resposta da RNDS (RAC)
 */

import type { Patient, Practitioner, Organization, Encounter, Observation, ObservationComponent, AllergyIntolerance, Condition, Procedure, MedicationStatement, Identifier, HumanName, ContactPoint, Address } from '@prisma/client';
import { BR_CORE_PROFILES, BR_IDENTIFIER_SYSTEMS, type FHIRBundle, type FHIRPatient, type FHIRPractitioner, type FHIROrganization, type FHIREncounter, type FHIRObservation, type FHIRCondition, type FHIRAllergyIntolerance, type FHIRProcedure, type FHIRMedicationStatement } from './types';

// Tipos auxiliares com relações
type PatientWithRelations = Patient & {
  identifiers?: Identifier[];
  names?: HumanName[];
  telecoms?: ContactPoint[];
  addresses?: Address[];
};

type PractitionerWithRelations = Practitioner & {
  identifiers?: Identifier[];
  names?: HumanName[];
  telecoms?: ContactPoint[];
};

type OrganizationWithRelations = Organization & {
  identifiers?: Identifier[];
  telecoms?: ContactPoint[];
  addresses?: Address[];
};

type EncounterWithRelations = Encounter & {
  identifiers?: Identifier[];
  patient?: Patient;
  practitioner?: Practitioner;
  organization?: Organization;
  serviceProvider?: Organization;
};

type ObservationWithRelations = Observation & {
  components?: ObservationComponent[];
  patient?: Patient;
  encounter?: Encounter;
  performer?: Practitioner;
};

/**
 * Cria um Bundle FHIR vazio
 */
export function createBundle(type: 'collection' | 'searchset' = 'collection'): FHIRBundle {
  return {
    resourceType: 'Bundle',
    type,
    timestamp: new Date().toISOString(),
    total: 0,
    entry: [],
  };
}

/**
 * Mapeia Patient para FHIR BR Core Patient
 */
export function mapPatientToFHIR(patient: PatientWithRelations): FHIRPatient {
  const fhirPatient: FHIRPatient = {
    resourceType: 'Patient',
    id: patient.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.PATIENT],
    },
    active: patient.active,
    gender: patient.gender as any,
    birthDate: patient.birthDate ? patient.birthDate.toISOString().split('T')[0] : undefined,
    deceasedBoolean: patient.deceased || undefined,
  };

  // Identifiers
  if (patient.identifiers && patient.identifiers.length > 0) {
    fhirPatient.identifier = patient.identifiers.map((id) => ({
      use: (id.use as any) || 'official',
      system: id.system || undefined,
      value: id.value,
      type: id.typeCode
        ? {
            coding: [{ code: id.typeCode, display: id.typeDisplay || undefined }],
          }
        : undefined,
    }));
  }

  // Adiciona CPF e CNS como identificadores principais
  if (patient.cpf) {
    fhirPatient.identifier = fhirPatient.identifier || [];
    fhirPatient.identifier.push({
      use: 'official',
      system: BR_IDENTIFIER_SYSTEMS.CPF,
      value: patient.cpf,
    });
  }

  if (patient.cns) {
    fhirPatient.identifier = fhirPatient.identifier || [];
    fhirPatient.identifier.push({
      use: 'official',
      system: BR_IDENTIFIER_SYSTEMS.CNS,
      value: patient.cns,
    });
  }

  // Names
  if (patient.names && patient.names.length > 0) {
    fhirPatient.name = patient.names.map((name) => ({
      use: (name.use as any) || 'official',
      text: name.text || undefined,
      family: name.family || undefined,
      given: name.given ? [name.given] : undefined,
      period: name.periodStart || name.periodEnd
        ? {
            start: name.periodStart?.toISOString(),
            end: name.periodEnd?.toISOString(),
          }
        : undefined,
    }));
  }

  // Telecoms
  if (patient.telecoms && patient.telecoms.length > 0) {
    fhirPatient.telecom = patient.telecoms.map((tel) => ({
      system: tel.system as any,
      value: tel.value || undefined,
      use: tel.use as any,
      rank: tel.rank || undefined,
    }));
  }

  // Addresses
  if (patient.addresses && patient.addresses.length > 0) {
    fhirPatient.address = patient.addresses.map((addr) => ({
      use: addr.use as any,
      type: addr.type as any,
      text: addr.text || undefined,
      line: [addr.line1, addr.line2].filter(Boolean) as string[],
      city: addr.city || undefined,
      district: addr.district || undefined,
      state: addr.state || undefined,
      postalCode: addr.postalCode || undefined,
      country: addr.country || 'BR',
    }));
  }

  // MaritalStatus
  if (patient.maritalStatus) {
    fhirPatient.maritalStatus = {
      coding: [{ code: patient.maritalStatus }],
    };
  }

  // Communication
  if (patient.language) {
    fhirPatient.communication = [
      {
        language: {
          coding: [{ code: patient.language }],
        },
        preferred: true,
      },
    ];
  }

  return fhirPatient;
}

/**
 * Mapeia Practitioner para FHIR BR Core Practitioner
 */
export function mapPractitionerToFHIR(practitioner: PractitionerWithRelations): FHIRPractitioner {
  const fhirPractitioner: FHIRPractitioner = {
    resourceType: 'Practitioner',
    id: practitioner.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.PRACTITIONER],
    },
    active: practitioner.active,
    gender: practitioner.gender as any,
    birthDate: practitioner.birthDate ? practitioner.birthDate.toISOString().split('T')[0] : undefined,
  };

  // Identifiers
  if (practitioner.identifiers && practitioner.identifiers.length > 0) {
    fhirPractitioner.identifier = practitioner.identifiers.map((id) => ({
      use: (id.use as any) || 'official',
      system: id.system || undefined,
      value: id.value,
    }));
  }

  // CPF e CNS
  if (practitioner.cpf) {
    fhirPractitioner.identifier = fhirPractitioner.identifier || [];
    fhirPractitioner.identifier.push({
      use: 'official',
      system: BR_IDENTIFIER_SYSTEMS.CPF,
      value: practitioner.cpf,
    });
  }

  if (practitioner.cns) {
    fhirPractitioner.identifier = fhirPractitioner.identifier || [];
    fhirPractitioner.identifier.push({
      use: 'official',
      system: BR_IDENTIFIER_SYSTEMS.CNS,
      value: practitioner.cns,
    });
  }

  // Names
  if (practitioner.names && practitioner.names.length > 0) {
    fhirPractitioner.name = practitioner.names.map((name) => ({
      use: (name.use as any) || 'official',
      text: name.text || undefined,
      family: name.family || undefined,
      given: name.given ? [name.given] : undefined,
    }));
  }

  // Telecoms
  if (practitioner.telecoms && practitioner.telecoms.length > 0) {
    fhirPractitioner.telecom = practitioner.telecoms.map((tel) => ({
      system: tel.system as any,
      value: tel.value || undefined,
      use: tel.use as any,
    }));
  }

  // Qualification
  if (practitioner.qualificationCode) {
    fhirPractitioner.qualification = [
      {
        code: {
          coding: [
            {
              system: BR_IDENTIFIER_SYSTEMS.CBO,
              code: practitioner.qualificationCode,
              display: practitioner.qualificationText || undefined,
            },
          ],
        },
      },
    ];
  }

  return fhirPractitioner;
}

/**
 * Mapeia Organization para FHIR BR Core Organization
 */
export function mapOrganizationToFHIR(organization: OrganizationWithRelations): FHIROrganization {
  const fhirOrganization: FHIROrganization = {
    resourceType: 'Organization',
    id: organization.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.ORGANIZATION],
    },
    active: organization.active,
    name: organization.name,
    alias: organization.alias ? [organization.alias] : undefined,
  };

  // Identifiers
  if (organization.identifiers && organization.identifiers.length > 0) {
    fhirOrganization.identifier = organization.identifiers.map((id) => ({
      use: (id.use as any) || 'official',
      system: id.system || undefined,
      value: id.value,
    }));
  }

  // CNES
  if (organization.cnes) {
    fhirOrganization.identifier = fhirOrganization.identifier || [];
    fhirOrganization.identifier.push({
      use: 'official',
      system: BR_IDENTIFIER_SYSTEMS.CNES,
      value: organization.cnes,
    });
  }

  // Type
  if (organization.typeCode) {
    fhirOrganization.type = [
      {
        coding: [
          {
            code: organization.typeCode,
            display: organization.typeDisplay || undefined,
          },
        ],
      },
    ];
  }

  // Telecoms
  if (organization.telecoms && organization.telecoms.length > 0) {
    fhirOrganization.telecom = organization.telecoms.map((tel) => ({
      system: tel.system as any,
      value: tel.value || undefined,
      use: tel.use as any,
    }));
  }

  // Addresses
  if (organization.addresses && organization.addresses.length > 0) {
    fhirOrganization.address = organization.addresses.map((addr) => ({
      use: addr.use as any,
      type: addr.type as any,
      text: addr.text || undefined,
      line: [addr.line1, addr.line2].filter(Boolean) as string[],
      city: addr.city || undefined,
      district: addr.district || undefined,
      state: addr.state || undefined,
      postalCode: addr.postalCode || undefined,
      country: addr.country || 'BR',
    }));
  }

  return fhirOrganization;
}

/**
 * Mapeia Encounter para FHIR BR Core Encounter
 */
export function mapEncounterToFHIR(encounter: EncounterWithRelations): FHIREncounter {
  const fhirEncounter: FHIREncounter = {
    resourceType: 'Encounter',
    id: encounter.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.ENCOUNTER],
    },
    status: encounter.status as any,
    class: {
      code: encounter.classCode || 'AMB',
      display: encounter.classDisplay || undefined,
    },
    subject: {
      reference: `Patient/${encounter.patient?.fhirId || encounter.patientId}`,
      display: encounter.patient?.names?.[0]?.text || undefined,
    },
  };

  // Identifiers
  if (encounter.identifiers && encounter.identifiers.length > 0) {
    fhirEncounter.identifier = encounter.identifiers.map((id) => ({
      use: (id.use as any) || 'official',
      system: id.system || undefined,
      value: id.value,
    }));
  }

  // Type
  if (encounter.typeCode) {
    fhirEncounter.type = [
      {
        coding: [
          {
            code: encounter.typeCode,
            display: encounter.typeDisplay || undefined,
          },
        ],
      },
    ];
  }

  // Participant (Practitioner)
  if (encounter.practitioner) {
    fhirEncounter.participant = [
      {
        individual: {
          reference: `Practitioner/${encounter.practitioner.fhirId}`,
          display: encounter.practitioner.names?.[0]?.text || undefined,
        },
      },
    ];
  }

  // Period
  if (encounter.start || encounter.end) {
    fhirEncounter.period = {
      start: encounter.start?.toISOString(),
      end: encounter.end?.toISOString(),
    };
  }

  // ReasonCode
  if (encounter.reasonCode) {
    fhirEncounter.reasonCode = [
      {
        coding: [
          {
            code: encounter.reasonCode,
            display: encounter.reasonDisplay || undefined,
          },
        ],
      },
    ];
  }

  // ServiceProvider
  if (encounter.serviceProvider) {
    fhirEncounter.serviceProvider = {
      reference: `Organization/${encounter.serviceProvider.fhirId}`,
      display: encounter.serviceProvider.name,
    };
  }

  return fhirEncounter;
}

/**
 * Mapeia Observation para FHIR BR Core Observation
 */
export function mapObservationToFHIR(observation: ObservationWithRelations): FHIRObservation {
  const fhirObservation: FHIRObservation = {
    resourceType: 'Observation',
    id: observation.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.OBSERVATION],
    },
    status: observation.status as any,
    code: {
      coding: [
        {
          system: observation.codeSystem || undefined,
          code: observation.code || undefined,
          display: observation.codeDisplay || undefined,
        },
      ],
    },
    subject: {
      reference: `Patient/${observation.patient?.fhirId || observation.patientId}`,
    },
  };

  // Category
  if (observation.categoryCode) {
    fhirObservation.category = [
      {
        coding: [
          {
            code: observation.categoryCode,
            display: observation.categoryDisplay || undefined,
          },
        ],
      },
    ];
  }

  // Encounter
  if (observation.encounterId) {
    fhirObservation.encounter = {
      reference: `Encounter/${observation.encounterId}`,
    };
  }

  // EffectiveDateTime
  if (observation.effectiveDateTime) {
    fhirObservation.effectiveDateTime = observation.effectiveDateTime.toISOString();
  }

  // Issued
  if (observation.issued) {
    fhirObservation.issued = observation.issued.toISOString();
  }

  // Performer
  if (observation.performer) {
    fhirObservation.performer = [
      {
        reference: `Practitioner/${observation.performer.fhirId}`,
        display: observation.performer.names?.[0]?.text || undefined,
      },
    ];
  }

  // Value
  if (observation.valueQuantity !== null) {
    fhirObservation.valueQuantity = {
      value: Number(observation.valueQuantity),
      unit: observation.valueQuantityUnit || undefined,
    };
  } else if (observation.valueString) {
    fhirObservation.valueString = observation.valueString;
  } else if (observation.valueCode) {
    fhirObservation.valueCodeableConcept = {
      coding: [
        {
          system: observation.valueCodeSystem || undefined,
          code: observation.valueCode,
          display: observation.valueCodeDisplay || undefined,
        },
      ],
    };
  }

  // Interpretation
  if (observation.interpretationCode) {
    fhirObservation.interpretation = [
      {
        coding: [
          {
            code: observation.interpretationCode,
          },
        ],
        text: observation.interpretationText || undefined,
      },
    ];
  }

  // Note
  if (observation.note) {
    fhirObservation.note = [
      {
        text: observation.note,
      },
    ];
  }

  // Components
  if (observation.components && observation.components.length > 0) {
    fhirObservation.component = observation.components.map((comp) => ({
      code: {
        coding: [
          {
            system: comp.codeSystem || undefined,
            code: comp.code || undefined,
            display: comp.codeDisplay || undefined,
          },
        ],
      },
      valueQuantity: comp.valueQuantity
        ? {
            value: Number(comp.valueQuantity),
            unit: comp.valueQuantityUnit || undefined,
          }
        : undefined,
      valueString: comp.valueString || undefined,
      valueCodeableConcept: comp.valueCode
        ? {
            coding: [
              {
                system: comp.valueCodeSystem || undefined,
                code: comp.valueCode,
                display: comp.valueCodeDisplay || undefined,
              },
            ],
          }
        : undefined,
    }));
  }

  return fhirObservation;
}

/**
 * Mapeia Condition para FHIR BR Core Condition
 */
export function mapConditionToFHIR(condition: Condition): FHIRCondition {
  const fhirCondition: FHIRCondition = {
    resourceType: 'Condition',
    id: condition.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.CONDITION],
    },
    subject: {
      reference: `Patient/${condition.patientId}`,
    },
  };

  // ClinicalStatus
  if (condition.clinicalStatus) {
    fhirCondition.clinicalStatus = {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: condition.clinicalStatus,
        },
      ],
    };
  }

  // VerificationStatus
  if (condition.verificationStatus) {
    fhirCondition.verificationStatus = {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: condition.verificationStatus,
        },
      ],
    };
  }

  // Category
  if (condition.categoryCode) {
    fhirCondition.category = [
      {
        coding: [
          {
            code: condition.categoryCode,
          },
        ],
      },
    ];
  }

  // Severity
  if (condition.severity) {
    fhirCondition.severity = {
      coding: [
        {
          code: condition.severity,
        },
      ],
    };
  }

  // Code (CID-10, etc)
  if (condition.code) {
    fhirCondition.code = {
      coding: [
        {
          system: condition.codeSystem || 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRCategoriaCondicao',
          code: condition.code,
          display: condition.codeDisplay || undefined,
        },
      ],
    };
  }

  // OnsetDateTime
  if (condition.onsetDateTime) {
    fhirCondition.onsetDateTime = condition.onsetDateTime.toISOString();
  }

  // AbatementDateTime
  if (condition.abatementDateTime) {
    fhirCondition.abatementDateTime = condition.abatementDateTime.toISOString();
  }

  // RecordedDate
  if (condition.recordedDate) {
    fhirCondition.recordedDate = condition.recordedDate.toISOString();
  }

  // Recorder
  if (condition.recorderId) {
    fhirCondition.recorder = {
      reference: `Practitioner/${condition.recorderId}`,
    };
  }

  // Note
  if (condition.note) {
    fhirCondition.note = [
      {
        text: condition.note,
      },
    ];
  }

  return fhirCondition;
}

/**
 * Mapeia AllergyIntolerance para FHIR BR Core AllergyIntolerance
 */
export function mapAllergyIntoleranceToFHIR(allergy: AllergyIntolerance): FHIRAllergyIntolerance {
  const fhirAllergy: FHIRAllergyIntolerance = {
    resourceType: 'AllergyIntolerance',
    id: allergy.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.ALLERGY_INTOLERANCE],
    },
    patient: {
      reference: `Patient/${allergy.patientId}`,
    },
  };

  // ClinicalStatus
  if (allergy.clinicalStatusCode) {
    fhirAllergy.clinicalStatus = {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: allergy.clinicalStatusCode,
        },
      ],
      text: allergy.clinicalStatusText || undefined,
    };
  }

  // VerificationStatus
  if (allergy.verificationStatus) {
    fhirAllergy.verificationStatus = {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
          code: allergy.verificationStatus,
        },
      ],
    };
  }

  // Type
  if (allergy.type) {
    fhirAllergy.type = allergy.type as any;
  }

  // Category
  if (allergy.category) {
    fhirAllergy.category = [allergy.category as any];
  }

  // Criticality
  if (allergy.criticality) {
    fhirAllergy.criticality = allergy.criticality as any;
  }

  // Code
  if (allergy.code) {
    fhirAllergy.code = {
      coding: [
        {
          system: allergy.codeSystem || undefined,
          code: allergy.code,
          display: allergy.codeDisplay || undefined,
        },
      ],
    };
  }

  // RecordedDate
  if (allergy.recordedDate) {
    fhirAllergy.recordedDate = allergy.recordedDate.toISOString();
  }

  // Recorder
  if (allergy.recorderId) {
    fhirAllergy.recorder = {
      reference: `Practitioner/${allergy.recorderId}`,
    };
  }

  // LastOccurrence
  if (allergy.lastOccurrence) {
    fhirAllergy.lastOccurrence = allergy.lastOccurrence.toISOString();
  }

  // Note
  if (allergy.note) {
    fhirAllergy.note = [
      {
        text: allergy.note,
      },
    ];
  }

  return fhirAllergy;
}

/**
 * Mapeia Procedure para FHIR BR Core Procedure
 */
export function mapProcedureToFHIR(procedure: Procedure): FHIRProcedure {
  const fhirProcedure: FHIRProcedure = {
    resourceType: 'Procedure',
    id: procedure.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.PROCEDURE],
    },
    status: (procedure.status as any) || 'completed',
    subject: {
      reference: `Patient/${procedure.patientId}`,
    },
  };

  // Category
  if (procedure.categoryCode) {
    fhirProcedure.category = {
      coding: [
        {
          code: procedure.categoryCode,
        },
      ],
    };
  }

  // Code
  if (procedure.code) {
    fhirProcedure.code = {
      coding: [
        {
          system: procedure.codeSystem || undefined,
          code: procedure.code,
          display: procedure.codeDisplay || undefined,
        },
      ],
    };
  }

  // Encounter
  if (procedure.encounterId) {
    fhirProcedure.encounter = {
      reference: `Encounter/${procedure.encounterId}`,
    };
  }

  // PerformedPeriod
  if (procedure.performedStart || procedure.performedEnd) {
    fhirProcedure.performedPeriod = {
      start: procedure.performedStart?.toISOString(),
      end: procedure.performedEnd?.toISOString(),
    };
  } else if (procedure.performedStart) {
    fhirProcedure.performedDateTime = procedure.performedStart.toISOString();
  }

  // Performer
  if (procedure.performerId) {
    fhirProcedure.performer = [
      {
        actor: {
          reference: `Practitioner/${procedure.performerId}`,
        },
      },
    ];
  }

  // Note
  if (procedure.note) {
    fhirProcedure.note = [
      {
        text: procedure.note,
      },
    ];
  }

  return fhirProcedure;
}

/**
 * Mapeia MedicationStatement para FHIR BR Core MedicationStatement
 */
export function mapMedicationStatementToFHIR(medication: MedicationStatement): FHIRMedicationStatement {
  const fhirMedication: FHIRMedicationStatement = {
    resourceType: 'MedicationStatement',
    id: medication.fhirId,
    meta: {
      profile: [BR_CORE_PROFILES.MEDICATION_STATEMENT],
    },
    status: (medication.status as any) || 'active',
    subject: {
      reference: `Patient/${medication.patientId}`,
    },
  };

  // Category
  if (medication.categoryCode) {
    fhirMedication.category = {
      coding: [
        {
          code: medication.categoryCode,
        },
      ],
    };
  }

  // Medication
  if (medication.medicationCode) {
    fhirMedication.medicationCodeableConcept = {
      coding: [
        {
          code: medication.medicationCode,
          display: medication.medicationDisplay || undefined,
        },
      ],
    };
  }

  // EffectivePeriod
  if (medication.effectiveStart || medication.effectiveEnd) {
    fhirMedication.effectivePeriod = {
      start: medication.effectiveStart?.toISOString(),
      end: medication.effectiveEnd?.toISOString(),
    };
  }

  // InformationSource (recorder)
  if (medication.recorderId) {
    fhirMedication.informationSource = {
      reference: `Practitioner/${medication.recorderId}`,
    };
  }

  // Dosage
  if (medication.dosage || medication.route) {
    fhirMedication.dosage = [
      {
        text: medication.dosage || undefined,
        route: medication.route
          ? {
              coding: [
                {
                  code: medication.route,
                },
              ],
            }
          : undefined,
      },
    ];
  }

  // Note
  if (medication.note) {
    fhirMedication.note = [
      {
        text: medication.note,
      },
    ];
  }

  return fhirMedication;
}

