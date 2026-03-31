import { createContext, useEffect, useState } from "react";
import { loginResponsavel, logoutResponsavel } from "../services/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("responsavel_token"));
  const [loading, setLoading] = useState(false);

  async function login(email, senha) {
    setLoading(true);
    try {
      const data = await loginResponsavel({ email, senha });
      localStorage.setItem("responsavel_token", data.access_token);
      setToken(data.access_token);
      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    logoutResponsavel();
    setToken(null);
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("responsavel_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
