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
    <div className="govbr-login-layout">
      {/* Header com logo e acessibilidade */}
      <header className="govbr-top-header">
        <div className="govbr-logo-header">
          <div className="govbr-logo-text">
            <span className="govbr-logo-g">g</span>
            <span className="govbr-logo-o">o</span>
            <span className="govbr-logo-v">v</span>
            <span className="govbr-logo-dot">.</span>
            <span className="govbr-logo-b">b</span>
            <span className="govbr-logo-r">r</span>
          </div>
        </div>
        <div className="govbr-accessibility">
          <button type="button" className="govbr-access-btn">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="10" cy="10" r="4" fill="currentColor"/>
            </svg>
            Alto Contraste
          </button>
          <button type="button" className="govbr-access-btn">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12 8H18L13 11L15 17L10 13L5 17L7 11L2 8H8L10 2Z" fill="currentColor"/>
            </svg>
            VLibras
          </button>
        </div>
      </header>

      <div className="govbr-main-content">
        {/* Seção Central - Formulário */}
        <div className="govbr-right-section">
          {step === "cpf" ? (
            <form onSubmit={handleCpfSubmit} className="govbr-form-container">
              <h1 className="govbr-form-title">Identifique-se no gov.br com:</h1>
              
              <div className="govbr-method-selector">
                <button type="button" className="govbr-method-btn active">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Número do CPF</span>
                </button>
              </div>

              <p className="govbr-method-description">
                Digite seu CPF para criar ou acessar sua conta gov.br
              </p>

              <div className="govbr-input-group">
                <label htmlFor="cpf" className="govbr-label">CPF</label>
                <input
                  id="cpf"
                  type="text"
                  maxLength={14}
                  required
                  value={formatCpf(cpf)}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="Digite seu CPF"
                  className={`govbr-input ${error ? "error" : ""}`}
                  disabled={isLoading}
                />
                {error && <span className="govbr-error-text">{error}</span>}
              </div>

              <Button type="submit" variant="primary" size="lg" className="govbr-continue-btn" disabled={isLoading}>
                Continuar
              </Button>

              <div className="govbr-divider">
                <span>Outras opções de identificação:</span>
              </div>

              <div className="govbr-other-methods">
                <button type="button" className="govbr-other-method">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="#34A853"/>
                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Login com seu banco</span>
                  <span className="govbr-badge">SUA CONTA SERÁ PRATA</span>
                </button>
                <button type="button" className="govbr-other-method">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="8" height="8" fill="#1351B4"/>
                    <rect x="13" y="3" width="8" height="8" fill="#1351B4"/>
                    <rect x="3" y="13" width="8" height="8" fill="#1351B4"/>
                    <rect x="13" y="13" width="8" height="8" fill="#1351B4"/>
                  </svg>
                  <span>Login com QR code</span>
                </button>
                <button type="button" className="govbr-other-method">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1351B4" strokeWidth="2" fill="none"/>
                    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#1351B4" strokeWidth="2" fill="none"/>
                  </svg>
                  <span>Seu certificado digital</span>
                </button>
                <button type="button" className="govbr-other-method">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 10H20C21.1 10 22 10.9 22 12V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V12C2 10.9 2.9 10 4 10H6" stroke="#1351B4" strokeWidth="2" fill="none"/>
                    <path d="M12 2V14M7 7L12 2L17 7" stroke="#1351B4" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Seu certificado digital em nuvem</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="govbr-form-container">
              <h1 className="govbr-form-title">Digite sua senha</h1>
              
              <p className="govbr-password-instruction">
                Digite sua senha para acessar o login único do governo federal.
              </p>

              <div className="govbr-input-group">
                <label htmlFor="cpf-display" className="govbr-label">CPF</label>
                <input
                  id="cpf-display"
                  type="text"
                  value={formatCpf(cpf)}
                  readOnly
                  className="govbr-input-readonly"
                />
              </div>

              <div className="govbr-input-group">
                <label htmlFor="senha" className="govbr-label">Senha</label>
                <div className="govbr-password-wrapper">
                  <input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className={`govbr-input ${error ? "error" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="govbr-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      {showPassword ? (
                        <>
                          <path d="M10 3C6 3 2.73 5.11 1 8C2.73 10.89 6 13 10 13C14 13 17.27 10.89 19 8C17.27 5.11 14 3 10 3Z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M10 10C10.5523 10 11 9.55228 11 9C11 8.44772 10.5523 8 10 8C9.44772 8 9 8.44772 9 9C9 9.55228 9.44772 10 10 10Z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M2 2L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </>
                      ) : (
                        <>
                          <path d="M10 3C6 3 2.73 5.11 1 8C2.73 10.89 6 13 10 13C14 13 17.27 10.89 19 8C17.27 5.11 14 3 10 3Z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M10 10C10.5523 10 11 9.55228 11 9C11 8.44772 10.5523 8 10 8C9.44772 8 9 8.44772 9 9C9 9.55228 9.44772 10 10 10Z" stroke="currentColor" strokeWidth="2"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {error && <span className="govbr-error-text">{error}</span>}
              </div>

              <a href="#" className="govbr-forgot-password">Esqueci minha senha</a>

              <div className="govbr-form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("cpf")}
                  className="govbr-cancel-btn"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="govbr-enter-btn"
                >
                  Entrar
                </Button>
              </div>

              <div className="govbr-help-link">
                <a href="#">Ficou com dúvidas?</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
