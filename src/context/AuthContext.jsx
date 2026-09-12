import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, signupUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (response) => {
    sessionStorage.setItem("hrms_token", response.token);
    sessionStorage.setItem("hrms_user", JSON.stringify(response.user));

    if (response.employee) {
      sessionStorage.setItem(
        "hrms_employee",
        JSON.stringify(response.employee),
      );
    }

    setUser(response.user);
    setEmployee(response.employee || null);
  };

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    saveSession(response);

    return response;
  };

  const signup = async (userData) => {
    const response = await signupUser(userData);

    if (response.token && response.user) {
      saveSession(response);
      return response;
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

        setUser(response.user);
        setEmployee(response.employee || null);
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
