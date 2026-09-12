import { useCallback, useEffect, useMemo, useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import { createDepartments, deleteDepartment, getDepartments, updateDepartment } from "../../services/departmentService";
import "./DepartmentManagement.css";

const emptyDepartment = { departmentCode: "", departmentName: "", description: "", managerName: "", managerEmail: "", location: "", status: "Active" };

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyDepartment);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDepartments = useCallback(async () => {
    setError("");
    try { const response = await getDepartments(search); setDepartments(response.departments || response.data || []); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  const activeCount = useMemo(() => departments.filter((department) => department.status === "Active").length, [departments]);
  const inactiveCount = departments.length - activeCount;
  const visibleDepartments = departments.filter((department) => statusFilter === "All" || department.status === statusFilter);
  const setField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const resetForm = () => { setForm(emptyDepartment); setEditingId(null); };

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!form.departmentCode.trim() || !form.departmentName.trim()) { setError("Department code and department name are required."); return; }
    try { setSaving(true); if (editingId) { await updateDepartment(editingId, form); setNotice("Department updated successfully."); } else { await createDepartments([{ ...form, departmentCode: form.departmentCode.trim().toUpperCase(), departmentName: form.departmentName.trim() }]); setNotice("Department created successfully."); } resetForm(); await loadDepartments(); }
    catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  const editDepartment = (department) => { setEditingId(department._id || department.id); setForm({ departmentCode: department.departmentCode || "", departmentName: department.departmentName || "", description: department.description || "", managerName: department.managerName || "", managerEmail: department.managerEmail || "", location: department.location || "", status: department.status || "Active" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const removeDepartment = async (department) => { if (!window.confirm(`Delete ${department.departmentName}?`)) return; try { await deleteDepartment(department._id || department.id); setNotice("Department deleted successfully."); await loadDepartments(); } catch (requestError) { setError(requestError.message); } };

  if (loading) return <Loader label="Loading departments..." />;

  return <><EmployeeHeader /><main className="department-page"><header className="department-heading"><div><p className="department-kicker">Organisation setup</p><h1>Departments</h1><p>Keep teams, managers, and workplace locations organised.</p></div><button className="header-create-button" type="button" onClick={() => { resetForm(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>+ Add department</button></header>{error && <div className="department-alert" role="alert">{error}</div>}{notice && <div className="department-notice" role="status">{notice}</div>}<section className="department-metrics"><div><span>Total departments</span><strong>{departments.length}</strong><small>Across the organisation</small></div><div><span>Active</span><strong className="metric-active">{activeCount}</strong><small>Available for assignment</small></div><div><span>Inactive</span><strong className="metric-inactive">{inactiveCount}</strong><small>Not currently operating</small></div></section><section className="department-layout"><form className="department-form panel" onSubmit={handleSubmit}><div className="form-heading"><div><h2>{editingId ? "Edit department" : "Add department"}</h2><p>{editingId ? "Update the department record." : "Create a new department record."}</p></div>{editingId && <button className="text-button" type="button" onClick={resetForm}>Cancel</button>}</div><div className="department-form-grid"><label>Department code<input name="departmentCode" value={form.departmentCode} onChange={setField} placeholder="e.g. ENG" /></label><label>Department name<input name="departmentName" value={form.departmentName} onChange={setField} placeholder="e.g. Engineering" /></label><label>Manager name<input name="managerName" value={form.managerName} onChange={setField} placeholder="Full name" /></label><label>Manager email<input name="managerEmail" type="email" value={form.managerEmail} onChange={setField} placeholder="manager@company.com" /></label><label>Location<input name="location" value={form.location} onChange={setField} placeholder="Office or city" /></label><label>Status<select name="status" value={form.status} onChange={setField}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label><label className="description-field">Description<textarea name="description" value={form.description} onChange={setField} rows="4" placeholder="What does this department own?" /></label></div><button className="save-button" type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Create department"}</button></form><section className="department-list panel"><div className="list-heading"><div><h2>Department directory</h2><p>{visibleDepartments.length} of {departments.length} departments shown</p></div><div className="directory-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search departments" aria-label="Search departments" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter department status"><option value="All">All statuses</option><option value="Active">Active only</option><option value="Inactive">Inactive only</option></select></div></div>{visibleDepartments.length ? <div className="department-cards">{visibleDepartments.map((department) => <article className="department-card" key={department._id || department.id}><div className="department-card-top"><span className="department-code">{department.departmentCode}</span><span className={`department-status ${String(department.status).toLowerCase()}`}>{department.status}</span></div><h3>{department.departmentName}</h3><p>{department.description || "No description provided."}</p><dl><div><dt>Manager</dt><dd>{department.managerName || "Not assigned"}</dd></div><div><dt>Location</dt><dd>{department.location || "Not assigned"}</dd></div><div><dt>Email</dt><dd>{department.managerEmail || "Not provided"}</dd></div></dl><div className="department-actions"><button type="button" onClick={() => editDepartment(department)}>Edit</button><button type="button" onClick={() => removeDepartment(department)}>Delete</button></div></article>)}</div> : <div className="department-empty"><strong>No departments found</strong><span>Try another filter or create a department.</span></div>}</section></section></main></>;
}

export default DepartmentManagement;
