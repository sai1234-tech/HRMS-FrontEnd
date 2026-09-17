import { useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import { createManagedAccount } from "../../services/authService";
import "./AccountManagement.css";

const initialForm = {
  role: "employee",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  employeeCode: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  employmentType: "Full Time",
  salary: "",
};

function AccountManagement() {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const setField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.firstName.trim() || !form.email.trim() || !form.password || !form.employeeCode.trim() || !form.joiningDate) {
      setError("First name, email, password, employee code, and joining date are required.");
      return;
    }

    try {
      setSaving(true);
      await createManagedAccount({
        ...form,
        firstName: form.firstName.trim(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        employeeCode: form.employeeCode.trim().toUpperCase(),
        department: form.department.trim(),
        designation: form.designation.trim(),
        phone: form.phone.trim(),
        salary: form.salary ? Number(form.salary) : 0,
      });
      setNotice(`${form.role === "hr" ? "HR" : "Employee"} account created. They can now sign in with the credentials provided.`);
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <EmployeeHeader />
      <main className="account-management">
        <header className="account-heading">
          <div>
            <p className="account-kicker">Administration</p>
            <h1>Create account</h1>
            <p>Create login credentials and the linked employee profile for HR or employees.</p>
          </div>
          <div className="account-security-note">
            <strong>Admin only</strong>
            <span>Passwords are stored securely and are never displayed again.</span>
          </div>
        </header>

        {error && <div className="account-alert" role="alert">{error}</div>}
        {notice && <div className="account-notice" role="status">{notice}</div>}

        <form className="account-form" onSubmit={handleSubmit}>
          <section className="account-section">
            <div className="account-section-heading">
              <div><p className="account-kicker">Access</p><h2>Account type</h2></div>
              <span>Required</span>
            </div>
            <div className="account-role-options">
              <label className={form.role === "employee" ? "selected" : ""}><input type="radio" name="role" value="employee" checked={form.role === "employee"} onChange={setField} /><strong>Employee</strong><small>Standard employee workspace access</small></label>
              <label className={form.role === "hr" ? "selected" : ""}><input type="radio" name="role" value="hr" checked={form.role === "hr"} onChange={setField} /><strong>HR</strong><small>People operations and payroll access</small></label>
            </div>
          </section>

          <section className="account-section">
            <div className="account-section-heading"><div><p className="account-kicker">Identity</p><h2>Personal details</h2></div></div>
            <div className="account-grid">
              <label>First name<input name="firstName" value={form.firstName} onChange={setField} placeholder="Aarav" required /></label>
              <label>Last name<input name="lastName" value={form.lastName} onChange={setField} placeholder="Sharma" /></label>
              <label>Email address<input name="email" type="email" value={form.email} onChange={setField} placeholder="name@company.com" required /></label>
              <label>Phone<input name="phone" value={form.phone} onChange={setField} placeholder="10 digit phone number" /></label>
            </div>
          </section>

          <section className="account-section">
            <div className="account-section-heading"><div><p className="account-kicker">Employment</p><h2>Work profile</h2></div></div>
            <div className="account-grid">
              <label>Employee code<input name="employeeCode" value={form.employeeCode} onChange={setField} placeholder={form.role === "hr" ? "HR001" : "EMP001"} required /></label>
              <label>Joining date<input name="joiningDate" type="date" value={form.joiningDate} onChange={setField} required /></label>
              <label>Department<input name="department" value={form.department} onChange={setField} placeholder="Human Resources" /></label>
              <label>Designation<input name="designation" value={form.designation} onChange={setField} placeholder={form.role === "hr" ? "HR Manager" : "Software Engineer"} /></label>
              <label>Employment type<select name="employmentType" value={form.employmentType} onChange={setField}><option>Full Time</option><option>Part Time</option><option>Contract</option><option>Intern</option></select></label>
              <label>Monthly salary (INR)<input name="salary" type="number" min="0" step="0.01" value={form.salary} onChange={setField} placeholder="50000" /></label>
            </div>
          </section>

          <section className="account-section">
            <div className="account-section-heading"><div><p className="account-kicker">Credentials</p><h2>Initial password</h2></div></div>
            <label className="password-field">Temporary password<input name="password" type="password" minLength="6" value={form.password} onChange={setField} placeholder="At least 6 characters" required /><small>Share this password securely and ask the user to change it after first sign-in.</small></label>
          </section>

          <div className="account-actions"><button type="submit" disabled={saving}>{saving ? "Creating account..." : `Create ${form.role === "hr" ? "HR" : "employee"} account`}</button></div>
        </form>
      </main>
    </>
  );
}

export default AccountManagement;
