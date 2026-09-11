import { createContext, useContext, useState, useCallback } from "react";
import { adminLogin } from "../api/admin";

const AdminAuthContext = createContext(null);

const TOKEN_KEY = "apolo_admin_token";
const USER_KEY = "apolo_admin_user";

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const { token, user } = await adminLogin({ email, password });
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth debe usarse dentro de <AdminAuthProvider>");
  return ctx;
}
