import { useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { SkeletonCard } from "../components/ui/Skeleton";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type {
  AllergyIntoleranceResource,
  ClinicalDocumentResource,
  ConditionResource,
  CreateEditableAllergyPayload,
  CreateEditableConditionPayload,
  CreateEditableMedicationPayload,
  MedicationStatementResource,
  PatientSummaryBundle,
  UpdatePatientProfilePayload
} from "../types/fhir";
import { formatCpf, formatDate } from "../utils/formatters";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

type ProfileFormData = UpdatePatientProfilePayload;

function buildFormData(summary: PatientSummaryBundle): ProfileFormData {
  const officialName = summary.patient.name?.find((n) => n.use === "official") || summary.patient.name?.[0];
  const phone = summary.patient.telecom?.find((item) => item.system === "phone");
  const email = summary.patient.telecom?.find((item) => item.system === "email");
  const address = summary.patient.address?.[0];

  return {
    fullName:
      officialName?.text ||
      [officialName?.given?.join(" "), officialName?.family].filter(Boolean).join(" "),
    gender: summary.patient.gender || "",
    birthDate: summary.patient.birthDate || "",
    phone: phone?.value || "",
    email: email?.value || "",
    addressLine1: address?.line?.[0] || "",
    addressLine2: address?.line?.[1] || "",
    district: address?.district || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || ""
  };
}

const initialAllergyForm: CreateEditableAllergyPayload = {
  substance: "",
  criticality: "",
  note: ""
};

const initialConditionForm: CreateEditableConditionPayload = {
  name: "",
  clinicalStatus: "active",
  severity: "",
  note: ""
};

const initialMedicationForm: CreateEditableMedicationPayload = {
  name: "",
  status: "active",
  dosage: "",
  route: "",
  note: ""
};

function EditNoteIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 3.5h8.5L19 8v10.5A2.5 2.5 0 0 1 16.5 21h-10A2.5 2.5 0 0 1 4 18.5v-13A2 2 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 3.5V8H19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11h4M8 14h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M13.5 17.5 18.8 12.2a1.4 1.4 0 0 1 2 2l-5.3 5.3-2.7.7.7-2.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 7 7.4 19a2.2 2.2 0 0 0 2.2 2h4.8a2.2 2.2 0 0 0 2.2-2l.9-12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PatientSummaryBundle | null>(null);
  const [formData, setFormData] = useState<ProfileFormData | null>(null);

  const [editableAllergies, setEditableAllergies] = useState<AllergyIntoleranceResource[]>([]);
  const [allergyForm, setAllergyForm] = useState<CreateEditableAllergyPayload>(initialAllergyForm);
  const [editingAllergyId, setEditingAllergyId] = useState<string | null>(null);

  const [documents, setDocuments] = useState<ClinicalDocumentResource[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentFeedback, setDocumentFeedback] = useState<string>("");

  const [personalDocuments, setPersonalDocuments] = useState<ClinicalDocumentResource[]>([]);
  const [isLoadingPersonalDocuments, setIsLoadingPersonalDocuments] = useState(true);
  const [personalTitle, setPersonalTitle] = useState("");
  const [personalDocumentType, setPersonalDocumentType] = useState("");
  const [personalDescription, setPersonalDescription] = useState("");
  const [personalFile, setPersonalFile] = useState<File | null>(null);
  const [personalFeedback, setPersonalFeedback] = useState("");
  const [isUploadingPersonalDocument, setIsUploadingPersonalDocument] = useState(false);
  const [editingPersonalDocumentId, setEditingPersonalDocumentId] = useState<string | null>(null);

  const [editableConditions, setEditableConditions] = useState<ConditionResource[]>([]);
  const [conditionForm, setConditionForm] = useState<CreateEditableConditionPayload>(initialConditionForm);
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null);

  const [editableMedications, setEditableMedications] = useState<MedicationStatementResource[]>([]);
  const [medicationForm, setMedicationForm] = useState<CreateEditableMedicationPayload>(initialMedicationForm);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isLoadingAllergies, setIsLoadingAllergies] = useState(true);
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [isSavingAllergy, setIsSavingAllergy] = useState(false);
  const [deletingAllergyId, setDeletingAllergyId] = useState<string | null>(null);

  const [isLoadingConditions, setIsLoadingConditions] = useState(true);
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [isSavingCondition, setIsSavingCondition] = useState(false);
  const [deletingConditionId, setDeletingConditionId] = useState<string | null>(null);

  const [isLoadingMedications, setIsLoadingMedications] = useState(true);
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isSavingMedication, setIsSavingMedication] = useState(false);
  const [deletingMedicationId, setDeletingMedicationId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [allergyFeedback, setAllergyFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [conditionFeedback, setConditionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [medicationFeedback, setMedicationFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadSummary() {
      if (!user) return;

      setIsLoading(true);

      try {
        const data = await fhirClient.getPatientSummary(user.id, user.token);
        setSummary(data);
        setFormData(buildFormData(data));
      } catch {
        setFeedback({ type: "error", message: "Não foi possível carregar os dados do perfil." });
      } finally {
        setIsLoading(false);
      }
    }

    void loadSummary();
  }, [user]);

  useEffect(() => {
    async function loadEditableAllergies() {
      if (!user) return;

      setIsLoadingAllergies(true);

      try {
        const allergies = await fhirClient.listEditableAllergies(user.id, user.token);
        setEditableAllergies(allergies);
      } catch {
        setAllergyFeedback({ type: "error", message: "Não foi possível carregar as alergias." });
      } finally {
        setIsLoadingAllergies(false);
      }
    }

    void loadEditableAllergies();
  }, [user]);

  useEffect(() => {
    async function loadEditableConditions() {
      if (!user) return;

      setIsLoadingConditions(true);

      try {
        const conditions = await fhirClient.listEditableConditions(user.id, user.token);
        setEditableConditions(conditions);
      } catch {
        setConditionFeedback({ type: "error", message: "Não foi possível carregar as condições." });
      } finally {
        setIsLoadingConditions(false);
      }
    }

    void loadEditableConditions();
  }, [user]);

  useEffect(() => {
    async function loadEditableMedications() {
      if (!user) return;

      setIsLoadingMedications(true);

      try {
        const medications = await fhirClient.listEditableMedications(user.id, user.token);
        setEditableMedications(medications);
      } catch {
        setMedicationFeedback({ type: "error", message: "Não foi possível carregar os medicamentos." });
      } finally {
        setIsLoadingMedications(false);
      }
    }

    void loadEditableMedications();
  }, [user]);

  useEffect(() => {
    async function loadDocuments() {
      if (!user) return;

      setIsLoadingDocuments(true);

      try {
        const docs = await fhirClient.listPatientDocuments(user.id, user.token);
        setDocuments(docs);
      } catch {
        setDocumentFeedback("Não foi possível carregar os documentos recebidos.");
      } finally {
        setIsLoadingDocuments(false);
      }
    }

    void loadDocuments();
  }, [user]);

  useEffect(() => {
    async function loadPersonalDocuments() {
      if (!user) return;

      setIsLoadingPersonalDocuments(true);

      try {
        const docs = await fhirClient.listPersonalDocuments(user.id, user.token);
        setPersonalDocuments(docs);
      } catch {
        setPersonalFeedback("Não foi possível carregar os documentos pessoais.");
      } finally {
        setIsLoadingPersonalDocuments(false);
      }
    }

    void loadPersonalDocuments();
  }, [user]);

  const officialName = useMemo(() => {
    if (!summary) return undefined;
    return summary.patient.name?.find((n) => n.use === "official") || summary.patient.name?.[0];
  }, [summary]);

  if (!user) return null;

  function handleChange(field: keyof ProfileFormData, value: string) {
    setFormData((current) => ({
      ...(current || { fullName: "" }),
      [field]: value
    }));
  }

  function handleAllergyFormChange(field: keyof CreateEditableAllergyPayload, value: string) {
    setAllergyForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleConditionFormChange(field: keyof CreateEditableConditionPayload, value: string) {
    setConditionForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleMedicationFormChange(field: keyof CreateEditableMedicationPayload, value: string) {
    setMedicationForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleCancelEdit() {
    if (!summary) return;
    setFormData(buildFormData(summary));
    setIsEditing(false);
    setFeedback(null);
  }

  function resetAllergyForm() {
    setAllergyForm(initialAllergyForm);
    setIsAddingAllergy(false);
    setEditingAllergyId(null);
  }

  function resetConditionForm() {
    setConditionForm(initialConditionForm);
    setIsAddingCondition(false);
    setEditingConditionId(null);
  }

  function resetMedicationForm() {
    setMedicationForm(initialMedicationForm);
    setIsAddingMedication(false);
    setEditingMedicationId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !summary || !formData) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const updatedPatient = await fhirClient.updatePatientProfile(user.id, user.token, formData);

      const updatedSummary: PatientSummaryBundle = {
        ...summary,
        patient: updatedPatient
      };

      setSummary(updatedSummary);
      setFormData(buildFormData(updatedSummary));
      setIsEditing(false);
      setFeedback({ type: "success", message: "Dados cadastrais atualizados com sucesso." });
    } catch {
      setFeedback({ type: "error", message: "Não foi possível salvar as alterações do perfil." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAllergy() {
    if (!user) return;

    if (!allergyForm.substance?.trim()) {
      setAllergyFeedback({ type: "error", message: "Informe a substância da alergia." });
      return;
    }

    setIsSavingAllergy(true);
    setAllergyFeedback(null);

    try {
      if (editingAllergyId) {
        const updated = await fhirClient.updateEditableAllergy(user.id, user.token, editingAllergyId, {
          substance: allergyForm.substance.trim(),
          criticality: allergyForm.criticality || "",
          note: allergyForm.note || ""
        });

        setEditableAllergies((current) =>
          current.map((item) => (item.id === editingAllergyId ? updated : item))
        );

        setAllergyFeedback({ type: "success", message: "Alergia atualizada com sucesso." });
      } else {
        const created = await fhirClient.createEditableAllergy(user.id, user.token, {
          substance: allergyForm.substance.trim(),
          criticality: allergyForm.criticality || "",
          note: allergyForm.note || ""
        });

        setEditableAllergies((current) => [created, ...current]);
        setAllergyFeedback({ type: "success", message: "Alergia adicionada com sucesso." });
      }

      resetAllergyForm();
    } catch {
      setAllergyFeedback({ type: "error", message: "Não foi possível salvar a alergia." });
    } finally {
      setIsSavingAllergy(false);
    }
  }

  function handleStartEditAllergy(allergy: AllergyIntoleranceResource) {
    setEditingAllergyId(allergy.id);
    setIsAddingAllergy(true);
    setAllergyForm({
      substance: allergy.code?.text || "",
      criticality: allergy.criticality || "",
      note: allergy.note || ""
    });
    setAllergyFeedback(null);
  }

  async function handleDeleteAllergy(allergyId: string) {
    if (!user) return;

    setDeletingAllergyId(allergyId);
    setAllergyFeedback(null);

    try {
      await fhirClient.deleteEditableAllergy(user.id, user.token, allergyId);
      setEditableAllergies((current) => current.filter((item) => item.id !== allergyId));
      if (editingAllergyId === allergyId) {
        resetAllergyForm();
      }
      setAllergyFeedback({ type: "success", message: "Alergia removida com sucesso." });
    } catch {
      setAllergyFeedback({ type: "error", message: "Não foi possível remover a alergia." });
    } finally {
      setDeletingAllergyId(null);
    }
  }

  async function handleSaveCondition() {
    if (!user) return;

    if (!conditionForm.name?.trim()) {
      setConditionFeedback({ type: "error", message: "Informe a condição." });
      return;
    }

    setIsSavingCondition(true);
    setConditionFeedback(null);

    try {
      if (editingConditionId) {
        const updated = await fhirClient.updateEditableCondition(user.id, user.token, editingConditionId, {
          name: conditionForm.name.trim(),
          clinicalStatus: conditionForm.clinicalStatus || "active",
          severity: conditionForm.severity || "",
          note: conditionForm.note || ""
        });

        setEditableConditions((current) =>
          current.map((item) => (item.id === editingConditionId ? updated : item))
        );

        setConditionFeedback({ type: "success", message: "Condição atualizada com sucesso." });
      } else {
        const created = await fhirClient.createEditableCondition(user.id, user.token, {
          name: conditionForm.name.trim(),
          clinicalStatus: conditionForm.clinicalStatus || "active",
          severity: conditionForm.severity || "",
          note: conditionForm.note || ""
        });

        setEditableConditions((current) => [created, ...current]);
        setConditionFeedback({ type: "success", message: "Condição adicionada com sucesso." });
      }

      resetConditionForm();
    } catch {
      setConditionFeedback({ type: "error", message: "Não foi possível salvar a condição." });
    } finally {
      setIsSavingCondition(false);
    }
  }

  function handleStartEditCondition(condition: ConditionResource) {
    const severityValue =
      condition.severity?.text?.toLowerCase() === "leve"
        ? "mild"
        : condition.severity?.text?.toLowerCase() === "moderada"
          ? "moderate"
          : condition.severity?.text?.toLowerCase() === "grave"
            ? "severe"
            : "";

    const statusValue =
      condition.clinicalStatus?.text?.toLowerCase() === "inativa" ||
      condition.clinicalStatus?.text?.toLowerCase() === "inactive"
        ? "inactive"
        : condition.clinicalStatus?.text?.toLowerCase() === "resolvida" ||
          condition.clinicalStatus?.text?.toLowerCase() === "resolved"
          ? "resolved"
          : "active";

    setEditingConditionId(condition.id);
    setIsAddingCondition(true);
    setConditionForm({
      name: condition.code?.text || "",
      clinicalStatus: statusValue,
      severity: severityValue,
      note: condition.note || ""
    });
    setConditionFeedback(null);
  }

  async function handleDeleteCondition(conditionId: string) {
    if (!user) return;

    setDeletingConditionId(conditionId);
    setConditionFeedback(null);

    try {
      await fhirClient.deleteEditableCondition(user.id, user.token, conditionId);
      setEditableConditions((current) => current.filter((item) => item.id !== conditionId));
      if (editingConditionId === conditionId) {
        resetConditionForm();
      }
      setConditionFeedback({ type: "success", message: "Condição removida com sucesso." });
    } catch {
      setConditionFeedback({ type: "error", message: "Não foi possível remover a condição." });
    } finally {
      setDeletingConditionId(null);
    }
  }

  async function handleSaveMedication() {
    if (!user) return;

    if (!medicationForm.name?.trim()) {
      setMedicationFeedback({ type: "error", message: "Informe o medicamento." });
      return;
    }

    setIsSavingMedication(true);
    setMedicationFeedback(null);

    try {
      if (editingMedicationId) {
        const updated = await fhirClient.updateEditableMedication(user.id, user.token, editingMedicationId, {
          name: medicationForm.name.trim(),
          status: medicationForm.status || "active",
          dosage: medicationForm.dosage || "",
          route: medicationForm.route || "",
          note: medicationForm.note || ""
        });

        setEditableMedications((current) =>
          current.map((item) => (item.id === editingMedicationId ? updated : item))
        );

        setMedicationFeedback({ type: "success", message: "Medicamento atualizado com sucesso." });
      } else {
        const created = await fhirClient.createEditableMedication(user.id, user.token, {
          name: medicationForm.name.trim(),
          status: medicationForm.status || "active",
          dosage: medicationForm.dosage || "",
          route: medicationForm.route || "",
          note: medicationForm.note || ""
        });

        setEditableMedications((current) => [created, ...current]);
        setMedicationFeedback({ type: "success", message: "Medicamento adicionado com sucesso." });
      }

      resetMedicationForm();
    } catch {
      setMedicationFeedback({ type: "error", message: "Não foi possível salvar o medicamento." });
    } finally {
      setIsSavingMedication(false);
    }
  }

  function handleStartEditMedication(medication: MedicationStatementResource) {
    setEditingMedicationId(medication.id);
    setIsAddingMedication(true);
    setMedicationForm({
      name: medication.medication?.text || "",
      status: (medication.status as "active" | "completed" | "stopped" | "") || "active",
      dosage: medication.dosage || "",
      route: medication.route || "",
      note: medication.note || ""
    });
    setMedicationFeedback(null);
  }

  async function handleDeleteMedication(medicationId: string) {
    if (!user) return;

    setDeletingMedicationId(medicationId);
    setMedicationFeedback(null);

    try {
      await fhirClient.deleteEditableMedication(user.id, user.token, medicationId);
      setEditableMedications((current) => current.filter((item) => item.id !== medicationId));
      if (editingMedicationId === medicationId) {
        resetMedicationForm();
      }
      setMedicationFeedback({ type: "success", message: "Medicamento removido com sucesso." });
    } catch {
      setMedicationFeedback({ type: "error", message: "Não foi possível remover o medicamento." });
    } finally {
      setDeletingMedicationId(null);
    }
  }

  async function handleUploadPersonalDocument() {
  if (!user) return;

  if (!personalTitle.trim()) {
    setPersonalFeedback("Informe o título do documento.");
    return;
  }

  if (!editingPersonalDocumentId && !personalFile) {
    setPersonalFeedback("Selecione um arquivo.");
    return;
  }

  setIsUploadingPersonalDocument(true);
  setPersonalFeedback("");

  try {
    const formData = new FormData();
    formData.append("title", personalTitle);
    formData.append("documentType", personalDocumentType);
    formData.append("description", personalDescription);

    if (personalFile) {
      formData.append("file", personalFile);
    }

    if (editingPersonalDocumentId) {
      await fhirClient.updatePersonalDocument(
        user.id,
        user.token,
        editingPersonalDocumentId,
        formData
      );
      setPersonalFeedback("Documento pessoal atualizado com sucesso.");
    } else {
      await fhirClient.uploadPersonalDocument(user.id, user.token, formData);
      setPersonalFeedback("Documento pessoal enviado com sucesso.");
    }

    const docs = await fhirClient.listPersonalDocuments(user.id, user.token);
    setPersonalDocuments(docs);

    setPersonalTitle("");
    setPersonalDocumentType("");
    setPersonalDescription("");
    setPersonalFile(null);
    setEditingPersonalDocumentId(null);
  } catch {
    setPersonalFeedback(
      editingPersonalDocumentId
        ? "Não foi possível atualizar o documento pessoal."
        : "Não foi possível enviar o documento pessoal."
    );
  } finally {
    setIsUploadingPersonalDocument(false);
  }
}

  function handleStartEditPersonalDocument(doc: ClinicalDocumentResource) {
  setEditingPersonalDocumentId(doc.id);
  setPersonalTitle(doc.title || "");
  setPersonalDocumentType(doc.documentType || "");
  setPersonalDescription(doc.description || "");
  setPersonalFile(null);
  setPersonalFeedback("Modo edição ativado. Selecione um novo arquivo apenas se quiser substituir o atual.");
}

function handleCancelEditPersonalDocument() {
  setEditingPersonalDocumentId(null);
  setPersonalTitle("");
  setPersonalDocumentType("");
  setPersonalDescription("");
  setPersonalFile(null);
  setPersonalFeedback("");
}

  if (isLoading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Perfil" }]} />
        <h1 className="text-3xl font-bold text-[#233B6E] dark:text-white mb-6">Meu Perfil</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!summary || !formData) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Perfil" }]} />
        <h1 className="text-3xl font-bold text-[#233B6E] dark:text-white mb-6">Meu Perfil</h1>
        <p className="text-[#6F7F95] dark:text-gray-400">Não foi possível carregar os dados do perfil.</p>
      </div>
    );
  }

  const patient = summary.patient;
  const cpfIdentifier = patient.identifier?.find(
    (id) => id.system?.includes("CPF") || id.value?.length === 11
  );
  const cnsIdentifier = patient.identifier?.find(
    (id) => id.system?.includes("CNS") || id.value?.length === 15
  );

  const genderMap: Record<string, string> = {
    male: "Masculino",
    female: "Feminino",
    other: "Outro",
    unknown: "Não informado"
  };

  const criticalityMap: Record<string, string> = {
    low: "Baixa",
    high: "Alta",
    "unable-to-assess": "Não avaliada"
  };

  const conditionStatusMap: Record<string, string> = {
    active: "Ativa",
    inactive: "Inativa",
    resolved: "Resolvida",
    ativa: "Ativa",
    inativa: "Inativa",
    resolvida: "Resolvida"
  };

  const conditionSeverityMap: Record<string, string> = {
    mild: "Leve",
    moderate: "Moderada",
    severe: "Grave",
    leve: "Leve",
    moderada: "Moderada",
    grave: "Grave"
  };

  const medicationStatusMap: Record<string, string> = {
    active: "Em uso",
    completed: "Concluído",
    stopped: "Suspenso"
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Perfil" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#233B6E] dark:text-white">Meu Perfil</h1>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
            <Button type="submit" form="profile-form" isLoading={isSaving}>
              Salvar alterações
            </Button>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-[#34A853] bg-[#eaf7ee] text-[#1f6f33] dark:bg-[#112217] dark:text-[#7ddc95]"
              : "border-[#c62828] bg-[#fdecec] text-[#8f1f1f] dark:bg-[#2a1111] dark:text-[#ff8e8e]"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <Card>
        <CardHeader title="Resumo Clínico" />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
              <p className="text-2xl font-bold text-[#233B6E] dark:text-blue-400">{summary.encounters.length}</p>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Atendimentos</p>
            </div>
            <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
              <p className="text-2xl font-bold text-[#34A853] dark:text-green-400">{summary.observations.length}</p>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Exames</p>
            </div>
            <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
              <p className="text-2xl font-bold text-[#c62828] dark:text-red-400">{editableAllergies.length}</p>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Minhas alergias</p>
            </div>
            <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
              <p className="text-2xl font-bold text-[#233B6E] dark:text-gray-400">{editableConditions.length}</p>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Minhas condições</p>
            </div>
            <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
              <p className="text-2xl font-bold text-[#ffc107] dark:text-yellow-400">{(summary.procedures || []).length}</p>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Procedimentos</p>
            </div>
            <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
              <p className="text-2xl font-bold text-[#233B6E] dark:text-blue-400">{editableMedications.length}</p>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Meus medicamentos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form id="profile-form" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Informações Pessoais" />
            <CardContent>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Nome Completo</p>
                    <p className="text-base font-medium text-[#233B6E] dark:text-white">
                      {officialName?.text || officialName?.family || "Não informado"}
                    </p>
                  </div>

                  {patient.gender && (
                    <div>
                      <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Sexo</p>
                      <p className="text-base font-medium text-[#233B6E] dark:text-white">
                        {genderMap[patient.gender] || patient.gender}
                      </p>
                    </div>
                  )}

                  {patient.birthDate && (
                    <div>
                      <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Data de Nascimento</p>
                      <p className="text-base font-medium text-[#233B6E] dark:text-white">
                        {formatDate(patient.birthDate)}
                      </p>
                    </div>
                  )}

                  {cpfIdentifier && (
                    <div>
                      <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">CPF</p>
                      <p className="text-base font-medium text-[#233B6E] dark:text-white">
                        {formatCpf(cpfIdentifier.value || "")}
                      </p>
                    </div>
                  )}

                  {cnsIdentifier && (
                    <div>
                      <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">CNS</p>
                      <p className="text-base font-medium text-[#233B6E] dark:text-white">
                        {cnsIdentifier.value}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome completo"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                      Sexo
                    </label>
                    <select
                      className="w-full px-4 py-3 text-base border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                      value={formData.gender || ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                    >
                      <option value="">Não informado</option>
                      <option value="female">Feminino</option>
                      <option value="male">Masculino</option>
                      <option value="other">Outro</option>
                      <option value="unknown">Prefiro não informar</option>
                    </select>
                  </div>

                  <Input
                    label="Data de nascimento"
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />

                  <Input label="CPF" value={formatCpf(cpfIdentifier?.value || "")} disabled />
                  <Input label="CNS" value={cnsIdentifier?.value || "Não informado"} disabled />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Minhas alergias" subtitle="Alergias do seu perfil" />
            <CardContent>
              {allergyFeedback && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                    allergyFeedback.type === "success"
                      ? "border-[#34A853] bg-[#eaf7ee] text-[#1f6f33] dark:bg-[#112217] dark:text-[#7ddc95]"
                      : "border-[#c62828] bg-[#fdecec] text-[#8f1f1f] dark:bg-[#2a1111] dark:text-[#ff8e8e]"
                  }`}
                >
                  {allergyFeedback.message}
                </div>
              )}

              {!isAddingAllergy ? (
                <div className="mb-4">
                  <Button type="button" onClick={() => setIsAddingAllergy(true)}>
                    Adicionar alergia
                  </Button>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-lg bg-[#EAF3FB] dark:bg-[#2a2a2a]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Substância / alérgeno"
                      value={allergyForm.substance || ""}
                      onChange={(e) => handleAllergyFormChange("substance", e.target.value)}
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                        Criticidade
                      </label>
                      <select
                        className="w-full px-4 py-3 text-base border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                        value={allergyForm.criticality || ""}
                        onChange={(e) => handleAllergyFormChange("criticality", e.target.value)}
                      >
                        <option value="">Não avaliada</option>
                        <option value="low">Baixa</option>
                        <option value="high">Alta</option>
                        <option value="unable-to-assess">Não avaliada</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Observação"
                        value={allergyForm.note || ""}
                        onChange={(e) => handleAllergyFormChange("note", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button type="button" isLoading={isSavingAllergy} onClick={() => void handleSaveAllergy()}>
                      {editingAllergyId ? "Salvar edição" : "Salvar alergia"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetAllergyForm();
                        setAllergyFeedback(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {isLoadingAllergies ? (
                <p className="text-[#6F7F95] dark:text-gray-400">Carregando alergias...</p>
              ) : editableAllergies.length === 0 ? (
                <p className="text-[#6F7F95] dark:text-gray-400">Nenhuma alergia cadastrada.</p>
              ) : (
                <div className="space-y-4">
                  {editableAllergies.map((allergy) => (
                    <div key={allergy.id} className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Substância</p>
                            <p className="text-base font-medium text-[#233B6E] dark:text-white">
                              {allergy.code?.text || "Não informado"}
                            </p>
                          </div>

                          {allergy.criticality && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Criticidade</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {criticalityMap[allergy.criticality] || allergy.criticality}
                              </p>
                            </div>
                          )}

                          {allergy.note && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Observação</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {allergy.note}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 min-h-0 p-0"
                            onClick={() => handleStartEditAllergy(allergy)}
                            aria-label="Editar alergia"
                            title="Editar alergia"
                          >
                            <EditNoteIcon />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 min-h-0 p-0"
                            onClick={() => void handleDeleteAllergy(allergy.id)}
                            isLoading={deletingAllergyId === allergy.id}
                            aria-label="Remover alergia"
                            title="Remover alergia"
                          >
                          {deletingAllergyId !== allergy.id && <TrashIcon />}
                        </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Minhas condições" subtitle="Condições informadas no seu perfil" />
            <CardContent>
              {conditionFeedback && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                    conditionFeedback.type === "success"
                      ? "border-[#34A853] bg-[#eaf7ee] text-[#1f6f33] dark:bg-[#112217] dark:text-[#7ddc95]"
                      : "border-[#c62828] bg-[#fdecec] text-[#8f1f1f] dark:bg-[#2a1111] dark:text-[#ff8e8e]"
                  }`}
                >
                  {conditionFeedback.message}
                </div>
              )}

              {!isAddingCondition ? (
                <div className="mb-4">
                  <Button type="button" onClick={() => setIsAddingCondition(true)}>
                    Adicionar condição
                  </Button>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-lg bg-[#EAF3FB] dark:bg-[#2a2a2a]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Condição"
                      value={conditionForm.name || ""}
                      onChange={(e) => handleConditionFormChange("name", e.target.value)}
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-3 text-base border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                        value={conditionForm.clinicalStatus || "active"}
                        onChange={(e) => handleConditionFormChange("clinicalStatus", e.target.value)}
                      >
                        <option value="active">Ativa</option>
                        <option value="inactive">Inativa</option>
                        <option value="resolved">Resolvida</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                        Gravidade
                      </label>
                      <select
                        className="w-full px-4 py-3 text-base border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                        value={conditionForm.severity || ""}
                        onChange={(e) => handleConditionFormChange("severity", e.target.value)}
                      >
                        <option value="">Não informada</option>
                        <option value="mild">Leve</option>
                        <option value="moderate">Moderada</option>
                        <option value="severe">Grave</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Observação"
                        value={conditionForm.note || ""}
                        onChange={(e) => handleConditionFormChange("note", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button type="button" isLoading={isSavingCondition} onClick={() => void handleSaveCondition()}>
                      {editingConditionId ? "Salvar edição" : "Salvar condição"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetConditionForm();
                        setConditionFeedback(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {isLoadingConditions ? (
                <p className="text-[#6F7F95] dark:text-gray-400">Carregando condições...</p>
              ) : editableConditions.length === 0 ? (
                <p className="text-[#6F7F95] dark:text-gray-400">Nenhuma condição cadastrada.</p>
              ) : (
                <div className="space-y-4">
                  {editableConditions.map((condition) => (
                    <div key={condition.id} className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Condição</p>
                            <p className="text-base font-medium text-[#233B6E] dark:text-white">
                              {condition.code?.text || "Não informado"}
                            </p>
                          </div>

                          {condition.clinicalStatus?.text && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Status</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {conditionStatusMap[condition.clinicalStatus.text.toLowerCase()] || condition.clinicalStatus.text}
                              </p>
                            </div>
                          )}

                          {condition.severity?.text && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Gravidade</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {conditionSeverityMap[condition.severity.text.toLowerCase()] || condition.severity.text}
                              </p>
                            </div>
                          )}

                          {condition.note && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Observação</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {condition.note}
                              </p>
                            </div>
                          )}
                        </div>

                         <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 min-h-0 p-0"
                            onClick={() => handleStartEditCondition(condition)}
                            aria-label="Editar condição"
                            title="Editar condição"
                          >
                            <EditNoteIcon />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 min-h-0 p-0"
                            onClick={() => void handleDeleteCondition(condition.id)}
                            isLoading={deletingConditionId === condition.id}
                            aria-label="Remover condição"
                            title="Remover condição"
                          >
                          {deletingConditionId !== condition.id && <TrashIcon />}
                        </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Meus medicamentos" subtitle="Medicamentos informados no seu perfil" />
            <CardContent>
              {medicationFeedback && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                    medicationFeedback.type === "success"
                      ? "border-[#34A853] bg-[#eaf7ee] text-[#1f6f33] dark:bg-[#112217] dark:text-[#7ddc95]"
                      : "border-[#c62828] bg-[#fdecec] text-[#8f1f1f] dark:bg-[#2a1111] dark:text-[#ff8e8e]"
                  }`}
                >
                  {medicationFeedback.message}
                </div>
              )}

              {!isAddingMedication ? (
                <div className="mb-4">
                  <Button type="button" onClick={() => setIsAddingMedication(true)}>
                    Adicionar medicamento
                  </Button>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-lg bg-[#EAF3FB] dark:bg-[#2a2a2a]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Medicamento"
                      value={medicationForm.name || ""}
                      onChange={(e) => handleMedicationFormChange("name", e.target.value)}
                      required
                    />

                    <div>
                      <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-3 text-base border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                        value={medicationForm.status || "active"}
                        onChange={(e) => handleMedicationFormChange("status", e.target.value)}
                      >
                        <option value="active">Em uso</option>
                        <option value="completed">Concluído</option>
                        <option value="stopped">Suspenso</option>
                      </select>
                    </div>

                    <Input
                      label="Dosagem"
                      value={medicationForm.dosage || ""}
                      onChange={(e) => handleMedicationFormChange("dosage", e.target.value)}
                    />

                    <Input
                      label="Via de administração"
                      value={medicationForm.route || ""}
                      onChange={(e) => handleMedicationFormChange("route", e.target.value)}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Observação"
                        value={medicationForm.note || ""}
                        onChange={(e) => handleMedicationFormChange("note", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button type="button" isLoading={isSavingMedication} onClick={() => void handleSaveMedication()}>
                      {editingMedicationId ? "Salvar edição" : "Salvar medicamento"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetMedicationForm();
                        setMedicationFeedback(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {isLoadingMedications ? (
                <p className="text-[#6F7F95] dark:text-gray-400">Carregando medicamentos...</p>
              ) : editableMedications.length === 0 ? (
                <p className="text-[#6F7F95] dark:text-gray-400">Nenhum medicamento cadastrado.</p>
              ) : (
                <div className="space-y-4">
                  {editableMedications.map((medication) => (
                    <div key={medication.id} className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Medicamento</p>
                            <p className="text-base font-medium text-[#233B6E] dark:text-white">
                              {medication.medication?.text || "Não informado"}
                            </p>
                          </div>

                          {medication.status && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Status</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {medicationStatusMap[medication.status] || medication.status}
                              </p>
                            </div>
                          )}

                          {medication.dosage && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Dosagem</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {medication.dosage}
                              </p>
                            </div>
                          )}

                          {medication.route && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Via</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {medication.route}
                              </p>
                            </div>
                          )}

                          {medication.note && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Observação</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {medication.note}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 min-h-0 p-0"
                            onClick={() => handleStartEditMedication(medication)}
                            aria-label="Editar medicamento"
                            title="Editar medicamento"
                          >
                            <EditNoteIcon />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 min-h-0 p-0"
                            onClick={() => void handleDeleteMedication(medication.id)}
                            isLoading={deletingMedicationId === medication.id}
                            aria-label="Remover medicamento"
                            title="Remover medicamento"
                          >
                            {deletingMedicationId !== medication.id && <TrashIcon />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Documentos" subtitle="Documentos pessoais e documentos recebidos" />
            <CardContent>
              {personalFeedback && (
                <div className="mb-4 rounded-lg border border-[#C9D9EA] bg-[#EAF3FB] px-4 py-3 text-sm text-[#233B6E] dark:bg-[#2a2a2a] dark:text-white">
                  {personalFeedback}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#233B6E] dark:text-white mb-4">
                  {editingPersonalDocumentId ? "Editar documento pessoal" : "Adicionar documento pessoal"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Título"
                      value={personalTitle}
                      onChange={(e) => setPersonalTitle(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Tipo do documento"
                      value={personalDocumentType}
                      onChange={(e) => setPersonalDocumentType(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Descrição"
                      value={personalDescription}
                      onChange={(e) => setPersonalDescription(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                      {editingPersonalDocumentId ? "Novo arquivo, opcional" : "Arquivo"}
                    </label>
                    <input
                      type="file"
                      className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                      onChange={(e) => setPersonalFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-center">
                    <Button
                      type="button"
                      isLoading={isUploadingPersonalDocument}
                      onClick={() => void handleUploadPersonalDocument()}
                    >
                      {editingPersonalDocumentId ? "Salvar alterações" : "Enviar documento pessoal"}
                    </Button>
                    {editingPersonalDocumentId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEditPersonalDocument}
                      >
                        Cancelar edição
                      </Button>
)}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#233B6E] dark:text-white mb-4">
                  Documentos pessoais
                </h3>

                {isLoadingPersonalDocuments ? (
                  <p className="text-[#6F7F95] dark:text-gray-400">Carregando documentos pessoais...</p>
                ) : personalDocuments.length === 0 ? (
                  <p className="text-[#6F7F95] dark:text-gray-400">Nenhum documento pessoal enviado até o momento.</p>
                ) : (
                  <div className="space-y-4">
                    {personalDocuments.map((doc) => (
                      <div key={doc.id} className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Título</p>
                            <p className="text-base font-medium text-[#233B6E] dark:text-white">{doc.title}</p>
                          </div>

                          {doc.documentType && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Tipo</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">{doc.documentType}</p>
                            </div>
                          )}

                          {doc.description && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Descrição</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">{doc.description}</p>
                            </div>
                          )}

                          {doc.uploadedAt && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Enviado em</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                          )}

                            <div className="pt-4 flex flex-wrap justify-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleStartEditPersonalDocument(doc)}
                            >
                              Editar documento
                            </Button>

                            {doc.fileUrl && (
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-[#233B6E] text-white font-medium hover:bg-[#1C315D]"
                              >
                                Abrir documento
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#233B6E] dark:text-white mb-4">
                  Documentos recebidos
                </h3>

                {documentFeedback && (
                  <div className="mb-4 rounded-lg border border-[#C9D9EA] bg-[#EAF3FB] px-4 py-3 text-sm text-[#233B6E] dark:bg-[#2a2a2a] dark:text-white">
                    {documentFeedback}
                  </div>
                )}

                {isLoadingDocuments ? (
                  <p className="text-[#6F7F95] dark:text-gray-400">Carregando documentos...</p>
                ) : documents.length === 0 ? (
                  <p className="text-[#6F7F95] dark:text-gray-400">Nenhum documento recebido até o momento.</p>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Título</p>
                            <p className="text-base font-medium text-[#233B6E] dark:text-white">
                              {doc.title}
                            </p>
                          </div>

                          {doc.documentType && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Tipo</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {doc.documentType}
                              </p>
                            </div>
                          )}

                          {doc.clinicName && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Clínica remetente</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {doc.clinicName}
                              </p>
                            </div>
                          )}

                          {doc.description && (
                            <div>
                              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Descrição</p>
                              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                {doc.description}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {doc.issuedAt && (
                              <div>
                                <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Data de emissão</p>
                                <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                  {formatDate(doc.issuedAt)}
                                </p>
                              </div>
                            )}

                            {doc.uploadedAt && (
                              <div>
                                <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Enviado em</p>
                                <p className="text-base font-medium text-[#233B6E] dark:text-white">
                                  {formatDate(doc.uploadedAt)}
                                </p>
                              </div>
                            )}
                          </div>

                          {doc.fileUrl && (
                            <div className="pt-4 flex justify-center">
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-[#233B6E] text-white font-medium hover:bg-[#1C315D]"
                              >
                                Abrir documento
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Privacidade" subtitle="Informações sobre o uso e proteção dos seus dados" />
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-base font-medium text-[#233B6E] dark:text-white mb-2">
                    Seus dados são exibidos apenas para consulta do próprio paciente
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400">
                    Este portal apresenta informações clínicas para visualização segura, respeitando o contexto acadêmico do sistema
                    e a proposta de acesso individual ao histórico de saúde.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                    <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Acesso autenticado</p>
                    <p className="text-base font-medium text-[#233B6E] dark:text-white">Protegido por login do usuário</p>
                  </div>
                  <div className="p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                    <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Compartilhamento</p>
                    <p className="text-base font-medium text-[#233B6E] dark:text-white">Não configurável nesta versão</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}