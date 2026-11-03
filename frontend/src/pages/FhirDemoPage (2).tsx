import { useState, useEffect } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type { PatientSummaryBundle } from "../types/fhir";

type ResourceType = "Patient" | "Condition" | "Procedure" | "Observation" | "MedicationStatement";

export function FhirDemoPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PatientSummaryBundle | null>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceType>("Patient");
  const [showComparison, setShowComparison] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      if (!user) return;
      try {
        const data = await fhirClient.getPatientSummary(user.id, user.token);
        setSummary(data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    void loadSummary();
  }, [user]);

  if (!summary) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Demonstração FHIR" }]} />
        <h1 className="text-3xl font-bold text-[#212529] dark:text-white mb-6">Demonstração FHIR</h1>
        <p className="text-[#6c757d] dark:text-gray-400">Carregando dados...</p>
      </div>
    );
  }

  const getResourceData = (type: ResourceType) => {
    switch (type) {
      case "Patient":
        return summary.patient;
      case "Condition":
        return summary.conditions?.[0] || null;
      case "Procedure":
        return summary.procedures?.[0] || null;
      case "Observation":
        return summary.observations[0] || null;
      case "MedicationStatement":
        return summary.medications?.[0] || null;
      default:
        return null;
    }
  };

  const resourceData = getResourceData(selectedResource);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Demonstração FHIR" }]} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] dark:text-white mb-2">
            Demonstração Visual: FHIR BR Core
          </h1>
          <p className="text-sm sm:text-base text-[#6c757d] dark:text-gray-400">
            Visualize como os dados relacionais são convertidos para o padrão FHIR
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(e) => setShowComparison(e.target.checked)}
            className="w-4 h-4 text-[#1351B4] rounded"
          />
          <span className="text-sm text-[#495057] dark:text-gray-300">Mostrar comparação</span>
        </label>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1351B4] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#6c757d] dark:text-gray-400">Padrão</p>
                <p className="text-lg font-semibold text-[#212529] dark:text-white">FHIR R4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#34A853] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#6c757d] dark:text-gray-400">Perfil</p>
                <p className="text-lg font-semibold text-[#212529] dark:text-white">BR Core</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FFB800] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#6c757d] dark:text-gray-400">Conversão</p>
                <p className="text-lg font-semibold text-[#212529] dark:text-white">Automática</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de recursos */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-[#212529] dark:text-white">Selecione um Recurso FHIR</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {(["Patient", "Condition", "Procedure", "Observation", "MedicationStatement"] as ResourceType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedResource(type)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
                  selectedResource === type
                    ? "bg-[#1351B4] text-white shadow-md"
                    : "bg-[#f3f4fa] dark:bg-[#1a1a1a] text-[#495057] dark:text-gray-300 hover:bg-[#e5e7ef] dark:hover:bg-[#2a2a2a]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparação lado a lado */}
      {showComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-[#212529] dark:text-white">
                  Dados Relacionais (PostgreSQL)
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <RelationalDataView resourceType={selectedResource} summary={summary} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-[#212529] dark:text-white">
                  Recurso FHIR (JSON)
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              <FhirJsonView data={resourceData} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualização FHIR completa */}
      {!showComparison && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-[#212529] dark:text-white">
              Recurso FHIR: {selectedResource}
            </h2>
          </CardHeader>
          <CardContent>
            <FhirJsonView data={resourceData} />
          </CardContent>
        </Card>
      )}

      {/* Diagrama de fluxo */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-[#212529] dark:text-white">Fluxo Futuro do Projeto</h2>
        </CardHeader>
        <CardContent>
          <ConversionFlowDiagram />
        </CardContent>
      </Card>

      {/* Informações sobre FHIR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-[#212529] dark:text-white">O que é FHIR?</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[#495057] dark:text-gray-300">
              <strong>FHIR</strong> (Fast Healthcare Interoperability Resources) é um padrão de interoperabilidade 
              desenvolvido pela HL7 para facilitar a troca de informações de saúde entre sistemas.
            </p>
            <p className="text-[#495057] dark:text-gray-300">
              Utiliza recursos baseados em JSON/XML e APIs RESTful, permitindo integração rápida e eficiente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-[#212529] dark:text-white">FHIR BR Core</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[#495057] dark:text-gray-300">
              O <strong>BR Core</strong> é o perfil brasileiro do FHIR, adaptado para atender às necessidades 
              específicas do sistema de saúde brasileiro, incluindo identificadores como CPF e CNS.
            </p>
            <p className="text-[#495057] dark:text-gray-300">
              Este perfil garante compatibilidade com a RNDS (Rede Nacional de Dados em Saúde).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RelationalDataView({ resourceType, summary }: { resourceType: ResourceType; summary: PatientSummaryBundle }) {
  const identifiers = summary.patient.identifier || [];

  const normalize = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }
    return value;
  };

  const getIdentifierValue = (keyword: string, digitsLength?: number) => {
    const lowerKeyword = keyword.toLowerCase();

    const bySystem = identifiers.find((id) =>
      id.system?.toLowerCase().includes(lowerKeyword)
    );
    if (bySystem?.value) {
      return bySystem.value;
    }

    const byCoding = identifiers.find((id) =>
      id.type?.coding?.some(
        (coding) =>
          coding.display?.toLowerCase().includes(lowerKeyword) ||
          coding.code?.toLowerCase().includes(lowerKeyword)
      )
    );
    if (byCoding?.value) {
      return byCoding.value;
    }

    if (digitsLength) {
      const byLength = identifiers.find(
        (id) => id.value && id.value.replace(/\D/g, "").length === digitsLength
      );
      if (byLength?.value) {
        return byLength.value;
      }
    }

    return undefined;
  };

  const cpfValue = getIdentifierValue("cpf", 11);
  const cnsValue = getIdentifierValue("cns", 15);

  const getRelationalData = () => {
    switch (resourceType) {
      case "Patient":
        return {
          table: "Patient",
          columns: [
            { name: "id", value: summary.patient.id, type: "UUID" },
            { name: "cpf", value: normalize(cpfValue), type: "VARCHAR(11)" },
            { name: "cns", value: normalize(cnsValue), type: "VARCHAR(15)" },
            { name: "name", value: normalize(summary.patient.name?.[0]?.text), type: "TEXT" },
            { name: "birth_date", value: normalize(summary.patient.birthDate), type: "DATE" },
            { name: "gender", value: normalize(summary.patient.gender), type: "VARCHAR(10)" }
          ]
        };
      case "Condition":
        const condition = summary.conditions?.[0];
        return {
          table: "Condition",
          columns: [
            { name: "id", value: condition?.id || "N/A", type: "UUID" },
            { name: "patient_id", value: summary.patient.id, type: "UUID (FK)" },
            { name: "code", value: condition?.code?.text || "N/A", type: "VARCHAR(255)" },
            { name: "onset_date", value: condition?.onsetDateTime || "N/A", type: "TIMESTAMP" },
            { name: "status", value: condition?.clinicalStatus?.text || "N/A", type: "VARCHAR(50)" }
          ]
        };
      case "Procedure":
        const procedure = summary.procedures?.[0];
        return {
          table: "Procedure",
          columns: [
            { name: "id", value: procedure?.id || "N/A", type: "UUID" },
            { name: "patient_id", value: summary.patient.id, type: "UUID (FK)" },
            { name: "code", value: procedure?.code?.text || "N/A", type: "VARCHAR(255)" },
            { name: "performed_start", value: procedure?.performedStart || "N/A", type: "TIMESTAMP" },
            { name: "status", value: procedure?.status || "N/A", type: "VARCHAR(50)" }
          ]
        };
      case "Observation":
        const observation = summary.observations[0];
        return {
          table: "Observation",
          columns: [
            { name: "id", value: observation?.id || "N/A", type: "UUID" },
            { name: "patient_id", value: summary.patient.id, type: "UUID (FK)" },
            { name: "code", value: observation?.code?.text || "N/A", type: "VARCHAR(255)" },
            { name: "value", value: observation?.value?.kind === "Quantity" ? `${observation.value.value} ${observation.value.unit || ""}` : observation?.value?.kind === "String" ? observation.value.value : "N/A", type: "VARCHAR/TEXT" },
            { name: "effective_date", value: observation?.effectiveDateTime || "N/A", type: "TIMESTAMP" }
          ]
        };
      case "MedicationStatement":
        const medication = summary.medications?.[0];
        return {
          table: "MedicationStatement",
          columns: [
            { name: "id", value: medication?.id || "N/A", type: "UUID" },
            { name: "patient_id", value: summary.patient.id, type: "UUID (FK)" },
            { name: "medication", value: medication?.medication?.text || "N/A", type: "VARCHAR(255)" },
            { name: "dosage", value: medication?.dosage || "N/A", type: "VARCHAR(255)" },
            { name: "effective_start", value: medication?.effectiveStart || "N/A", type: "TIMESTAMP" }
          ]
        };
      default:
        return { table: "N/A", columns: [] };
    }
  };

  const data = getRelationalData();

  return (
    <div className="space-y-3">
      <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] p-3 rounded-lg border border-[#e5e7ef] dark:border-[#333]">
        <div className="font-mono text-sm">
          <div className="text-[#1351B4] dark:text-blue-400 font-semibold mb-2">Tabela: {data.table}</div>
          <div className="space-y-2">
            {data.columns.map((col, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[#495057] dark:text-gray-300">
                <span className="text-[#6c757d] dark:text-gray-500 min-w-[120px]">{col.name}:</span>
                <span className="flex-1">{col.value}</span>
                <span className="text-[#34A853] dark:text-green-400 text-xs">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-[#6c757d] dark:text-gray-500 italic">
        Estrutura relacional tradicional com tabelas, colunas e chaves estrangeiras
      </p>
    </div>
  );
}

function FhirJsonView({ data }: { data: any }) {
  if (!data) {
    return (
      <div className="text-center py-8 text-[#6c757d] dark:text-gray-400">
        Nenhum recurso disponível
      </div>
    );
  }

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="space-y-3">
      <div className="bg-[#1e1e1e] dark:bg-[#0a0a0a] p-4 rounded-lg overflow-x-auto">
        <pre className="text-sm text-gray-300 font-mono">
          <SyntaxHighlightedJson json={jsonString} />
        </pre>
      </div>
      <p className="text-xs text-[#6c757d] dark:text-gray-500 italic">
        Recurso FHIR BR Core formatado em JSON, pronto para interoperabilidade
      </p>
    </div>
  );
}

function SyntaxHighlightedJson({ json }: { json: string }) {
  const highlightJson = (str: string) => {
    let highlighted = str;
    
    // Strings (valores)
    highlighted = highlighted.replace(/:\s*"([^"]*)"/g, ': <span style="color: #ce9178">"$1"</span>');
    
    // Chaves (propriedades)
    highlighted = highlighted.replace(/"([^"]+)"\s*:/g, '<span style="color: #9cdcfe">"$1"</span>:');
    
    // Números
    highlighted = highlighted.replace(/:\s*(\d+\.?\d*)/g, ': <span style="color: #b5cea8">$1</span>');
    
    // Booleanos e null
    highlighted = highlighted.replace(/:\s*(true|false|null)\b/g, ': <span style="color: #569cd6">$1</span>');
    
    // Palavras-chave FHIR importantes
    const fhirKeywords = ['resourceType', 'id', 'status', 'code', 'text', 'system', 'value', 'display', 'coding', 'identifier', 'name', 'gender', 'birthDate'];
    fhirKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #4ec9b0">$1</span>');
    });
    
    // Arrays e objetos
    highlighted = highlighted.replace(/([\[\]{}])/g, '<span style="color: #d4d4d4">$1</span>');
    
    return highlighted;
  };

  return <div dangerouslySetInnerHTML={{ __html: highlightJson(json) }} />;
}

function ConversionFlowDiagram() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {/* RNDS */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#FFB800] rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="mt-2 text-sm font-medium text-[#212529] dark:text-white">RNDS</p>
          <p className="text-xs text-[#6c757d] dark:text-gray-400 text-center">FHIR BR Core (REST)</p>
        </div>

        {/* Seta dupla */}
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 text-[#1351B4] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l5 5-5 5m10-10l-5 5 5 5" />
          </svg>
          <p className="text-xs text-[#6c757d] dark:text-gray-400 mt-1 text-center">Consumo & Envio</p>
        </div>

        {/* Backend/API */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#34A853] rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <p className="mt-2 text-sm font-medium text-[#212529] dark:text-white text-center">Backend API</p>
          <p className="text-xs text-[#6c757d] dark:text-gray-400 text-center">Integração + Segurança</p>
        </div>

        {/* Seta */}
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 text-[#1351B4] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <p className="text-xs text-[#6c757d] dark:text-gray-400 mt-1 text-center">Persistência</p>
        </div>

        {/* PostgreSQL */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#336791] rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.5594 15.3305c-.124-.2475-2.5105-4.7407-2.5105-4.7407-.8351-1.575-2.5105-2.5105-4.3234-2.5105-1.8128 0-3.4882.9355-4.3233 2.5105 0 0-2.3864 4.4932-2.5105 4.7407-.124.2475-.124.5578 0 .8053.124.2475 2.5105 4.7407 2.5105 4.7407.8351 1.575 2.5105 2.5105 4.3233 2.5105 1.8129 0 3.4883-.9355 4.3234-2.5105 0 0 2.3865-4.4932 2.5105-4.7407.124-.2475.124-.5578 0-.8053zm-9.8082 6.5302c-1.575 0-2.8351-1.2601-2.8351-2.8351s1.2601-2.8351 2.8351-2.8351 2.8351 1.2601 2.8351 2.8351-1.2601 2.8351-2.8351 2.8351z"/>
            </svg>
          </div>
          <p className="mt-2 text-sm font-medium text-[#212529] dark:text-white text-center">PostgreSQL</p>
          <p className="text-xs text-[#6c757d] dark:text-gray-400 text-center">Cache / Dados Locais</p>
        </div>

        {/* Seta */}
        <div className="flex flex-col items-center">
          <svg className="w-8 h-8 text-[#1351B4] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <p className="text-xs text-[#6c757d] dark:text-gray-400 mt-1">FHIR Mapper</p>
        </div>

        {/* Frontend */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#1351B4] rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-2 text-sm font-medium text-[#212529] dark:text-white">Frontend</p>
          <p className="text-xs text-[#6c757d] dark:text-gray-400 text-center">React + TypeScript</p>
        </div>
      </div>

      <div className="bg-[#f8f9fa] dark:bg-[#1a1a1a] p-4 rounded-lg border border-[#e5e7ef] dark:border-[#333] space-y-2">
        <p className="text-sm text-[#495057] dark:text-gray-300 text-center">
          <strong>Fluxo RNDS-like:</strong> consumimos bundles FHIR diretamente da RNDS, tratamos/armazenamos localmente e exibimos no portal.
          O mesmo backend também está preparado para gerar bundles FHIR e enviá-los de volta para a RNDS quando necessário.
        </p>
        <p className="text-xs text-[#6c757d] dark:text-gray-400 text-center">
          *Integração bidirecional: leitura dos dados oficiais e possibilidade de envio de atualizações via requisições FHIR autenticadas.
        </p>
      </div>
    </div>
  );
}

