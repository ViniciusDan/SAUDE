/**
 * Tipos FHIR BR Core
 * Baseados no padrão FHIR R4 e perfis BR Core
 */

// Bundle FHIR - estrutura padrão de resposta da RNDS
export interface FHIRBundle {
  resourceType: 'Bundle';
  type: 'collection' | 'searchset' | 'document';
  timestamp?: string;
  total?: number;
  entry: FHIRBundleEntry[];
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource: FHIRResource;
}

export type FHIRResource =
  | FHIRPatient
  | FHIREncounter
  | FHIRObservation
  | FHIRCondition
  | FHIRAllergyIntolerance
  | FHIRProcedure
  | FHIRMedicationStatement
  | FHIRPractitioner
  | FHIROrganization;

// Patient BR Core
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  meta?: {
    profile: string[];
  };
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  address?: FHIRAddress[];
  maritalStatus?: FHIRCodeableConcept;
  photo?: FHIRAttachment[];
  contact?: FHIRPatientContact[];
  communication?: Array<{
    language: FHIRCodeableConcept;
    preferred?: boolean;
  }>;
}

// Encounter BR Core
export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  meta?: {
    profile: string[];
  };
  identifier?: FHIRIdentifier[];
  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
  class: FHIRCoding;
  type?: FHIRCodeableConcept[];
  subject: FHIRReference;
  participant?: Array<{
    type?: FHIRCodeableConcept[];
    individual?: FHIRReference;
  }>;
  period?: FHIRPeriod;
  reasonCode?: FHIRCodeableConcept[];
  serviceProvider?: FHIRReference;
}

// Observation BR Core
export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  meta?: {
    profile: string[];
  };
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  encounter?: FHIRReference;
  effectiveDateTime?: string;
  issued?: string;
  performer?: FHIRReference[];
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  valueCodeableConcept?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  note?: FHIRAnnotation[];
  component?: Array<{
    code: FHIRCodeableConcept;
    valueQuantity?: FHIRQuantity;
    valueString?: string;
    valueCodeableConcept?: FHIRCodeableConcept;
  }>;
}

// Condition BR Core
export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  meta?: {
    profile: string[];
  };
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code?: FHIRCodeableConcept;
  subject: FHIRReference;
  encounter?: FHIRReference;
  onsetDateTime?: string;
  abatementDateTime?: string;
  recordedDate?: string;
  recorder?: FHIRReference;
  note?: FHIRAnnotation[];
}

// AllergyIntolerance BR Core
export interface FHIRAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id: string;
  meta?: {
    profile: string[];
  };
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: Array<'food' | 'medication' | 'environment' | 'biologic'>;
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: FHIRCodeableConcept;
  patient: FHIRReference;
  recordedDate?: string;
  recorder?: FHIRReference;
  lastOccurrence?: string;
  note?: FHIRAnnotation[];
}

// Procedure BR Core
export interface FHIRProcedure {
  resourceType: 'Procedure';
  id: string;
  meta?: {
    profile: string[];
  };
  status: 'preparation' | 'in-progress' | 'completed' | 'not-done' | 'stopped';
  category?: FHIRCodeableConcept;
  code?: FHIRCodeableConcept;
  subject: FHIRReference;
  encounter?: FHIRReference;
  performedDateTime?: string;
  performedPeriod?: FHIRPeriod;
  performer?: Array<{
    actor: FHIRReference;
  }>;
  note?: FHIRAnnotation[];
}

// MedicationStatement BR Core
export interface FHIRMedicationStatement {
  resourceType: 'MedicationStatement';
  id: string;
  meta?: {
    profile: string[];
  };
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold';
  category?: FHIRCodeableConcept;
  medicationCodeableConcept?: FHIRCodeableConcept;
  subject: FHIRReference;
  effectivePeriod?: FHIRPeriod;
  dateAsserted?: string;
  informationSource?: FHIRReference;
  dosage?: Array<{
    text?: string;
    route?: FHIRCodeableConcept;
    doseAndRate?: Array<{
      doseQuantity?: FHIRQuantity;
    }>;
  }>;
  note?: FHIRAnnotation[];
}

// Practitioner BR Core
export interface FHIRPractitioner {
  resourceType: 'Practitioner';
  id: string;
  meta?: {
    profile: string[];
  };
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  qualification?: Array<{
    identifier?: FHIRIdentifier[];
    code: FHIRCodeableConcept;
  }>;
}

// Organization BR Core
export interface FHIROrganization {
  resourceType: 'Organization';
  id: string;
  meta?: {
    profile: string[];
  };
  identifier?: FHIRIdentifier[];
  active?: boolean;
  type?: FHIRCodeableConcept[];
  name?: string;
  alias?: string[];
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress[];
}

// Tipos auxiliares FHIR
export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary';
  type?: FHIRCodeableConcept;
  system?: string;
  value?: string;
  period?: FHIRPeriod;
  assigner?: FHIRReference;
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: FHIRPeriod;
}

export interface FHIRContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: FHIRPeriod;
}

export interface FHIRAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: FHIRPeriod;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRAnnotation {
  authorReference?: FHIRReference;
  authorString?: string;
  time?: string;
  text: string;
}

export interface FHIRAttachment {
  contentType?: string;
  language?: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
}

export interface FHIRPatientContact {
  relationship?: FHIRCodeableConcept[];
  name?: FHIRHumanName;
  telecom?: FHIRContactPoint[];
  address?: FHIRAddress;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: FHIRReference;
  period?: FHIRPeriod;
}

// Constantes BR Core
export const BR_CORE_PROFILES = {
  PATIENT: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIndividuo-1.0',
  PRACTITIONER: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRProfissional-1.0',
  ORGANIZATION: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BREstabelecimentoSaude-1.0',
  ENCOUNTER: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BREncontro-1.0',
  OBSERVATION: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRObservacao-1.0',
  CONDITION: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRProblemaCondicaoAvaliacao-1.0',
  ALLERGY_INTOLERANCE: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRAlergiaReacaoAdversa-1.0',
  PROCEDURE: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRProcedimentoRealizado-1.0',
  MEDICATION_STATEMENT: 'http://www.saude.gov.br/fhir/r4/StructureDefinition/BRMedicamento-1.0',
};

export const BR_IDENTIFIER_SYSTEMS = {
  CPF: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cpf',
  CNS: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cns',
  CNES: 'http://www.saude.gov.br/fhir/r4/NamingSystem/cnes',
  CBO: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRCategoriaProfissional',
};

