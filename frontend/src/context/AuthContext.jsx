import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchMe } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "mudgarvale_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Persist to localStorage whenever auth changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  // Manual refresh — callable from anywhere
  const refreshUser = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const res = await fetchMe();
      if (res?.data?.user) {
        setAuth((prev) =>
          prev ? { ...prev, user: { ...prev.user, ...res.data.user } } : prev
        );
      }
    } catch (err) {
      // 401/403 → force logout
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setAuth(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  // Refresh on token load
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Refresh whenever the tab regains focus
  useEffect(() => {
    const onFocus = () => refreshUser();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshUser]);

  const login = (token, user) => setAuth({ token, user });
  const logout = () => setAuth(null);

  const value = {
    token: auth?.token || null,
    user: auth?.user || null,
    isAuthenticated: !!auth?.token,
    isAdmin: auth?.user?.role === "admin",
    isEmployee: auth?.user?.role === "employee",
    isVerified: !!auth?.user?.isVerified,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}