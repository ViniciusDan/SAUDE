import axios from "axios";
import type {
  AllergyIntoleranceResource,
  ClinicalDocumentResource,
  ConditionResource,
  CreateEditableAllergyPayload,
  CreateEditableConditionPayload,
  CreateEditableMedicationPayload,
  MedicationStatementResource,
  PatientResource,
  PatientSummaryBundle,
  UpdatePatientProfilePayload
} from "../types/fhir";

const API_URL = "/api";

async function getPatientSummary(patientId: string, token: string): Promise<PatientSummaryBundle> {
  const response = await axios.get(`${API_URL}/patients/${patientId}/summary`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
}

async function updatePatientProfile(
  patientId: string,
  token: string,
  payload: UpdatePatientProfilePayload
): Promise<PatientResource> {
  const response = await axios.put(`${API_URL}/patients/${patientId}/profile`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.patient;
}

async function listEditableAllergies(patientId: string, token: string): Promise<AllergyIntoleranceResource[]> {
  const response = await axios.get(`${API_URL}/patients/${patientId}/allergies`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function createEditableAllergy(
  patientId: string,
  token: string,
  payload: CreateEditableAllergyPayload
): Promise<AllergyIntoleranceResource> {
  const response = await axios.post(`${API_URL}/patients/${patientId}/allergies`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function updateEditableAllergy(
  patientId: string,
  token: string,
  allergyId: string,
  payload: CreateEditableAllergyPayload
): Promise<AllergyIntoleranceResource> {
  const response = await axios.put(`${API_URL}/patients/${patientId}/allergies/${allergyId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function deleteEditableAllergy(patientId: string, token: string, allergyId: string): Promise<void> {
  await axios.delete(`${API_URL}/patients/${patientId}/allergies/${allergyId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

async function listEditableConditions(patientId: string, token: string): Promise<ConditionResource[]> {
  const response = await axios.get(`${API_URL}/patients/${patientId}/conditions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function createEditableCondition(
  patientId: string,
  token: string,
  payload: CreateEditableConditionPayload
): Promise<ConditionResource> {
  const response = await axios.post(`${API_URL}/patients/${patientId}/conditions`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function updateEditableCondition(
  patientId: string,
  token: string,
  conditionId: string,
  payload: CreateEditableConditionPayload
): Promise<ConditionResource> {
  const response = await axios.put(`${API_URL}/patients/${patientId}/conditions/${conditionId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function deleteEditableCondition(patientId: string, token: string, conditionId: string): Promise<void> {
  await axios.delete(`${API_URL}/patients/${patientId}/conditions/${conditionId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

async function listEditableMedications(patientId: string, token: string): Promise<MedicationStatementResource[]> {
  const response = await axios.get(`${API_URL}/patients/${patientId}/medications`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function createEditableMedication(
  patientId: string,
  token: string,
  payload: CreateEditableMedicationPayload
): Promise<MedicationStatementResource> {
  const response = await axios.post(`${API_URL}/patients/${patientId}/medications`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function updateEditableMedication(
  patientId: string,
  token: string,
  medicationId: string,
  payload: CreateEditableMedicationPayload
): Promise<MedicationStatementResource> {
  const response = await axios.put(`${API_URL}/patients/${patientId}/medications/${medicationId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function deleteEditableMedication(patientId: string, token: string, medicationId: string): Promise<void> {
  await axios.delete(`${API_URL}/patients/${patientId}/medications/${medicationId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

async function listPatientDocuments(patientId: string, token: string): Promise<ClinicalDocumentResource[]> {
  const response = await axios.get(`${API_URL}/patients/${patientId}/documents`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function listPersonalDocuments(patientId: string, token: string): Promise<ClinicalDocumentResource[]> {
  const response = await axios.get(`${API_URL}/patients/${patientId}/personal-documents`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function uploadPersonalDocument(
  patientId: string,
  token: string,
  formData: FormData
): Promise<void> {
  await axios.post(`${API_URL}/patients/${patientId}/personal-documents`, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

async function updatePersonalDocument(
  patientId: string,
  token: string,
  documentId: string,
  formData: FormData
): Promise<void> {
  await axios.put(`${API_URL}/patients/${patientId}/personal-documents/${documentId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


export const fhirClient = {
  getPatientSummary,
  updatePatientProfile,
  listEditableAllergies,
  createEditableAllergy,
  updateEditableAllergy,
  deleteEditableAllergy,
  listEditableConditions,
  createEditableCondition,
  updateEditableCondition,
  deleteEditableCondition,
  listEditableMedications,
  createEditableMedication,
  updateEditableMedication,
  deleteEditableMedication,
  listPatientDocuments,
  listPersonalDocuments,
  uploadPersonalDocument,
  updatePersonalDocument
};