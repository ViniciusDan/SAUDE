export type Coding = {
  system?: string;
  code?: string;
  display?: string;
};

export type CodeableConcept = {
  coding?: Coding[];
  text?: string;
};

export type Identifier = {
  use?: string;
  system?: string;
  value?: string;
  type?: CodeableConcept;
};

export type HumanName = {
  use?: string;
  text?: string;
  family?: string;
  given?: string[];
};

export type PatientResource = {
  resourceType: "Patient";
  id: string;
  identifier?: Identifier[];
  name?: HumanName[];
  gender?: string;
  birthDate?: string;
};

export type EncounterResource = {
  resourceType: "Encounter";
  id: string;
  status: string;
  class?: Coding;
  type?: CodeableConcept[];
  period?: {
    start?: string;
    end?: string;
  };
  serviceProvider?: {
    id?: string;
    display?: string;
  };
  reasonCode?: CodeableConcept[];
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

export type ObservationResource = {
  resourceType: "Observation";
  id: string;
  status: string;
  category?: CodeableConcept[];
  code: CodeableConcept;
  issued?: string;
  effectiveDateTime?: string;
  value?: ObservationValue;
  interpretation?: CodeableConcept[];
};

export type AllergyIntoleranceResource = {
  resourceType: "AllergyIntolerance";
  id: string;
  clinicalStatus?: CodeableConcept;
  verificationStatus?: CodeableConcept;
  code?: CodeableConcept;
  criticality?: string;
  lastOccurrence?: string;
};

export type ConditionResource = {
  resourceType: "Condition";
  id: string;
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
  resourceType: "Procedure";
  id: string;
  status?: string;
  category?: CodeableConcept;
  code?: CodeableConcept;
  performedStart?: string;
  performedEnd?: string;
  note?: string;
};

export type MedicationStatementResource = {
  resourceType: "MedicationStatement";
  id: string;
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


