import { useEffect, useMemo, useState } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Timeline } from "../components/Timeline";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type {
  AllergyIntoleranceResource,
  ClinicalDocumentResource,
  ConditionResource,
  MedicationStatementResource,
  PatientSummaryBundle
} from "../types/fhir";
import { buildClinicalHistory, type ClinicalHistoryItem } from "../utils/buildClinicalHistory";

type HistoryFilter =
  | "all"
  | "encounter"
  | "observation"
  | "procedure"
  | "medication"
  | "condition"
  | "allergy"
  | "document";

export function HistoryPage() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<PatientSummaryBundle | null>(null);
  const [editableAllergies, setEditableAllergies] = useState<AllergyIntoleranceResource[]>([]);
  const [editableConditions, setEditableConditions] = useState<ConditionResource[]>([]);
  const [editableMedications, setEditableMedications] = useState<MedicationStatementResource[]>([]);
  const [receivedDocuments, setReceivedDocuments] = useState<ClinicalDocumentResource[]>([]);
  const [personalDocuments, setPersonalDocuments] = useState<ClinicalDocumentResource[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistoryData() {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        const [
          summaryData,
          allergiesData,
          conditionsData,
          medicationsData,
          receivedDocsData,
          personalDocsData
        ] = await Promise.all([
          fhirClient.getPatientSummary(user.id, user.token),
          fhirClient.listEditableAllergies(user.id, user.token),
          fhirClient.listEditableConditions(user.id, user.token),
          fhirClient.listEditableMedications(user.id, user.token),
          fhirClient.listPatientDocuments(user.id, user.token),
          fhirClient.listPersonalDocuments(user.id, user.token)
        ]);

        setSummary(summaryData);
        setEditableAllergies(allergiesData);
        setEditableConditions(conditionsData);
        setEditableMedications(medicationsData);
        setReceivedDocuments(receivedDocsData);
        setPersonalDocuments(personalDocsData);
      } catch {
        setError("Não foi possível carregar o histórico clínico.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadHistoryData();
  }, [user]);

  const historyItems = useMemo<ClinicalHistoryItem[]>(() => {
    if (!summary) return [];

    return buildClinicalHistory({
      summary,
      editableAllergies,
      editableConditions,
      editableMedications,
      receivedDocuments,
      personalDocuments
    });
  }, [
    summary,
    editableAllergies,
    editableConditions,
    editableMedications,
    receivedDocuments,
    personalDocuments
  ]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return historyItems.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.description?.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "encounter" && item.type === "encounter") ||
        (activeFilter === "observation" && item.type === "observation") ||
        (activeFilter === "procedure" && item.type === "procedure") ||
        (activeFilter === "medication" &&
          (item.type === "medication_start" || item.type === "medication_end")) ||
        (activeFilter === "condition" &&
          (item.type === "condition" || item.type === "condition_resolved")) ||
        (activeFilter === "allergy" && item.type === "allergy") ||
        (activeFilter === "document" &&
          (item.type === "document_received" || item.type === "document_personal"));

      return matchesSearch && matchesFilter;
    });
  }, [historyItems, searchTerm, activeFilter]);

  const filterButtonClass = (filter: HistoryFilter) =>
    `px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
      activeFilter === filter
        ? "bg-[#233B6E] text-white border-[#233B6E]"
        : "bg-white text-[#233B6E] border-[#C9D9EA] hover:bg-[#EAF3FB] dark:bg-[#1a1a1a] dark:text-white dark:border-[#333] dark:hover:bg-[#2a2a2a]"
    }`;

  if (!user) return null;

  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Histórico" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#233B6E] dark:text-white mb-2">
          Histórico Clínico
        </h1>
        <p className="text-[#6F7F95] dark:text-gray-400">
          Linha do tempo completa dos principais eventos clínicos e documentais.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <Card>
          <CardContent>
            <p className="text-[#c62828] dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Resumo do histórico" />
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#233B6E] dark:text-blue-400">{historyItems.length}</p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Eventos</p>
                </div>

                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#233B6E] dark:text-blue-400">
                    {historyItems.filter((item) => item.type === "encounter").length}
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Atendimentos</p>
                </div>

                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#34A853] dark:text-green-400">
                    {historyItems.filter((item) => item.type === "observation").length}
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Exames</p>
                </div>

                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#c62828] dark:text-red-400">
                    {historyItems.filter((item) => item.type === "procedure").length}
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Procedimentos</p>
                </div>

                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#233B6E] dark:text-blue-400">
                    {
                      historyItems.filter(
                        (item) =>
                          item.type === "medication_start" ||
                          item.type === "medication_end"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Medicamentos</p>
                </div>

                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#6F7F95] dark:text-gray-300">
                    {
                      historyItems.filter(
                        (item) =>
                          item.type === "condition" || item.type === "condition_resolved"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Condições</p>
                </div>

                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#F4B183] dark:text-orange-300">
                    {historyItems.filter((item) => item.type === "allergy").length}
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Alergias</p>
                </div>

                <div className="text-center p-4 bg-[#EAF3FB] dark:bg-[#2a2a2a] rounded-lg">
                  <p className="text-2xl font-bold text-[#7C9DC5] dark:text-sky-300">
                    {
                      historyItems.filter(
                        (item) =>
                          item.type === "document_received" ||
                          item.type === "document_personal"
                      ).length
                    }
                  </p>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Filtros e busca" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por medicamento, exame, documento, condição..."
                    className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] placeholder:text-[#6F7F95] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" className={filterButtonClass("all")} onClick={() => setActiveFilter("all")}>
                    Todos
                  </button>
                  <button type="button" className={filterButtonClass("encounter")} onClick={() => setActiveFilter("encounter")}>
                    Atendimentos
                  </button>
                  <button type="button" className={filterButtonClass("observation")} onClick={() => setActiveFilter("observation")}>
                    Exames
                  </button>
                  <button type="button" className={filterButtonClass("procedure")} onClick={() => setActiveFilter("procedure")}>
                    Procedimentos
                  </button>
                  <button type="button" className={filterButtonClass("medication")} onClick={() => setActiveFilter("medication")}>
                    Medicamentos
                  </button>
                  <button type="button" className={filterButtonClass("condition")} onClick={() => setActiveFilter("condition")}>
                    Condições
                  </button>
                  <button type="button" className={filterButtonClass("allergy")} onClick={() => setActiveFilter("allergy")}>
                    Alergias
                  </button>
                  <button type="button" className={filterButtonClass("document")} onClick={() => setActiveFilter("document")}>
                    Documentos
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Linha do tempo completa"
              subtitle={
                filteredItems.length === 1
                  ? "1 evento encontrado"
                  : `${filteredItems.length} eventos encontrados`
              }
            />
            <CardContent>
              {filteredItems.length === 0 ? (
                <p className="text-[#6F7F95] dark:text-gray-400">
                  Nenhum evento encontrado para os filtros atuais.
                </p>
              ) : (
                <Timeline
                  items={filteredItems}
                  initialVisibleCount={12}
                  showToggleButton={true}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}