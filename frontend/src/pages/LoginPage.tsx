import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../modules/auth/AuthContext";

export function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#F7FBFF] dark:bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-[#C9D9EA] dark:border-transparent p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#233B6E] dark:text-white mb-2">
              Portal do Paciente
            </h1>
            <p className="text-sm text-[#6F7F95] dark:text-gray-400">
              Acesse seu histórico de saúde e acompanhe suas informações clínicas.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}