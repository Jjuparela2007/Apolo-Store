import { createContext, useContext, useState, useCallback } from "react";
import { loginCustomer, registerCustomer } from "../api/auth";

const AuthContext = createContext(null);

const STORAGE_KEY = "apolo_customer_token";
const CUSTOMER_KEY = "apolo_customer_data";

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem(CUSTOMER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (token, customerData) => {
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customerData));
    setCustomer(customerData);
  };

  const login = useCallback(async (email, password) => {
    const { token, customer: c } = await loginCustomer({ email, password });
    persistSession(token, c);
    return c;
  }, []);

  // A propósito NO inicia sesión automáticamente: solo crea la cuenta.
  // El usuario debe iniciar sesión manualmente después, desde /login.
  const register = useCallback(async (data) => {
    const { customer: c } = await registerCustomer(data);
    return c;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider value={{ customer, isAuthenticated: !!customer, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}