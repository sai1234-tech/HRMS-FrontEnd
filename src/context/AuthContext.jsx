import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, signupUser } from "../services/authService";
import { normalizeRole } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (response) => {
    const session = response?.data && (response.data.user || response.data.token) ? response.data : response;
    const normalizedUser = { ...session.user, role: normalizeRole(session.user) };
    sessionStorage.setItem("hrms_token", session.token);
    sessionStorage.setItem("hrms_user", JSON.stringify(normalizedUser));

    if (session.employee) {
      sessionStorage.setItem(
        "hrms_employee",
        JSON.stringify(session.employee),
      );
    }

    setUser(normalizedUser);
    setEmployee(session.employee || null);
    return { ...session, user: normalizedUser };
  };

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    return saveSession(response);
  };

  const signup = async (userData) => {
    const response = await signupUser(userData);

    const session = response?.data && (response.data.user || response.data.token) ? response.data : response;
    if (session.token && session.user) {
      return saveSession(response);
    }

    return login(userData.email, userData.password);
  };

  const logout = () => {
    sessionStorage.removeItem("hrms_token");
    sessionStorage.removeItem("hrms_user");
    sessionStorage.removeItem("hrms_employee");

    setUser(null);
    setEmployee(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token =
        sessionStorage.getItem("hrms_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await getCurrentUser(token);

        const session = response?.data && response.data.user ? response.data : response;
        setUser({ ...session.user, role: normalizeRole(session.user) });
        setEmployee(session.employee || null);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, employee, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
