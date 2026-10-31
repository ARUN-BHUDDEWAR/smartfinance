import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("smartfinance.token");
    const storedUser = localStorage.getItem("smartfinance.user");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("smartfinance.user");
        }
      }
    }
    setLoading(false);
  }, []);

  const saveSession = useCallback((authResponse) => {
    const nextUser = { email: authResponse.email, role: authResponse.role };
    localStorage.setItem("smartfinance.token", authResponse.token);
    localStorage.setItem("smartfinance.user", JSON.stringify(nextUser));
    setToken(authResponse.token);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (credentials) => {
    const authResponse = await authService.login(credentials);
    saveSession(authResponse);
    return authResponse;
  }, [saveSession]);

  const register = useCallback(async (userData) => {
    const authResponse = await authService.register(userData);
    saveSession(authResponse);
    return authResponse;
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem("smartfinance.token");
    localStorage.removeItem("smartfinance.user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout, loading }),
    [user, token, login, register, logout, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
