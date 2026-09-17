import { useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useTimesheets } from "../../hooks/useTimesheets";
import { formatDate, formatTime } from "../../utils/date";
import "../../styles/employee/timesheets.css";

const today = new Date().toISOString().slice(0, 10);
const emptyForm = { date: today, project: "", task: "", description: "", startTime: "", endTime: "", breakMinutes: "0" };

function toIsoDate(value) { return value ? new Date(value).toISOString() : ""; }
function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function EmployeeTimesheets() {
  const { entries, totalHours, statusCounts, week, loading, error, reload, create, update, remove, submit, submitAll } = useTimesheets();
  const [selectedDate, setSelectedDate] = useState(today);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleWeekChange = (event) => { setSelectedDate(event.target.value); reload(event.target.value); };
  const handleCreate = async (event) => {
    event.preventDefault(); setFormError(""); setNotice("");
    if (!form.date || !form.task.trim() || !form.startTime || !form.endTime) { setFormError("Date, task, start time, and end time are required."); return; }
    try {
      setSaving(true);
      const payload = { ...form, task: form.task.trim(), project: form.project.trim(), description: form.description.trim(), startTime: toIsoDate(form.startTime), endTime: toIsoDate(form.endTime), breakMinutes: Number(form.breakMinutes) || 0 };
      if (editingId) await update(editingId, payload); else await create(payload);
      setForm({ ...emptyForm, date: form.date }); setEditingId(""); setNotice(editingId ? "Timesheet draft updated." : "Timesheet entry saved as draft.");
    } catch (requestError) { setFormError(requestError.message); } finally { setSaving(false); }
  };
  const beginEdit = (entry) => {
    setEditingId(entry._id);
    setForm({ date: String(entry.date).slice(0, 10), project: entry.project || "", task: entry.task || "", description: entry.description || "", startTime: toLocalDateTime(entry.startTime), endTime: toLocalDateTime(entry.endTime), breakMinutes: String(entry.breakMinutes || 0) });
    setFormError(""); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(""); setForm(emptyForm); setFormError(""); setNotice(""); };
  const handleAction = async (action, successMessage) => { setFormError(""); setNotice(""); try { await action(); setNotice(successMessage); } catch (requestError) { setFormError(requestError.message); } };

  return <>
    <EmployeeHeader />
    <main className="employee-page timesheet-page">
      <div className="timesheet-heading"><div><p className="page-kicker">Work tracking</p><h1>Timesheets</h1><p>Save work as a draft, then submit it to HR for review.</p></div><label className="week-picker">Week of<input type="date" value={selectedDate} onChange={handleWeekChange} /></label></div>
      {loading ? <Loader /> : error ? <ErrorMessage message={error} onRetry={() => reload(selectedDate)} /> : <>
        <section className="timesheet-summary"><div className="panel"><span>This week</span><strong>{totalHours.toFixed(2)}h</strong><small>{formatDate(week.start)} - {formatDate(week.end)}</small></div><div className="panel"><span>Draft</span><strong>{statusCounts.draft || 0}</strong><small>Still editable</small></div><div className="panel"><span>Submitted</span><strong>{statusCounts.submitted || 0}</strong><small>Waiting for HR</small></div><div className="panel"><span>Approved</span><strong>{statusCounts.approved || 0}</strong><small>Accepted by HR</small></div></section>
        <section className="panel timesheet-form-panel"><div className="section-heading"><h2>{editingId ? "Edit timesheet draft" : "Save work entry"}</h2><p>{editingId ? "Update this draft, then submit it to HR when ready." : "New entries are saved as drafts. Submit them below when they are ready for HR review."}</p></div>{formError && <p className="form-error" role="alert">{formError}</p>}{notice && <p className="form-success" role="status">{notice}</p>}<form className="timesheet-form" onSubmit={handleCreate}><label>Date<input name="date" type="date" value={form.date} onChange={handleChange} /></label><label>Project<input name="project" value={form.project} onChange={handleChange} placeholder="Optional" /></label><label>Task<input name="task" value={form.task} onChange={handleChange} placeholder="What did you work on?" /></label><label>Start time<input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} /></label><label>End time<input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} /></label><label>Break minutes<input name="breakMinutes" type="number" min="0" value={form.breakMinutes} onChange={handleChange} /></label><label className="description-field">Description<textarea name="description" rows="2" value={form.description} onChange={handleChange} placeholder="Optional details" /></label><div className="form-actions"><button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Save draft"}</button>{editingId && <button type="button" className="quiet-action" onClick={cancelEdit}>Cancel</button>}</div></form></section>
        <section className="panel table-wrapper"><div className="timesheet-table-heading"><div><h2>Week entries</h2><p>{entries.length ? "Drafts can be edited or deleted. Submitted entries are locked until HR responds." : "No entries for this week yet."}</p></div><button type="button" disabled={!entries.length || saving || (statusCounts.submitted || 0) > 0 || (statusCounts.approved || 0) > 0} onClick={() => handleAction(() => submitAll(selectedDate), "Week submitted to HR for review.")}>Submit week to HR</button></div><table><thead><tr><th>Date</th><th>Task</th><th>Time</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead><tbody>{entries.length ? entries.map((entry) => <tr key={entry._id}><td>{formatDate(entry.date)}</td><td><strong>{entry.task}</strong>{entry.project && <small>{entry.project}</small>}</td><td>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</td><td>{Number(entry.hours || 0).toFixed(2)}</td><td><span className={`timesheet-status ${entry.status}`}>{entry.status === "submitted" ? "Waiting for HR" : entry.status}</span></td><td className="timesheet-actions">{["draft", "rejected"].includes(entry.status) && <button type="button" onClick={() => beginEdit(entry)}>Edit</button>}{["draft", "rejected"].includes(entry.status) && <button type="button" onClick={() => handleAction(() => submit(entry._id), "Entry submitted to HR for review.")}>Submit to HR</button>}{entry.status === "draft" && <button type="button" className="quiet-action" onClick={() => handleAction(() => remove(entry._id), "Draft entry deleted.")}>Delete draft</button>}</td></tr>) : <tr><td colSpan="6" className="empty-cell">No timesheet entries for this week.</td></tr>}</tbody></table></section>
      </>}
    </main>
  </>;
}

export default EmployeeTimesheets;
