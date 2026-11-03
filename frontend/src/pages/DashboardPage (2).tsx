import { useEffect, useState, useMemo } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Tabs } from "../components/Tabs";
import { Card, CardContent } from "../components/ui/Card";
import { SkeletonCard, SkeletonTable } from "../components/ui/Skeleton";
import { Timeline } from "../components/Timeline";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type { PatientSummaryBundle } from "../types/fhir";
import { formatDate } from "../utils/formatters";

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PatientSummaryBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      if (!user) {
        return;
      }
      setIsLoading(true);
      try {
        const data = await fhirClient.getPatientSummary(user.id, user.token);
        setSummary(data);
      } finally {
        setIsLoading(false);
      }
    }
    void loadSummary();
  }, [user]);

  const timelineItems = useMemo(() => {
    if (!summary) return [];
    
    const items = [];
    
    // Encounters
    summary.encounters.forEach((enc) => {
      items.push({
        id: `enc-${enc.id}`,
        date: enc.period?.start || enc.period?.end || "",
        title: enc.type?.[0]?.text || enc.reasonCode?.[0]?.text || "Atendimento",
        description: enc.serviceProvider?.display,
        type: "encounter" as const
      });
    });
    
    // Observations
    summary.observations.forEach((obs) => {
      const concept = obs.code.text || obs.code.coding?.[0]?.display || "Exame";
      let valueText = "-";
      if (obs.value?.kind === "Quantity") {
        valueText = `${obs.value.value} ${obs.value.unit || ""}`.trim();
      }
      items.push({
        id: `obs-${obs.id}`,
        date: obs.effectiveDateTime || obs.issued || "",
        title: concept,
        description: valueText,
        type: "observation" as const
      });
    });
    
    // Medications
    (summary.medications || []).forEach((med) => {
      items.push({
        id: `med-${med.id}`,
        date: med.effectiveStart || "",
        title: med.medication?.text || med.medication?.coding?.[0]?.display || "Medicamento",
        description: med.dosage,
        type: "medication" as const
      });
    });
    
    return items;
  }, [summary]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] dark:text-white mb-4 sm:mb-6">Dashboard</h1>
      
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
                    <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Atendimentos</p>
                    <p className="text-2xl font-bold text-[#212529] dark:text-white">{summary.encounters.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#1351B4] bg-opacity-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#1351B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Exames Recentes</p>
                    <p className="text-2xl font-bold text-[#212529] dark:text-white">{summary.observations.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#34A853] bg-opacity-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#34A853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Medicamentos</p>
                    <p className="text-2xl font-bold text-[#212529] dark:text-white">{(summary.medications || []).length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#ffc107] bg-opacity-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#ffc107]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Condições</p>
                    <p className="text-2xl font-bold text-[#212529] dark:text-white">{(summary.conditions || []).length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#6c757d] bg-opacity-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#6c757d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h2 className="text-xl font-semibold text-[#212529] dark:text-white mb-4">Linha do Tempo Clínica</h2>
                  {timelineItems.length > 0 ? (
                    <Timeline items={timelineItems.slice(0, 10)} />
                  ) : (
                    <p className="text-[#6c757d] dark:text-gray-400">Nenhum evento registrado</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardContent>
                  <h2 className="text-xl font-semibold text-[#212529] dark:text-white mb-4">Próximos Agendamentos</h2>
                  <p className="text-[#6c757d] dark:text-gray-400 text-sm">Nenhum agendamento próximo</p>
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
        <p className="text-[#6c757d] dark:text-gray-400">Não foi possível carregar os dados.</p>
      )}
    </div>
  );
}


