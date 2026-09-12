import { useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useLeaves } from "../../hooks/useLeaves";
import { formatDate } from "../../utils/date";
import "../../styles/employee/leaves.css";

function EmployeeLeaves() {
	const { leaves, leaveTypes, balance, loading, error, reload, submitLeave, cancel } = useLeaves();
	const [form, setForm] = useState({ leaveType: "", startDate: "", endDate: "", reason: "" });
	const [submitError, setSubmitError] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
	const handleSubmit = async (event) => {
		event.preventDefault(); setSubmitError(""); setSubmitted(false);
		if (!form.leaveType || !form.startDate || !form.endDate || !form.reason.trim()) { setSubmitError("Leave type, dates, and reason are required."); return; }
		if (form.startDate > form.endDate) { setSubmitError("End date must be on or after start date."); return; }
		try { setSubmitting(true); await submitLeave({ ...form, reason: form.reason.trim() }); setForm({ leaveType: "", startDate: "", endDate: "", reason: "" }); setSubmitted(true); }
		catch (requestError) { setSubmitError(requestError.message); }
		finally { setSubmitting(false); }
	};

	return <><EmployeeHeader /><main className="employee-page"><h1>Leave requests</h1>{loading ? <Loader /> : error ? <ErrorMessage message={error} onRetry={reload} /> : <><section className="leave-balance-cards">{balance.map((item, index) => <div className="panel" key={item.leaveType?._id || index}><span>{item.leaveType?.name || "Leave"}</span><strong>{item.available ?? 0}</strong><small>days available</small></div>)}</section><section className="panel leave-form-panel"><div className="section-heading"><h2>Request leave</h2><p>Submit a request for manager approval.</p></div>{submitError && <p className="form-error" role="alert">{submitError}</p>}{submitted && <p className="form-success" role="status">Leave request submitted successfully.</p>}<form className="leave-form" onSubmit={handleSubmit}><label>Leave type<select name="leaveType" value={form.leaveType} onChange={handleChange}><option value="">Select leave type</option>{leaveTypes.map((type) => <option key={type._id || type.id} value={type._id || type.id}>{type.name || type.leaveType?.name || type.code}</option>)}</select></label><label>Start date<input name="startDate" type="date" value={form.startDate} onChange={handleChange} min={new Date().toISOString().slice(0, 10)} /></label><label>End date<input name="endDate" type="date" value={form.endDate} onChange={handleChange} min={form.startDate || new Date().toISOString().slice(0, 10)} /></label><label className="reason-field">Reason<textarea name="reason" value={form.reason} onChange={handleChange} rows="3" placeholder="Explain the reason for your leave" /></label><button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit request"}</button></form></section><div className="panel table-wrapper"><table><thead><tr><th>Type</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead><tbody>{leaves.map((leave, index) => <tr key={leave.id || leave._id || index}><td>{leave.type || leave.leaveType?.name || "-"}</td><td>{formatDate(leave.startDate)}</td><td>{formatDate(leave.endDate)}</td><td>{leave.status || "Pending"}</td><td>{leave.status === "Pending" && <button type="button" onClick={() => cancel(leave._id || leave.id)}>Cancel</button>}</td></tr>)}</tbody></table></div></>}</main></>;
}

export default EmployeeLeaves;
