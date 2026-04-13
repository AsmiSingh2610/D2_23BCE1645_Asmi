// ── Auth Context ──────────────────────────────────────────────
// Global authentication state management
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem("digiland_token");
    const savedUser = localStorage.getItem("digiland_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem("digiland_token", token);
    localStorage.setItem("digiland_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const signup = async (name, email, password) => {
    const res = await authAPI.signup({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem("digiland_token", token);
    localStorage.setItem("digiland_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("digiland_token");
    localStorage.removeItem("digiland_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
