import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
} from "../../utils/validation";

import { useAuth } from "../../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
 const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    phone: "",
    employeeCode: "",
    joiningDate: "",
    department: "",
    designation: "",
    employmentType: "Full Time",
    salary: "",
  });

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

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

    const nameError =
      validateName(form.name);

    const emailError =
      validateEmail(form.email);

    const passwordError =
      validatePassword(
        form.password
      );

    const confirmError =
      validateConfirmPassword(
        form.password,
        form.confirmPassword
      );

    const phoneError =
      validatePhone(form.phone);

    if (nameError)
      newErrors.name = nameError;

    if (emailError)
      newErrors.email = emailError;

    if (passwordError)
      newErrors.password =
        passwordError;

    if (confirmError)
      newErrors.confirmPassword =
        confirmError;

    if (phoneError)
      newErrors.phone = phoneError;

    if (!form.joiningDate) {
      newErrors.joiningDate =
        "Joining date is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors)
      .length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,

        // IMPORTANT:
        // Public registration is always employee.
        role: "employee",

        employeeCode:
          form.employeeCode
            .trim()
            .toUpperCase(),

        lastName:
          form.lastName.trim(),

        phone:
          form.phone.trim(),

        joiningDate:
          form.joiningDate,

        department:
          form.department.trim(),

        designation:
          form.designation.trim(),

        employmentType:
          form.employmentType,

        salary:
          form.salary
            ? Number(form.salary)
            : 0,
      };

      await signup(payload);

      setSuccess("Account created. Opening your employee dashboard...");
      navigate("/employee/dashboard", { replace: true });

    } catch (error) {
      setServerError(
        error.message ||
          "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
   <AuthLayout
      title="Create your account"
      subtitle="Register as an employee in HRMS"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign in"
    >

      {serverError && (
        <div className="server-error">
          {serverError}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
      >

        <div className="form-grid">

          <InputField
            label="First name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter first name"
            required
            autoComplete="given-name"
          />

          <InputField
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            error={errors.lastName}
            placeholder="Enter last name"
            autoComplete="family-name"
          />

        </div>

        <InputField
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="name@company.com"
          required
          autoComplete="email"
        />

        <div className="form-grid">

          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="6–20 characters"
            required
            autoComplete="new-password"
          />

          <InputField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm password"
            required
            autoComplete="new-password"
          />

        </div>

        <div className="form-grid">

          <InputField
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="10 digit phone number"
            autoComplete="tel"
          />

          <InputField
            label="Employee code"
            name="employeeCode"
            value={form.employeeCode}
            onChange={handleChange}
            error={errors.employeeCode}
            placeholder="Optional - auto generated"
          />

        </div>

        <div className="form-grid">

          <div className="form-group">

            <label htmlFor="joiningDate">
              Joining date
              <span className="required">
                *
              </span>
            </label>

            <input
              id="joiningDate"
              name="joiningDate"
              type="date"
              value={form.joiningDate}
              onChange={handleChange}
              className={
                errors.joiningDate
                  ? "input-error"
                  : ""
              }
            />

            {errors.joiningDate && (
              <small className="error-text">
                {errors.joiningDate}
              </small>
            )}

          </div>

          <InputField
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="e.g. Engineering"
          />

        </div>

        <div className="form-grid">

          <InputField
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            error={errors.designation}
            placeholder="e.g. Software Engineer"
          />

          <div className="form-group">

            <label htmlFor="employmentType">
              Employment type
            </label>

            <select
              id="employmentType"
              name="employmentType"
              value={form.employmentType}
              onChange={handleChange}
            >
              <option value="Full Time">
                Full Time
              </option>

              <option value="Part Time">
                Part Time
              </option>

              <option value="Contract">
                Contract
              </option>

              <option value="Intern">
                Intern
              </option>
            </select>

          </div>

        </div>

        <InputField
          label="Salary"
          name="salary"
          type="number"
          value={form.salary}
          onChange={handleChange}
          error={errors.salary}
          placeholder="Annual salary"
        />

        <div className="terms">
          <input
            type="checkbox"
            id="terms"
            required
          />

          <label htmlFor="terms">
            I agree to the HRMS terms
            and privacy policy.
          </label>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create account"}
        </button>

      </form>

    </AuthLayout>
  )
}

export default Signup
