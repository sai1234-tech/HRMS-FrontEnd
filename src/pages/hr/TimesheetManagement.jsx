import { useCallback, useEffect, useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getAllTimesheets, reviewTimesheet } from "../../services/timesheetService";
import { formatDate, formatTime } from "../../utils/date";
import "../../styles/employee/timesheets.css";

function TimesheetManagement() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("submitted");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const loadEntries = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await getAllTimesheets(status ? { status } : {}); const records = response.data || response.timesheets || []; setEntries(Array.isArray(records) ? records : []); }
    catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }, [status]);
  useEffect(() => { loadEntries(); }, [loadEntries]);
  const handleReview = async (entry, nextStatus) => {
    const reviewComment = nextStatus === "rejected" ? window.prompt("Reason for rejection") : "";
    if (nextStatus === "rejected" && !reviewComment?.trim()) return;
    setActionError("");
    try { await reviewTimesheet(entry._id, nextStatus, reviewComment); await loadEntries(); }
    catch (requestError) { setActionError(requestError.message); }
  };
  return <><EmployeeHeader /><main className="employee-page timesheet-page"><div className="timesheet-heading"><div><p className="page-kicker">People operations</p><h1>Timesheet review</h1><p>Submitted entries appear here for approval. Drafts stay with the employee.</p></div><label className="week-picker">Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="draft">Draft</option></select></label></div>{actionError && <p className="form-error" role="alert">{actionError}</p>}{loading ? <Loader /> : error ? <ErrorMessage message={error} onRetry={loadEntries} /> : <section className="panel table-wrapper"><table><thead><tr><th>Employee</th><th>Date</th><th>Task</th><th>Time</th><th>Hours</th><th>Status</th><th>Action</th></tr></thead><tbody>{entries.length ? entries.map((entry) => <tr key={entry._id}><td>{entry.employee?.firstName || ""} {entry.employee?.lastName || entry.employee?.email || "-"}</td><td>{formatDate(entry.date)}</td><td><strong>{entry.task}</strong>{entry.project && <small>{entry.project}</small>}</td><td>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</td><td>{Number(entry.hours || 0).toFixed(2)}</td><td><span className={`timesheet-status ${entry.status}`}>{entry.status === "submitted" ? "Awaiting review" : entry.status}</span></td><td className="timesheet-actions">{entry.status === "submitted" && <><button type="button" onClick={() => handleReview(entry, "approved")}>Approve</button><button type="button" className="quiet-action" onClick={() => handleReview(entry, "rejected")}>Reject</button></>}</td></tr>) : <tr><td colSpan="7" className="empty-cell">No submitted timesheets are waiting for review.</td></tr>}</tbody></table></section>}</main></>;
}

export default TimesheetManagement;