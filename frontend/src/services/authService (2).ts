import axios from "axios";
import type { AuthCredentials, AuthenticatedUser } from "../types/auth";

const API_URL = "/api";

const LOCAL_FAKE_USER: AuthenticatedUser = {
  id: "patient-123",
  name: "Maria Oliveira",
  cpf: "12345678910",
  token: "fake_token_simulado_fhir"
};

const ENABLE_LOCAL_FAKE_USER = import.meta.env.VITE_ENABLE_LOCAL_AUTH === "true";

async function login(credentials: AuthCredentials): Promise<AuthenticatedUser> {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { user, accessToken } = response.data;
    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      token: accessToken
    };
  } catch (error) {
    // Fallback opcional apenas quando explicitamente habilitado
    if (
      ENABLE_LOCAL_FAKE_USER &&
      credentials.cpf.replace(/\D/g, "") === LOCAL_FAKE_USER.cpf &&
      credentials.password === "12345"
    ) {
      return LOCAL_FAKE_USER;
    }
    throw error;
  }
}

function logout() {
  // futuro: invalidar refresh token, revogar sessão, etc.
}

export const authService = {
  login,
  logout
};


