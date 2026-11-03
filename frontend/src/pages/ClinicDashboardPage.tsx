import { useState } from "react";
import axios from "axios";

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

function formatCpf(value?: string) {
  if (!value) return "-";
  return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR");
}

function formatGender(value?: string) {
  if (!value) return "-";
  if (value === "male") return "Masculino";
  if (value === "female") return "Feminino";
  if (value === "other") return "Outro";
  return "Não informado";
}

export function ClinicDashboardPage() {
  const authRaw = localStorage.getItem("clinic.auth");
  const clinic = authRaw ? (JSON.parse(authRaw) as ClinicAuthData) : null;

  const [cpf, setCpf] = useState("");
  const [patient, setPatient] = useState<FoundPatient | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    if (!clinic?.accessToken) {
      setError("Sessão da clínica não encontrada.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPatient(null);

    try {
      const response = await axios.get("/api/clinic/patients/search", {
        params: { cpf: cpf.replace(/\D/g, "") },
        headers: {
          Authorization: `Bearer ${clinic.accessToken}`
        }
      });

      setPatient(response.data);
    } catch {
      setError("Paciente não encontrado para o CPF informado.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("clinic.auth");
    window.location.href = "/clinic/login";
  }

  return (
    <div className="min-h-screen bg-[#F7FBFF] dark:bg-[#0f0f0f] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-[#C9D9EA] dark:border-transparent p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#233B6E] dark:text-white mb-2">
                Dashboard da Clínica
              </h1>

              <p className="text-[#6F7F95] dark:text-gray-400">
                Área inicial da clínica autenticada.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-[#C9D9EA] text-[#233B6E] dark:text-white dark:border-[#444] hover:bg-[#EAF3FB]"
            >
              Sair
            </button>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-[#EAF3FB] dark:bg-[#2a2a2a]">
            <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Clínica logada</p>
            <p className="text-lg font-semibold text-[#233B6E] dark:text-white">
              {clinic?.user?.name || "Não identificada"}
            </p>
            <p className="text-sm text-[#6F7F95] dark:text-gray-400 mt-1">
              Identificação: {clinic?.user?.identifier || "-"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-[#C9D9EA] dark:border-transparent p-8">
          <h2 className="text-2xl font-bold text-[#233B6E] dark:text-white mb-2">
            Buscar paciente por CPF
          </h2>

          <p className="text-[#6F7F95] dark:text-gray-400 mb-6">
            Informe o CPF do paciente para localizar o cadastro.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-[#c62828] bg-[#fdecec] px-4 py-3 text-sm text-[#8f1f1f] dark:bg-[#2a1111] dark:text-[#ff8e8e]">
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              className="flex-1 px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] placeholder:text-[#6F7F95] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Digite o CPF do paciente"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-[#233B6E] text-white font-semibold hover:bg-[#1C315D] disabled:opacity-60"
            >
              {isLoading ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {patient && (
            <div className="mt-6 p-5 rounded-xl bg-[#EAF3FB] dark:bg-[#2a2a2a]">
              <h3 className="text-xl font-bold text-[#233B6E] dark:text-white mb-4">
                Paciente encontrado
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">Nome</p>
                  <p className="text-base font-medium text-[#233B6E] dark:text-white">
                    {patient.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-1">CPF</p>
                  <p className="text-base font-medium text-[#233B6E] dark:text-white">
                    {formatCpf(patient.cpf)}
                  </p>
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

              <div className="mt-5">
                <button
                  className="px-5 py-3 rounded-lg bg-[#233B6E] text-white font-semibold hover:bg-[#1C315D]"
                  onClick={() => {
                    window.location.href = `/clinic/patient/${patient.id}`;
                  }}
                >
                  Gerenciar documentos do paciente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}