import { useState } from "react";
import axios from "axios";

export function ClinicLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/clinic/auth/login", {
        identifier,
        password
      });

      localStorage.setItem("clinic.auth", JSON.stringify(response.data));
      window.location.href = "/clinic/dashboard";
    } catch {
      setError("Não foi possível realizar o login da clínica.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FBFF] dark:bg-[#0f0f0f] p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-[#C9D9EA] dark:border-transparent p-8">
        <h1 className="text-2xl font-bold text-[#233B6E] dark:text-white mb-2">
          Login da Clínica
        </h1>

        <p className="text-sm text-[#6F7F95] dark:text-gray-400 mb-6">
          Entre com a identificação da clínica e a senha.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-[#c62828] bg-[#fdecec] px-4 py-3 text-sm text-[#8f1f1f] dark:bg-[#2a1111] dark:text-[#ff8e8e]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
              Identificação da clínica
            </label>
            <input
              className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] placeholder:text-[#6F7F95] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="CLINICA001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
              Senha
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white border-[#C9D9EA] dark:border-[#2b2f3b] placeholder:text-[#6F7F95] focus:outline-none focus:ring-2 focus:ring-[#233B6E]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-[#233B6E] text-white font-semibold hover:bg-[#1C315D] disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}