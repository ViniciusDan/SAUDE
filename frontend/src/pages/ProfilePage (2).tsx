import { useEffect, useState } from "react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import { SkeletonCard } from "../components/ui/Skeleton";
import { useAuth } from "../modules/auth/AuthContext";
import { fhirClient } from "../services/fhirClient";
import type { PatientSummaryBundle } from "../types/fhir";
import { formatCpf, formatDate } from "../utils/formatters";

export function ProfilePage() {
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

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Perfil" }]} />
        <h1 className="text-3xl font-bold text-[#212529] dark:text-white mb-6">Meu Perfil</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Perfil" }]} />
        <h1 className="text-3xl font-bold text-[#212529] dark:text-white mb-6">Meu Perfil</h1>
        <p className="text-[#6c757d] dark:text-gray-400">Não foi possível carregar os dados do perfil.</p>
      </div>
    );
  }

  const patient = summary.patient;
  const officialName = patient.name?.find((n) => n.use === "official") || patient.name?.[0];
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

  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard", path: "/" }, { label: "Perfil" }]} />
      <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] dark:text-white mb-4 sm:mb-6">Meu Perfil</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader title="Informações Pessoais" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Nome Completo</p>
                <p className="text-base font-medium text-[#212529] dark:text-white">
                  {officialName?.text || officialName?.family || "Não informado"}
                </p>
              </div>
              {patient.gender && (
                <div>
                  <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Sexo</p>
                  <p className="text-base font-medium text-[#212529] dark:text-white">
                    {genderMap[patient.gender] || patient.gender}
                  </p>
                </div>
              )}
              {patient.birthDate && (
                <div>
                  <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Data de Nascimento</p>
                  <p className="text-base font-medium text-[#212529] dark:text-white">
                    {formatDate(patient.birthDate)}
                  </p>
                </div>
              )}
              {cpfIdentifier && (
                <div>
                  <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">CPF</p>
                  <p className="text-base font-medium text-[#212529] dark:text-white">
                    {formatCpf(cpfIdentifier.value || "")}
                  </p>
                </div>
              )}
              {cnsIdentifier && (
                <div>
                  <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">CNS</p>
                  <p className="text-base font-medium text-[#212529] dark:text-white">
                    {cnsIdentifier.value}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {patient.telecom && patient.telecom.length > 0 && (
          <Card>
            <CardHeader title="Contato" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.telecom.map((contact, index) => (
                  <div key={index}>
                    <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">
                      {contact.system === "phone"
                        ? contact.use === "mobile"
                          ? "Celular"
                          : "Telefone"
                        : contact.system === "email"
                          ? "E-mail"
                          : "Contato"}
                    </p>
                    <p className="text-base font-medium text-[#212529] dark:text-white">
                      {contact.value || "Não informado"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {patient.address && patient.address.length > 0 && (
          <Card>
            <CardHeader title="Endereço" />
            <CardContent>
              <div className="space-y-4">
                {patient.address.map((address, index) => (
                  <div key={index} className="p-4 bg-[#f3f4fa] dark:bg-[#2a2a2a] rounded-lg">
                    {address.line && address.line.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Logradouro</p>
                        <p className="text-base font-medium text-[#212529] dark:text-white">
                          {address.line.join(", ")}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {address.district && (
                        <div>
                          <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Bairro</p>
                          <p className="text-base font-medium text-[#212529] dark:text-white">{address.district}</p>
                        </div>
                      )}
                      {address.city && (
                        <div>
                          <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Cidade</p>
                          <p className="text-base font-medium text-[#212529] dark:text-white">{address.city}</p>
                        </div>
                      )}
                      {address.state && (
                        <div>
                          <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">Estado</p>
                          <p className="text-base font-medium text-[#212529] dark:text-white">{address.state}</p>
                        </div>
                      )}
                      {address.postalCode && (
                        <div>
                          <p className="text-sm text-[#6c757d] dark:text-gray-400 mb-1">CEP</p>
                          <p className="text-base font-medium text-[#212529] dark:text-white">{address.postalCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader title="Resumo Clínico" />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-[#f3f4fa] dark:bg-[#2a2a2a] rounded-lg">
                <p className="text-2xl font-bold text-[#1351B4] dark:text-blue-400">{summary.encounters.length}</p>
                <p className="text-sm text-[#6c757d] dark:text-gray-400 mt-1">Atendimentos</p>
              </div>
              <div className="text-center p-4 bg-[#f3f4fa] dark:bg-[#2a2a2a] rounded-lg">
                <p className="text-2xl font-bold text-[#34A853] dark:text-green-400">{summary.observations.length}</p>
                <p className="text-sm text-[#6c757d] dark:text-gray-400 mt-1">Exames</p>
              </div>
              <div className="text-center p-4 bg-[#f3f4fa] dark:bg-[#2a2a2a] rounded-lg">
                <p className="text-2xl font-bold text-[#c62828] dark:text-red-400">{summary.allergies.length}</p>
                <p className="text-sm text-[#6c757d] dark:text-gray-400 mt-1">Alergias</p>
              </div>
              <div className="text-center p-4 bg-[#f3f4fa] dark:bg-[#2a2a2a] rounded-lg">
                <p className="text-2xl font-bold text-[#6c757d] dark:text-gray-400">{(summary.conditions || []).length}</p>
                <p className="text-sm text-[#6c757d] dark:text-gray-400 mt-1">Condições</p>
              </div>
              <div className="text-center p-4 bg-[#f3f4fa] dark:bg-[#2a2a2a] rounded-lg">
                <p className="text-2xl font-bold text-[#ffc107] dark:text-yellow-400">{(summary.procedures || []).length}</p>
                <p className="text-sm text-[#6c757d] dark:text-gray-400 mt-1">Procedimentos</p>
              </div>
              <div className="text-center p-4 bg-[#f3f4fa] dark:bg-[#2a2a2a] rounded-lg">
                <p className="text-2xl font-bold text-[#1351B4] dark:text-blue-400">{(summary.medications || []).length}</p>
                <p className="text-sm text-[#6c757d] dark:text-gray-400 mt-1">Medicamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

