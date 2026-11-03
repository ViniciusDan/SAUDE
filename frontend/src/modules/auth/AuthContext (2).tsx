import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthenticatedUser, AuthCredentials } from "../../types/auth";
import { authService } from "../../services/authService";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    const stored = sessionStorage.getItem("fhir.portal.user");
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as AuthenticatedUser;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  async function login(credentials: AuthCredentials) {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.login(credentials);
      setUser(authenticatedUser);
      sessionStorage.setItem("fhir.portal.user", JSON.stringify(authenticatedUser));
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem("fhir.portal.user");
    authService.logout();
  }

  useEffect(() => {
    if (!user) {
      return;
    }
    sessionStorage.setItem("fhir.portal.user", JSON.stringify(user));
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}


