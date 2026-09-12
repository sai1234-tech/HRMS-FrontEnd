import { useCallback, useEffect, useMemo, useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import { createEmployees, deleteEmployeeById, getAllEmployees, updateEmployeeById } from "../../services/employeeService";
import "./EmployeeManagement.css";

const emptyForm = { employeeCode: "", firstName: "", lastName: "", email: "", phone: "", department: "", designation: "", joiningDate: "", employmentType: "Full Time", status: "Active" };

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadEmployees = useCallback(async () => {
    setError("");
    try { const response = await getAllEmployees(search); setEmployees(response.data || response.employees || []); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const activeEmployees = useMemo(() => employees.filter((employee) => employee.employment?.status === "Active"), [employees]);
  const visibleEmployees = employees.filter((employee) => statusFilter === "All" || (employee.employment?.status || "Active") === statusFilter);
  const setField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };
  const employeeName = (employee) => `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.user?.name || "Employee";

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!form.employeeCode.trim() || !form.firstName.trim() || !form.email.trim() || !form.joiningDate) { setError("Employee code, first name, email, and joining date are required."); return; }
    const payload = { employeeCode: form.employeeCode.trim().toUpperCase(), firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), employment: { department: form.department.trim(), designation: form.designation.trim(), joiningDate: form.joiningDate, employmentType: form.employmentType, status: form.status } };
    try { setSaving(true); if (editingId) { await updateEmployeeById(editingId, payload); setNotice("Employee updated successfully."); } else { await createEmployees([payload]); setNotice("Employee created successfully."); } resetForm(); await loadEmployees(); }
    catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  const editEmployee = (employee) => { setEditingId(employee._id || employee.id); setForm({ employeeCode: employee.employeeCode || "", firstName: employee.firstName || "", lastName: employee.lastName || "", email: employee.email || "", phone: employee.phone || "", department: employee.employment?.department || "", designation: employee.employment?.designation || "", joiningDate: employee.employment?.joiningDate ? new Date(employee.employment.joiningDate).toISOString().slice(0, 10) : "", employmentType: employee.employment?.employmentType || "Full Time", status: employee.employment?.status || "Active" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const removeEmployee = async (employee) => { if (!window.confirm(`Delete ${employeeName(employee)}?`)) return; try { await deleteEmployeeById(employee._id || employee.id); setNotice("Employee deleted successfully."); await loadEmployees(); } catch (requestError) { setError(requestError.message); } };

  if (loading) return <Loader label="Loading employees..." />;
  return <><EmployeeHeader /><main className="employee-management"><header className="employee-management-heading"><div><p className="employee-kicker">People directory</p><h1>Employees</h1><p>Manage employee records, roles, departments, and employment status.</p></div><div className="employee-kpis"><span><strong>{employees.length}</strong>Total</span><span><strong>{activeEmployees.length}</strong>Active</span></div></header>{error && <div className="employee-alert" role="alert">{error}</div>}{notice && <div className="employee-notice" role="status">{notice}</div>}<section className="employee-management-layout"><form className="employee-form panel" onSubmit={handleSubmit}><div className="form-heading"><div><h2>{editingId ? "Edit employee" : "Add employee"}</h2><p>Keep employee records accurate for HR operations.</p></div>{editingId && <button className="text-button" type="button" onClick={resetForm}>Cancel</button>}</div><div className="employee-form-grid"><label>Employee code<input name="employeeCode" value={form.employeeCode} onChange={setField} placeholder="EMP001" /></label><label>Joining date<input name="joiningDate" type="date" value={form.joiningDate} onChange={setField} /></label><label>First name<input name="firstName" value={form.firstName} onChange={setField} /></label><label>Last name<input name="lastName" value={form.lastName} onChange={setField} /></label><label>Email<input name="email" type="email" value={form.email} onChange={setField} /></label><label>Phone<input name="phone" value={form.phone} onChange={setField} /></label><label>Department<input name="department" value={form.department} onChange={setField} /></label><label>Designation<input name="designation" value={form.designation} onChange={setField} /></label><label>Employment type<select name="employmentType" value={form.employmentType} onChange={setField}><option>Full Time</option><option>Part Time</option><option>Contract</option><option>Intern</option></select></label><label>Status<select name="status" value={form.status} onChange={setField}><option>Active</option><option>Inactive</option></select></label></div><button className="save-button" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Create employee"}</button></form><section className="employee-directory panel"><div className="directory-heading"><div><h2>Employee directory</h2><p>{visibleEmployees.length} of {employees.length} employees shown</p></div><div className="directory-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" aria-label="Search employees" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></div></div><div className="employee-table-wrap"><table><thead><tr><th>Employee</th><th>Code</th><th>Department</th><th>Designation</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleEmployees.map((employee, index) => <tr key={employee._id || employee.id || index}><td><strong>{employeeName(employee)}</strong><small>{employee.email}</small></td><td>{employee.employeeCode || "-"}</td><td>{employee.employment?.department || "-"}</td><td>{employee.employment?.designation || "-"}</td><td>{employee.employment?.joiningDate ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(employee.employment.joiningDate)) : "-"}</td><td><span className={`employee-status ${String(employee.employment?.status || "Active").toLowerCase()}`}>{employee.employment?.status || "Active"}</span></td><td><div className="row-actions"><button type="button" onClick={() => editEmployee(employee)}>Edit</button><button type="button" onClick={() => removeEmployee(employee)}>Delete</button></div></td></tr>)}</tbody></table></div></section></section></main></>;
}

export default EmployeeManagement;
