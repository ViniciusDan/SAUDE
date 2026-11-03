import { FormEvent, useState } from "react";
import { useAuth } from "../modules/auth/AuthContext";
import { Button } from "./ui/Button";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"cpf" | "password">("cpf");

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
    return value;
  }

  async function handleCpfSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length === 11) {
      setStep("password");
      setError("");
    } else {
      setError("CPF inválido. Digite 11 dígitos.");
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const cpfDigits = cpf.replace(/\D/g, "");

    try {
      await login({ cpf: cpfDigits, password: senha });
    } catch (err) {
      setError("CPF ou senha incorretos.");
      console.error("Erro no login", err);
    }
  }

  return (
    <div className="space-y-6">
      {step === "cpf" ? (
        <form onSubmit={handleCpfSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#233B6E] dark:text-white mb-2">
              Acesse sua conta
            </h2>
            <p className="text-sm text-[#6F7F95] dark:text-gray-400">
              Informe seu CPF para continuar o acesso ao portal.
            </p>
          </div>

          <div className="rounded-xl border border-[#C9D9EA] dark:border-[#2b2f3b] bg-[#EAF3FB] dark:bg-[#111319] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#233B6E] text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 8H16M8 12H16M8 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#233B6E] dark:text-white">Identificação por CPF</p>
                <p className="text-xs text-[#6F7F95] dark:text-gray-400">
                  Use o CPF cadastrado para acessar sua conta.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              maxLength={14}
              required
              value={formatCpf(cpf)}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Digite seu CPF"
              disabled={isLoading}
              className={`w-full px-4 py-3 text-base border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white placeholder:text-[#6F7F95] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#233B6E] ${
                error
                  ? "border-[#c62828] dark:border-[#c62828]"
                  : "border-[#C9D9EA] dark:border-[#2b2f3b]"
              }`}
            />
            {error && <span className="mt-2 block text-sm text-[#c62828] dark:text-[#ff8e8e]">{error}</span>}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
            Continuar
          </Button>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#233B6E] dark:text-white mb-2">
              Digite sua senha
            </h2>
            <p className="text-sm text-[#6F7F95] dark:text-gray-400">
              Confirme sua senha para acessar o portal do paciente.
            </p>
          </div>

          <div>
            <label
              htmlFor="cpf-display"
              className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2"
            >
              CPF
            </label>
            <input
              id="cpf-display"
              type="text"
              value={formatCpf(cpf)}
              readOnly
              className="w-full px-4 py-3 text-base border-2 rounded-lg bg-[#EAF3FB] dark:bg-[#111319] text-[#6F7F95] dark:text-gray-300 border-[#C9D9EA] dark:border-[#2b2f3b]"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-semibold text-[#233B6E] dark:text-gray-200 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                id="senha"
                type={showPassword ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 text-base border-2 rounded-lg bg-white dark:bg-[#111319] text-[#233B6E] dark:text-white placeholder:text-[#6F7F95] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#233B6E] ${
                  error
                    ? "border-[#c62828] dark:border-[#c62828]"
                    : "border-[#C9D9EA] dark:border-[#2b2f3b]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 flex items-center text-[#6F7F95] dark:text-gray-400"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 3C6 3 2.73 5.11 1 8C2.73 10.89 6 13 10 13C14 13 17.27 10.89 19 8C17.27 5.11 14 3 10 3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 10C10.5523 10 11 9.55228 11 9C11 8.44772 10.5523 8 10 8C9.44772 8 9 8.44772 9 9C9 9.55228 9.44772 10 10 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M2 2L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 3C6 3 2.73 5.11 1 8C2.73 10.89 6 13 10 13C14 13 17.27 10.89 19 8C17.27 5.11 14 3 10 3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M10 10C10.5523 10 11 9.55228 11 9C11 8.44772 10.5523 8 10 8C9.44772 8 9 8.44772 9 9C9 9.55228 9.44772 10 10 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>
            {error && <span className="mt-2 block text-sm text-[#c62828] dark:text-[#ff8e8e]">{error}</span>}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("cpf");
                setSenha("");
                setError("");
              }}
              className="px-4 py-2 rounded-lg border border-[#C9D9EA] dark:border-[#2b2f3b] text-[#233B6E] dark:text-white hover:bg-[#EAF3FB] dark:hover:bg-[#111319]"
            >
              Voltar
            </button>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}