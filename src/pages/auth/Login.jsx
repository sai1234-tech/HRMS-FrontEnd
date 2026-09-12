import React, { useState }  from 'react'
import { Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";

import { useAuth } from "../../context/AuthContext";

import {
  validateEmail,
  validatePassword,
} from "../../utils/validation";

function Login() {
    const navigate = useNavigate();
 const {
    user,
    login,
  } = useAuth();

  const [form,setForm] = useState({email:'',password:''});
  const [errors,setErrors] = useState({});
   const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

    const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError =
      validateEmail(form.email);

    const passwordError =
      validatePassword(form.password);

    if (emailError) {
      newErrors.email = emailError;
    }

    if (passwordError) {
      newErrors.password =
        passwordError;
    }

    setErrors(newErrors);

    return Object.keys(newErrors)
      .length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        form.email.trim(),
        form.password
      );

      if (
        response.user.role === "admin"
      ) {
        navigate("/admin/dashboard");
      } else if (
        response.user.role === "hr"
      ) {
        navigate("/hr/dashboard");
      } else {
        navigate("/employee/dashboard");
      }

    } catch (error) {
      setServerError(
        error.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

 if (user) {
  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "hr") {
    return <Navigate to="/hr/dashboard" replace />;
  }

  return <Navigate to="/employee/dashboard" replace />;
}
  return (
   <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your HRMS account"
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Create account"
    >

      {serverError && (
        <div className="server-error">
          {serverError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
      >

        <InputField
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading
            ? "Signing in..."
            : "Sign in"}
        </button>

      </form>

    </AuthLayout>
  )
}

export default Login
