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
  use?: string;
  type?: string;
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
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

export type UpdatePatientProfilePayload = {
  fullName: string;
  gender?: "male" | "female" | "other" | "unknown" | "";
  birthDate?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  district?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

export type CreateEditableAllergyPayload = {
  substance: string;
  criticality?: "low" | "high" | "unable-to-assess" | "";
  note?: string;
};

export type CreateEditableConditionPayload = {
  name: string;
  clinicalStatus?: "active" | "inactive" | "resolved" | "";
  severity?: "mild" | "moderate" | "severe" | "";
  note?: string;
};

export type CreateEditableMedicationPayload = {
  name: string;
  status?: "active" | "completed" | "stopped" | "";
  dosage?: string;
  route?: string;
  note?: string;
};

export type ClinicalDocumentResource = {
  id: string;
  title: string;
  documentType?: string;
  description?: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt?: string;
  issuedAt?: string;
  clinicName?: string;
  isVisibleToPatient?: boolean;
  source?: string;
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
  note?: string;
  source?: string;
  patientEditable?: boolean;
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
  source?: string;
  patientEditable?: boolean;
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
  source?: string;
  patientEditable?: boolean;
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