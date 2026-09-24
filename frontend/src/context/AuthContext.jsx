import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

const SESSION_KEY = "crowdly_session";

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  // Always start as loading — the splash/loading state is controlled
  // separately in ProtectedLayout based on the session flag.
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Race against 5s timeout (Render cold-start guard)
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("auth_timeout")), 5000)
        );
        const data = await Promise.race([apiRequest("/auth/me"), timeout]);
        setUser(data);
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
        // Also remove the html class so splash works correctly next time
        document.documentElement.classList.remove("has-session");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    setAuthLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: credentials,
      });
      setUser(data);
      sessionStorage.setItem(SESSION_KEY, "1");
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);
    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: payload,
      });
      setUser(data);
      sessionStorage.setItem(SESSION_KEY, "1");
      return data;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {}
    sessionStorage.removeItem(SESSION_KEY);
    document.documentElement.classList.remove("has-session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
