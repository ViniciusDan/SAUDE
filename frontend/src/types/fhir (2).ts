export type ResourceReference = {
  id: string;
  display?: string;
};

export type Coding = {
  system?: string;
  code?: string;
  display?: string;
};

export type CodeableConcept = {
  coding?: Coding[];
  text?: string;
};

export type Period = {
  start?: string;
  end?: string;
};

export type Identifier = {
  use?: "usual" | "official" | "temp" | "secondary";
  type?: CodeableConcept;
  system?: string;
  value?: string;
};

export type HumanName = {
  use?: "official" | "usual" | "nickname";
  text?: string;
  family?: string;
  given?: string[];
};

export type Address = {
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
};

export type ContactPoint = {
  system?: "phone" | "email";
  value?: string;
  use?: "home" | "mobile" | "work";
};

export type ObservationValue =
  | {
      kind: "Quantity";
      value: number;
      unit?: string;
      system?: string;
      code?: string;
    }
  | {
      kind: "String";
      value: string;
    }
  | {
      kind: "CodeableConcept";
      value: CodeableConcept;
    };

export type PatientResource = {
  id: string;
  resourceType: "Patient";
  identifier?: Identifier[];
  name?: HumanName[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  telecom?: ContactPoint[];
  address?: Address[];
};

export type EncounterResource = {
  id: string;
  resourceType: "Encounter";
  status: string;
  class?: Coding;
  type?: CodeableConcept[];
  period?: Period;
  serviceProvider?: ResourceReference;
  reasonCode?: CodeableConcept[];
};

export type ObservationResource = {
  id: string;
  resourceType: "Observation";
  status: string;
  category?: CodeableConcept[];
  code: CodeableConcept;
  issued?: string;
  effectiveDateTime?: string;
  value?: ObservationValue;
  interpretation?: CodeableConcept[];
};

export type AllergyIntoleranceResource = {
  id: string;
  resourceType: "AllergyIntolerance";
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  code?: CodeableConcept;
  criticality?: "low" | "high" | "unable-to-assess";
  lastOccurrence?: string;
};

export type ConditionResource = {
  id: string;
  resourceType: "Condition";
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  category?: CodeableConcept[];
  severity?: CodeableConcept;
  code?: CodeableConcept;
  onsetDateTime?: string;
  abatementDateTime?: string;
  recordedDate?: string;
  note?: string;
};

export type ProcedureResource = {
  id: string;
  resourceType: "Procedure";
  status?: string;
  category?: CodeableConcept;
  code?: CodeableConcept;
  performedStart?: string;
  performedEnd?: string;
  note?: string;
};

export type MedicationStatementResource = {
  id: string;
  resourceType: "MedicationStatement";
  status?: string;
  category?: CodeableConcept;
  medication?: CodeableConcept;
  dosage?: string;
  route?: string;
  effectiveStart?: string;
  effectiveEnd?: string;
  taken?: string;
  note?: string;
};

export type PatientSummaryBundle = {
  patient: PatientResource;
  encounters: EncounterResource[];
  observations: ObservationResource[];
  allergies: AllergyIntoleranceResource[];
  conditions?: ConditionResource[];
  procedures?: ProcedureResource[];
  medications?: MedicationStatementResource[];
};


