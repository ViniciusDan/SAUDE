import { useState } from "react";
import type { PatientSummaryBundle } from "../types/fhir";
import { formatDate, formatDateTime } from "../utils/formatters";
import { Input } from "./ui/Input";

type TabKey = "observations" | "encounters" | "allergies" | "conditions" | "procedures" | "medications";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TAB_CONFIG: TabConfig[] = [
  {
    key: "observations",
    label: "Exames",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    key: "encounters",
    label: "Atendimentos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    key: "allergies",
    label: "Alergias",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  {
    key: "conditions",
    label: "Condições",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    key: "procedures",
    label: "Procedimentos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )
  },
  {
    key: "medications",
    label: "Medicamentos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }
];

type TabsProps = {
  summary: PatientSummaryBundle;
};

function formatConditionStatus(status?: string) {
  if (!status) return "-";

  const normalized = status.trim().toLowerCase();

  if (normalized === "active" || normalized === "ativa") return "Ativa";
  if (normalized === "inactive" || normalized === "inativa") return "Inativa";
  if (normalized === "resolved" || normalized === "resolvida") return "Resolvida";

  return status;
}

function formatConditionSeverity(severity?: string) {
  if (!severity) return "-";

  const normalized = severity.trim().toLowerCase();

  if (normalized === "mild" || normalized === "leve") return "Leve";
  if (normalized === "moderate" || normalized === "moderada") return "Moderada";
  if (normalized === "severe" || normalized === "grave") return "Grave";

  return severity;
}

export function Tabs({ summary }: TabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("observations");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-[#C9D9EA] dark:border-[#333] mb-4 overflow-x-auto">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            className={`
              flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-t-lg
              font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap
              ${
                activeTab === tab.key
                  ? "bg-[#233B6E] text-white shadow-md"
                  : "bg-[#EAF3FB] text-[#233B6E] hover:bg-[#DCEAF8] dark:bg-[#1f2a3d] dark:text-gray-100 dark:hover:bg-[#24324c] border border-transparent"
              }
            `}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
        />
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        {renderTabContent(activeTab, summary, searchTerm)}
      </div>
    </div>
  );
}

function renderTabContent(tab: TabKey, summary: PatientSummaryBundle, searchTerm: string) {
  const filterItems = <T,>(items: T[], getText: (item: T) => string) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => getText(item).toLowerCase().includes(term));
  };

  switch (tab) {
    case "observations": {
      const filtered = filterItems(summary.observations, (obs) =>
        obs.code.text || obs.code.coding?.[0]?.display || ""
      );

      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
            <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <tr className="border-b border-[#C9D9EA] dark:border-[#333]">
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Exame</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Valor</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((observation) => {
                const concept = observation.code.text ?? observation.code.coding?.[0]?.display;
                let valueText = "-";
                if (observation.value?.kind === "Quantity") {
                  valueText = `${observation.value.value} ${observation.value.unit ?? ""}`.trim();
                } else if (observation.value?.kind === "String") {
                  valueText = observation.value.value;
                } else if (observation.value?.kind === "CodeableConcept") {
                  valueText = observation.value.value.text ?? observation.value.value.coding?.[0]?.display ?? "-";
                }
                const interpretation = observation.interpretation?.[0]?.text;

                return (
                  <tr key={observation.id} className="border-b border-[#C9D9EA] dark:border-[#333] hover:bg-[#EAF3FB] dark:hover:bg-[#2a2a2a]">
                    <td className="p-3 text-[#233B6E] dark:text-white">{concept}</td>
                    <td className="p-3 text-[#6F7F95] dark:text-gray-300">
                      {valueText} {interpretation && <span className="text-xs text-[#6F7F95]">({interpretation})</span>}
                    </td>
                    <td className="p-3 text-sm text-[#6F7F95] dark:text-gray-400">
                      {formatDateTime(observation.effectiveDateTime ?? observation.issued)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case "encounters": {
      const filtered = filterItems(summary.encounters, (enc) =>
        enc.type?.[0]?.text || enc.reasonCode?.[0]?.text || enc.class?.display || ""
      );

      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
            <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <tr className="border-b border-[#C9D9EA] dark:border-[#333]">
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Data</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Tipo</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Local</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((encounter) => {
                const description =
                  encounter.type?.[0]?.text ?? encounter.reasonCode?.[0]?.text ?? encounter.class?.display ?? "Visita";
                return (
                  <tr key={encounter.id} className="border-b border-[#C9D9EA] dark:border-[#333] hover:bg-[#EAF3FB] dark:hover:bg-[#2a2a2a]">
                    <td className="p-3 text-[#233B6E] dark:text-white">{formatDate(encounter.period?.start)}</td>
                    <td className="p-3 text-[#6F7F95] dark:text-gray-300">{description}</td>
                    <td className="p-3 text-sm text-[#6F7F95] dark:text-gray-400">{encounter.serviceProvider?.display || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case "allergies": {
      const filtered = filterItems(summary.allergies, (allergy) => allergy.code?.text || "");

      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
            <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <tr className="border-b border-[#C9D9EA] dark:border-[#333]">
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Alergia</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Status</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Última Ocorrência</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((allergy) => (
                <tr key={allergy.id} className="border-b border-[#C9D9EA] dark:border-[#333] hover:bg-[#EAF3FB] dark:hover:bg-[#2a2a2a]">
                  <td className="p-3 text-[#233B6E] dark:text-white">{allergy.code?.text ?? "Sensibilidade não especificada"}</td>
                  <td className="p-3 text-[#6F7F95] dark:text-gray-300">{allergy.clinicalStatus?.text || "-"}</td>
                  <td className="p-3 text-sm text-[#6F7F95] dark:text-gray-400">
                    {allergy.lastOccurrence ? formatDate(allergy.lastOccurrence) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "conditions": {
      const filtered = filterItems(summary.conditions || [], (condition) =>
        condition.code?.text ?? condition.code?.coding?.[0]?.display ?? ""
      );

      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full border-collapse min-w-[700px] sm:min-w-0">
            <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <tr className="border-b border-[#C9D9EA] dark:border-[#333]">
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Condição</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Status</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Gravidade</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Início</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-[#6F7F95] dark:text-gray-400">
                    Nenhuma condição registrada
                  </td>
                </tr>
              ) : (
                filtered.map((condition) => (
                  <tr key={condition.id} className="border-b border-[#C9D9EA] dark:border-[#333] hover:bg-[#EAF3FB] dark:hover:bg-[#2a2a2a]">
                    <td className="p-3 text-[#233B6E] dark:text-white">
                      {condition.code?.text ?? condition.code?.coding?.[0]?.display ?? "Condição não especificada"}
                    </td>
                    <td className="p-3 text-[#6F7F95] dark:text-gray-300">
                      {formatConditionStatus(condition.clinicalStatus?.text)}
                    </td>
                    <td className="p-3 text-[#6F7F95] dark:text-gray-300">
                      {formatConditionSeverity(condition.severity?.text)}
                    </td>
                    <td className="p-3 text-sm text-[#6F7F95] dark:text-gray-400">
                      {condition.onsetDateTime ? formatDate(condition.onsetDateTime) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }

    case "procedures": {
      const filtered = filterItems(summary.procedures || [], (procedure) =>
        procedure.code?.text ?? procedure.code?.coding?.[0]?.display ?? ""
      );

      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
            <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <tr className="border-b border-[#C9D9EA] dark:border-[#333]">
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Procedimento</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Status</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-[#6F7F95] dark:text-gray-400">
                    Nenhum procedimento registrado
                  </td>
                </tr>
              ) : (
                filtered.map((procedure) => (
                  <tr key={procedure.id} className="border-b border-[#C9D9EA] dark:border-[#333] hover:bg-[#EAF3FB] dark:hover:bg-[#2a2a2a]">
                    <td className="p-3 text-[#233B6E] dark:text-white">
                      {procedure.code?.text ?? procedure.code?.coding?.[0]?.display ?? "Procedimento não especificado"}
                    </td>
                    <td className="p-3 text-[#6F7F95] dark:text-gray-300">{procedure.status || "-"}</td>
                    <td className="p-3 text-sm text-[#6F7F95] dark:text-gray-400">
                      {procedure.performedStart ? formatDate(procedure.performedStart) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }

    case "medications": {
      const filtered = filterItems(summary.medications || [], (medication) =>
        medication.medication?.text ?? medication.medication?.coding?.[0]?.display ?? ""
      );

      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
            <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <tr className="border-b border-[#C9D9EA] dark:border-[#333]">
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Medicamento</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Dosagem</th>
                <th className="text-left p-3 font-semibold text-[#233B6E] dark:text-white">Período</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-[#6F7F95] dark:text-gray-400">
                    Nenhum medicamento registrado
                  </td>
                </tr>
              ) : (
                filtered.map((medication) => (
                  <tr key={medication.id} className="border-b border-[#C9D9EA] dark:border-[#333] hover:bg-[#EAF3FB] dark:hover:bg-[#2a2a2a]">
                    <td className="p-3 text-[#233B6E] dark:text-white">
                      {medication.medication?.text ?? medication.medication?.coding?.[0]?.display ?? "Medicamento não especificado"}
                    </td>
                    <td className="p-3 text-[#6F7F95] dark:text-gray-300">{medication.dosage || "-"}</td>
                    <td className="p-3 text-sm text-[#6F7F95] dark:text-gray-400">
                      {medication.effectiveStart
                        ? `${formatDate(medication.effectiveStart)}${medication.effectiveEnd ? ` - ${formatDate(medication.effectiveEnd)}` : ""}`
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
  }
}