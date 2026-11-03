import type {
  AllergyIntoleranceResource,
  ClinicalDocumentResource,
  ConditionResource,
  MedicationStatementResource,
  PatientSummaryBundle
} from "../types/fhir";

export type ClinicalHistoryItemType =
  | "encounter"
  | "observation"
  | "procedure"
  | "medication_start"
  | "medication_end"
  | "condition"
  | "condition_resolved"
  | "allergy"
  | "document_received"
  | "document_personal";

export type ClinicalHistoryItem = {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: ClinicalHistoryItemType;
};

function getMedicationName(medication: MedicationStatementResource) {
  return (
    medication.medication?.text ||
    medication.medication?.coding?.[0]?.display ||
    "Medicamento"
  );
}

function getConditionName(condition: ConditionResource) {
  return (
    condition.code?.text ||
    condition.code?.coding?.[0]?.display ||
    "Condição"
  );
}

function getAllergyName(allergy: AllergyIntoleranceResource) {
  return allergy.code?.text || "Alergia";
}

function getObservationName(observation: PatientSummaryBundle["observations"][number]) {
  return (
    observation.code.text ||
    observation.code.coding?.[0]?.display ||
    "Exame"
  );
}

function getProcedureName(procedure: NonNullable<PatientSummaryBundle["procedures"]>[number]) {
  return (
    procedure.code?.text ||
    procedure.code?.coding?.[0]?.display ||
    "Procedimento"
  );
}

function getEncounterName(encounter: PatientSummaryBundle["encounters"][number]) {
  return (
    encounter.type?.[0]?.text ||
    encounter.reasonCode?.[0]?.text ||
    encounter.class?.display ||
    "Atendimento"
  );
}

export function buildClinicalHistory(params: {
  summary: PatientSummaryBundle;
  editableAllergies?: AllergyIntoleranceResource[];
  editableConditions?: ConditionResource[];
  editableMedications?: MedicationStatementResource[];
  receivedDocuments?: ClinicalDocumentResource[];
  personalDocuments?: ClinicalDocumentResource[];
}): ClinicalHistoryItem[] {
  const {
    summary,
    editableAllergies = [],
    editableConditions = [],
    editableMedications = [],
    receivedDocuments = [],
    personalDocuments = []
  } = params;

  const items: ClinicalHistoryItem[] = [];

  summary.encounters.forEach((encounter) => {
    const date = encounter.period?.start || encounter.period?.end;
    if (!date) return;

    items.push({
      id: `encounter-${encounter.id}`,
      date,
      title: getEncounterName(encounter),
      description: encounter.serviceProvider?.display || "Atendimento registrado",
      type: "encounter"
    });
  });

  summary.observations.forEach((observation) => {
    const date = observation.effectiveDateTime || observation.issued;
    if (!date) return;

    let description = "Exame registrado";

    if (observation.value?.kind === "Quantity") {
      description = `${observation.value.value} ${observation.value.unit || ""}`.trim();
    } else if (observation.value?.kind === "String") {
      description = observation.value.value;
    } else if (observation.value?.kind === "CodeableConcept") {
      description =
        observation.value.value.text ||
        observation.value.value.coding?.[0]?.display ||
        "Resultado registrado";
    }

    items.push({
      id: `observation-${observation.id}`,
      date,
      title: getObservationName(observation),
      description,
      type: "observation"
    });
  });

  (summary.procedures || []).forEach((procedure) => {
    const date = procedure.performedStart;
    if (!date) return;

    items.push({
      id: `procedure-${procedure.id}`,
      date,
      title: getProcedureName(procedure),
      description: procedure.status || "Procedimento realizado",
      type: "procedure"
    });
  });

  editableMedications.forEach((medication) => {
    const medicationName = getMedicationName(medication);

    if (medication.effectiveStart) {
      items.push({
        id: `medication-start-${medication.id}`,
        date: medication.effectiveStart,
        title: `Início de uso: ${medicationName}`,
        description: medication.dosage || medication.note || "Medicamento iniciado",
        type: "medication_start"
      });
    }

    if (medication.effectiveEnd) {
      items.push({
        id: `medication-end-${medication.id}`,
        date: medication.effectiveEnd,
        title: `Fim de uso: ${medicationName}`,
        description: medication.note || "Uso do medicamento encerrado",
        type: "medication_end"
      });
    }

    if (!medication.effectiveStart && !medication.effectiveEnd) {
      items.push({
        id: `medication-generic-${medication.id}`,
        date: medication.effectiveStart || medication.effectiveEnd || new Date().toISOString(),
        title: `Medicamento registrado: ${medicationName}`,
        description: medication.dosage || medication.note || "Medicamento registrado",
        type: "medication_start"
      });
    }
  });

  editableConditions.forEach((condition) => {
    const name = getConditionName(condition);
    const status = condition.clinicalStatus?.text?.toLowerCase() || "";
    const date = condition.onsetDateTime || condition.recordedDate || new Date().toISOString();

    if (status === "resolved" || status === "resolvida") {
      items.push({
        id: `condition-resolved-${condition.id}`,
        date,
        title: `Condição resolvida: ${name}`,
        description: condition.note || "Condição marcada como resolvida",
        type: "condition_resolved"
      });
    } else {
      items.push({
        id: `condition-${condition.id}`,
        date,
        title: `Condição registrada: ${name}`,
        description: condition.note || condition.severity?.text || "Condição adicionada ao histórico",
        type: "condition"
      });
    }
  });

  editableAllergies.forEach((allergy) => {
    const date = allergy.lastOccurrence || new Date().toISOString();

    items.push({
      id: `allergy-${allergy.id}`,
      date,
      title: `Alergia registrada: ${getAllergyName(allergy)}`,
      description: allergy.note || allergy.criticality || "Alergia adicionada ao histórico",
      type: "allergy"
    });
  });

  receivedDocuments.forEach((doc) => {
    if (!doc.uploadedAt) return;

    items.push({
      id: `document-received-${doc.id}`,
      date: doc.uploadedAt,
      title: `Documento recebido: ${doc.title}`,
      description: doc.clinicName || doc.documentType || "Documento enviado por clínica",
      type: "document_received"
    });
  });

  personalDocuments.forEach((doc) => {
    if (!doc.uploadedAt) return;

    items.push({
      id: `document-personal-${doc.id}`,
      date: doc.uploadedAt,
      title: `Documento pessoal enviado: ${doc.title}`,
      description: doc.documentType || doc.description || "Documento pessoal adicionado",
      type: "document_personal"
    });
  });

  return items
    .filter((item) => !!item.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}