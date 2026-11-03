import { useEffect, useState } from "react";
import axios from "axios";
import type { ClinicalDocumentResource } from "../types/fhir";

type ClinicAuthData = {
  accessToken: string;
  user: {
    id: string;
    identifier: string;
    name: string;
    role: "clinic";
  };
};

type FoundPatient = {
  id: string;
  cpf?: string;
  name: string;
  birthDate?: string;
  gender?: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatGender(value?: string) {
  if (value === "male") return "Masculino";
  if (value === "female") return "Feminino";
  if (value === "other") return "Outro";
  return "Não informado";
}

export function ClinicPatientSummaryPage() {
  const authRaw = localStorage.getItem("clinic.auth");
  const clinic = authRaw ? (JSON.parse(authRaw) as ClinicAuthData) : null;

  const patientId = window.location.pathname.split("/").pop();
  const [patient, setPatient] = useState<FoundPatient | null>(null);
  const [documents, setDocuments] = useState<ClinicalDocumentResource[]>([]);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [hidingDocumentId, setHidingDocumentId] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");

  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [isSavingDocumentEdit, setIsSavingDocumentEdit] = useState(false);
  const [editDocumentForm, setEditDocumentForm] = useState({
    title: "",
    documentType: "",
    description: "",
    issuedAt: ""
  });

  useEffect(() => {
    async function loadPatient() {
      if (!clinic?.accessToken || !patientId) {
        setError("Não foi possível carregar os dados do paciente.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/clinic/patients/${patientId}/summary`, {
          headers: {
            Authorization: `Bearer ${clinic.accessToken}`
          }
        });

        const summary = response.data;
        const patientName = summary.patient.name?.[0]?.text || "Paciente";
        const patientCpf =
          summary.patient.identifier?.find((item: { value?: string }) => item.value?.length === 11)?.value ||
          summary.patient.identifier?.[0]?.value ||
          "-";

        setPatient({
          id: patientId,
          name: patientName,
          cpf: patientCpf,
          birthDate: summary.patient.birthDate,
          gender: summary.patient.gender
        });
      } catch {
        setError("Não foi possível carregar os dados do paciente.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPatient();
  }, [clinic?.accessToken, patientId]);

  useEffect(() => {
    async function loadDocuments() {
      if (!clinic?.accessToken || !patientId) {
        setIsLoadingDocuments(false);
        return;
      }

      try {
        const response = await axios.get(`/api/clinic/patients/${patientId}/documents`, {
          headers: {
            Authorization: `Bearer ${clinic.accessToken}`
          }
        });

        setDocuments(response.data);
      } catch {
        setUploadFeedback("Não foi possível carregar os documentos enviados.");
      } finally {
        setIsLoadingDocuments(false);
      }
    }

    void loadDocuments();
  }, [clinic?.accessToken, patientId]);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();

    if (!clinic?.accessToken || !patientId) {
      setUploadFeedback("Sessão da clínica não encontrada.");
      return;
    }

    if (!title.trim()) {
      setUploadFeedback("Informe o título do documento.");
      return;
    }

    if (!file) {
      setUploadFeedback("Selecione um arquivo.");
      return;
    }

    setIsUploading(true);
    setUploadFeedback("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("documentType", documentType);
      formData.append("description", description);
      formData.append("issuedAt", issuedAt);
      formData.append("file", file);

      await axios.post(`/api/clinic/patients/${patientId}/documents`, formData, {
        headers: {
          Authorization: `Bearer ${clinic.accessToken}`
        }
      });

      const response = await axios.get(`/api/clinic/patients/${patientId}/documents`, {
        headers: {
          Authorization: `Bearer ${clinic.accessToken}`
        }
      });

      setDocuments(response.data);
      setTitle("");
      setDocumentType("");
      setDescription("");
      setIssuedAt("");
      setFile(null);
      setFilePreviewUrl("");
      setUploadFeedback("Documento enviado com sucesso.");
    } catch {
      setUploadFeedback("Não foi possível enviar o documento.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleHideDocument(documentId: string) {
    if (!clinic?.accessToken) return;

    setHidingDocumentId(documentId);
    setUploadFeedback("");

    try {
      await axios.patch(
        `/api/clinic/documents/${documentId}/hide`,
        {},
        {
          headers: {
            Authorization: `Bearer ${clinic.accessToken}`
          }
        }
      );

      setDocuments((current) =>
        current.map((doc) =>
          doc.id === documentId
            ? { ...doc, isVisibleToPatient: false }
            : doc
        )
      );

      setUploadFeedback("Documento ocultado do portal do paciente com sucesso.");
    } catch {
      setUploadFeedback("Não foi possível ocultar o documento.");
    } finally {
      setHidingDocumentId(null);
    }
  }

  async function handleShowDocument(documentId: string) {
    if (!clinic?.accessToken) return;

    setHidingDocumentId(documentId);
    setUploadFeedback("");

    try {
      await axios.patch(
        `/api/clinic/documents/${documentId}/show`,
        {},
        {
          headers: {
            Authorization: `Bearer ${clinic.accessToken}`
          }
        }
      );

      setDocuments((current) =>
        current.map((doc) =>
          doc.id === documentId
            ? { ...doc, isVisibleToPatient: true }
            : doc
        )
      );

      setUploadFeedback("Documento exibido novamente no portal do paciente com sucesso.");
    } catch {
      setUploadFeedback("Não foi possível exibir o documento novamente.");
    } finally {
      setHidingDocumentId(null);
    }
  }

  function handleStartEditDocument(doc: ClinicalDocumentResource) {
    setEditingDocumentId(doc.id);
    setEditDocumentForm({
      title: doc.title || "",
      documentType: doc.documentType || "",
      description: doc.description || "",
      issuedAt: doc.issuedAt ? String(doc.issuedAt).slice(0, 10) : ""
    });
    setUploadFeedback("");
  }

  function handleCancelEditDocument() {
    setEditingDocumentId(null);
    setEditDocumentForm({
      title: "",
      documentType: "",
      description: "",
      issuedAt: ""
    });
  }

  async function handleSaveDocumentEdit(documentId: string) {
    if (!clinic?.accessToken) return;

    if (!editDocumentForm.title.trim()) {
      setUploadFeedback("Informe o título do documento.");
      return;
    }

    setIsSavingDocumentEdit(true);
    setUploadFeedback("");

    try {
      const response = await axios.put(
        `/api/clinic/documents/${documentId}`,
        {
          title: editDocumentForm.title,
          documentType: editDocumentForm.documentType,
          description: editDocumentForm.description,
          issuedAt: editDocumentForm.issuedAt || undefined
        },
        {
          headers: {
            Authorization: `Bearer ${clinic.accessToken}`
          }
        }
      );

      const updatedDocument = response.data.document;

      setDocuments((current) =>
        current.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                title: updatedDocument.title,
                documentType: updatedDocument.documentType,
                description: updatedDocument.description,
                issuedAt: updatedDocument.issuedAt
              }
            : doc
        )
      );

      setUploadFeedback("Documento atualizado com sucesso.");
      handleCancelEditDocument();
    } catch {
      setUploadFeedback("Não foi possível atualizar o documento.");
    } finally {
      setIsSavingDocumentEdit(false);
    }
  }

  function formatFileSize(size?: number) {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (isLoading) {
    return <div className="min-h-screen p-6">Carregando...</div>;
  }

  if (error || !patient) {
    return <div className="min-h-screen p-6">{error || "Erro ao carregar"}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F7FBFF] dark:bg-[#0f0f0f] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-[#C9D9EA] dark:border-transparent p-8">
          <button
            onClick={() => (window.location.href = "/clinic/dashboard")}
            className="mb-6 px-4 py-2 rounded-lg border border-[#C9D9EA] text-[#233B6E] dark:text-white dark:border-[#444] hover:bg-[#EAF3FB]"
          >
            Voltar
          </button>

          <h1 className="text-3xl font-bold text-[#233B6E] dark:text-white mb-6">
            Dados do Paciente
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Nome</p>
              <p className="text-base font-medium text-[#233B6E] dark:text-white">{patient.name}</p>
            </div>

            <div>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">CPF</p>
              <p className="text-base font-medium text-[#233B6E] dark:text-white">{patient.cpf}</p>
            </div>

            <div>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Data de nascimento</p>
              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                {formatDate(patient.birthDate)}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Sexo</p>
              <p className="text-base font-medium text-[#233B6E] dark:text-white">
                {formatGender(patient.gender)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-[#C9D9EA] dark:border-transparent p-8">
          <h2 className="text-2xl font-bold text-[#233B6E] dark:text-white mb-2">
            Enviar documento ao paciente
          </h2>

          <p className="text-[#6F7F95] dark:text-gray-400 mb-6">
            Faça upload de um documento vinculado a este paciente.
          </p>

          {uploadFeedback && (
            <div className="mb-4 rounded-lg border border-[#C9D9EA] bg-[#EAF3FB] px-4 py-3 text-sm text-[#233B6E] dark:bg-[#2a2a2a] dark:text-white">
              {uploadFeedback}
            </div>
          )}

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                Título
              </label>
              <input
                className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] placeholder:text-[#6F7F95] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Laudo de exame laboratorial"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                Tipo do documento
              </label>
              <input
                className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] placeholder:text-[#6F7F95] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                placeholder="Ex.: Exame, Laudo, Relatório"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                Data de emissão
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                Descrição
              </label>
              <input
                className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] placeholder:text-[#6F7F95] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Observações sobre o documento"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                Arquivo
              </label>
              <input
                type="file"
                className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);

                  if (selectedFile) {
                    setFilePreviewUrl(URL.createObjectURL(selectedFile));
                  } else {
                    setFilePreviewUrl("");
                  }
                }}
              />
            </div>

            <div className="md:col-span-2 flex justify-center">
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-3 rounded-lg bg-[#233B6E] text-white font-semibold hover:bg-[#1C315D] disabled:opacity-60"
              >
                {isUploading ? "Enviando..." : "Enviar documento"}
              </button>
            </div>
          </form>

          {(title || documentType || description || issuedAt || file) && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-[#233B6E] dark:text-white mb-2">
                Pré-visualização do documento
              </h2>

              <p className="text-[#6F7F95] dark:text-gray-400 mb-6">
                Confira os dados antes de enviar ao paciente.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-8 items-start">
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[#EAF3FB] dark:bg-[#2a2a2a] border border-[#C9D9EA] dark:border-[#333] p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Título</p>
                        <p className="text-base font-medium text-[#233B6E] dark:text-white">
                          {title || "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Tipo do documento</p>
                        <p className="text-base font-medium text-[#233B6E] dark:text-white">
                          {documentType || "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Data de emissão</p>
                        <p className="text-base font-medium text-[#233B6E] dark:text-white">
                          {issuedAt ? formatDate(issuedAt) : "Não informada"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Arquivo</p>
                        <p className="text-base font-medium text-[#233B6E] dark:text-white break-words">
                          {file?.name || "Nenhum arquivo selecionado"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Descrição</p>
                      <p className="text-base font-medium text-[#233B6E] dark:text-white">
                        {description || "Sem descrição"}
                      </p>
                    </div>
                  </div>

                  {file && (
                    <div className="rounded-2xl bg-[#EAF3FB] dark:bg-[#2a2a2a] border border-[#C9D9EA] dark:border-[#333] p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Nome do arquivo</p>
                          <p className="text-base font-medium text-[#233B6E] dark:text-white break-words">
                            {file.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Tamanho</p>
                          <p className="text-base font-medium text-[#233B6E] dark:text-white">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Tipo MIME</p>
                          <p className="text-base font-medium text-[#233B6E] dark:text-white">
                            {file.type || "Não identificado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-[#EAF3FB] dark:bg-[#2a2a2a] border border-[#C9D9EA] dark:border-[#333] p-6">
                  <p className="text-sm font-semibold text-[#233B6E] dark:text-white mb-4">
                    Visualização do arquivo
                  </p>

                  {!file ? (
                    <div className="h-[600px] flex items-center justify-center rounded-xl bg-white dark:bg-[#111319] border border-[#C9D9EA] dark:border-[#333]">
                      <p className="text-sm text-[#6F7F95] dark:text-gray-400">
                        Selecione um arquivo para visualizar.
                      </p>
                    </div>
                  ) : file.type === "application/pdf" && filePreviewUrl ? (
                    <iframe
                      src={filePreviewUrl}
                      title="Pré-visualização do PDF"
                      className="w-full h-[850px] rounded-xl border border-[#C9D9EA] dark:border-[#333] bg-white"
                    />
                  ) : file.type.startsWith("image/") && filePreviewUrl ? (
                    <div className="flex items-center justify-center h-[850px] rounded-xl bg-white dark:bg-[#111319] border border-[#C9D9EA] dark:border-[#333] p-4">
                      <img
                        src={filePreviewUrl}
                        alt="Prévia do arquivo"
                        className="max-h-full max-w-full rounded-lg object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-[600px] flex flex-col items-center justify-center rounded-xl bg-white dark:bg-[#111319] border border-[#C9D9EA] dark:border-[#333] p-6 text-center">
                      <p className="text-base font-medium text-[#233B6E] dark:text-white mb-2">
                        Pré-visualização indisponível
                      </p>
                      <p className="text-sm text-[#6F7F95] dark:text-gray-400">
                        Este tipo de arquivo não pode ser exibido diretamente antes do envio.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-[#C9D9EA] dark:border-transparent p-8">
          <h2 className="text-2xl font-bold text-[#233B6E] dark:text-white mb-2">
            Documentos já enviados
          </h2>

          <p className="text-[#6F7F95] dark:text-gray-400 mb-6">
            Histórico de documentos enviados por esta clínica para este paciente.
          </p>

          {isLoadingDocuments ? (
            <p className="text-[#6F7F95] dark:text-gray-400">Carregando documentos...</p>
          ) : documents.length === 0 ? (
            <p className="text-[#6F7F95] dark:text-gray-400">Nenhum documento enviado ainda.</p>
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

                    {doc.description && (
                      <div>
                        <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Descrição</p>
                        <p className="text-base font-medium text-[#233B6E] dark:text-white">
                          {doc.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                      <div>
                        <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Visível ao paciente</p>
                        <p className="text-base font-medium text-[#233B6E] dark:text-white">
                          {doc.isVisibleToPatient ? "Sim" : "Não"}
                        </p>
                      </div>
                    </div>

                    {editingDocumentId === doc.id && (
                      <div className="mt-4 p-4 rounded-xl bg-white dark:bg-[#111319] border border-[#C9D9EA] dark:border-[#333]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                              Título
                            </label>
                            <input
                              className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                              value={editDocumentForm.title}
                              onChange={(e) =>
                                setEditDocumentForm((current) => ({
                                  ...current,
                                  title: e.target.value
                                }))
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                              Tipo do documento
                            </label>
                            <input
                              className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                              value={editDocumentForm.documentType}
                              onChange={(e) =>
                                setEditDocumentForm((current) => ({
                                  ...current,
                                  documentType: e.target.value
                                }))
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                              Data de emissão
                            </label>
                            <input
                              type="date"
                              className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                              value={editDocumentForm.issuedAt}
                              onChange={(e) =>
                                setEditDocumentForm((current) => ({
                                  ...current,
                                  issuedAt: e.target.value
                                }))
                              }
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
                              Descrição
                            </label>
                            <input
                              className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                              value={editDocumentForm.description}
                              onChange={(e) =>
                                setEditDocumentForm((current) => ({
                                  ...current,
                                  description: e.target.value
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => void handleSaveDocumentEdit(doc.id)}
                            disabled={isSavingDocumentEdit}
                            className="px-4 py-2 rounded-lg bg-[#233B6E] text-white font-medium hover:bg-[#1C315D] disabled:opacity-60"
                          >
                            {isSavingDocumentEdit ? "Salvando..." : "Salvar edição"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEditDocument}
                            className="px-4 py-2 rounded-lg border border-[#233B6E] text-[#233B6E] font-medium hover:bg-[#EAF3FB]"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2">
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

                      <button
                        type="button"
                        onClick={() => handleStartEditDocument(doc)}
                        className="inline-flex items-center px-4 py-2 rounded-lg border border-[#233B6E] text-[#233B6E] font-medium hover:bg-[#EAF3FB]"
                      >
                        Editar documento
                      </button>

                      {doc.isVisibleToPatient ? (
                        <button
                          type="button"
                          onClick={() => void handleHideDocument(doc.id)}
                          disabled={hidingDocumentId === doc.id}
                          className="inline-flex items-center px-4 py-2 rounded-lg border border-[#c62828] text-[#c62828] font-medium hover:bg-[#fdecec] disabled:opacity-60"
                        >
                          {hidingDocumentId === doc.id ? "Ocultando..." : "Ocultar do paciente"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleShowDocument(doc.id)}
                          disabled={hidingDocumentId === doc.id}
                          className="inline-flex items-center px-4 py-2 rounded-lg border border-[#233B6E] text-[#233B6E] font-medium hover:bg-[#EAF3FB] disabled:opacity-60"
                        >
                          {hidingDocumentId === doc.id ? "Exibindo..." : "Exibir ao paciente"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}