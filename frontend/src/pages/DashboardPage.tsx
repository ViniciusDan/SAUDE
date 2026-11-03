import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Tabs } from "../components/Tabs";
import { Card, CardContent } from "../components/ui/Card";
import { SkeletonCard, SkeletonTable } from "../components/ui/Skeleton";
import { Timeline } from "../components/Timeline";
import { Button } from "../components/ui/Button";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type {
  AllergyIntoleranceResource,
  ClinicalDocumentResource,
  ConditionResource,
  MedicationStatementResource,
  PatientSummaryBundle
} from "../types/fhir";
import { buildClinicalHistory } from "../utils/buildClinicalHistory";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<PatientSummaryBundle | null>(null);
  const [editableAllergies, setEditableAllergies] = useState<AllergyIntoleranceResource[]>([]);
  const [editableConditions, setEditableConditions] = useState<ConditionResource[]>([]);
  const [editableMedications, setEditableMedications] = useState<MedicationStatementResource[]>([]);
  const [receivedDocuments, setReceivedDocuments] = useState<ClinicalDocumentResource[]>([]);
  const [personalDocuments, setPersonalDocuments] = useState<ClinicalDocumentResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      setIsLoading(true);

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
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboardData();
  }, [user]);

  const historyItems = useMemo(() => {
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

  const dashboardTimelineItems = useMemo(() => {
    return historyItems.slice(0, 4);
  }, [historyItems]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard" }]} />

      <h1 className="text-2xl sm:text-3xl font-bold text-[#233B6E] dark:text-white mb-4 sm:mb-6">
        Dashboard
      </h1>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <SkeletonTable rows={5} />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Atendimentos</p>
                    <p className="text-2xl font-bold text-[#233B6E] dark:text-white">
                      {summary.encounters.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#233B6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Exames Recentes</p>
                    <p className="text-2xl font-bold text-[#233B6E] dark:text-white">
                      {summary.observations.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#8FB6E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Medicamentos</p>
                    <p className="text-2xl font-bold text-[#233B6E] dark:text-white">
                      {editableMedications.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#8FB6E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Condições</p>
                    <p className="text-2xl font-bold text-[#233B6E] dark:text-white">
                      {editableConditions.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#EAF3FB] flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#233B6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-[#233B6E] dark:text-white">
                      Linha do Tempo Clínica
                    </h2>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/historico")}
                    >
                      Ir para histórico completo
                    </Button>
                  </div>

                  {dashboardTimelineItems.length > 0 ? (
                    <Timeline
                      items={dashboardTimelineItems}
                      initialVisibleCount={4}
                      showToggleButton={false}
                    />
                  ) : (
                    <p className="text-[#6F7F95] dark:text-gray-400">Nenhum evento registrado</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent>
                  <h2 className="text-xl font-semibold text-[#233B6E] dark:text-white mb-4">
                    Próximos Agendamentos
                  </h2>
                  <p className="text-[#6F7F95] dark:text-gray-400 text-sm">
                    Nenhum agendamento próximo
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardContent>
              <Tabs summary={summary} />
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-[#6F7F95] dark:text-gray-400">Não foi possível carregar os dados.</p>
      )}
    </div>
  );
}