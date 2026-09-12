import { useEffect, useMemo, useState } from "react";
import { getLeaveTypes, approveLeave, rejectLeave, revertLeave } from "../../services/hrService";
import { formatDate } from "../../utils/date";

function LeaveManagement({ leaves, onChanged }) {
  const [types, setTypes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionError, setActionError] = useState("");

  useEffect(() => { getLeaveTypes().then((response) => setTypes(response.data || [])).catch(() => setTypes([])); }, []);

  const filteredLeaves = useMemo(() => leaves.filter((leave) => {
    const statusMatches = statusFilter === "all" || leave.status === statusFilter;
    const typeId = leave.leaveType?._id || leave.leaveType?.id || leave.leaveType;
    return statusMatches && (typeFilter === "all" || typeId === typeFilter);
  }), [leaves, statusFilter, typeFilter]);
  const history = filteredLeaves.filter((leave) => ["Approved", "Rejected", "Cancelled"].includes(leave.status));
  const pending = filteredLeaves.filter((leave) => leave.status === "Pending");
  const balance = types.map((type) => {
    const used = leaves.filter((leave) => leave.leaveType?._id === type._id && leave.status === "Approved").reduce((total, leave) => total + Number(leave.numberOfDays || 0), 0);
    return { ...type, available: Math.max(Number(type.annualAllocation || 0) - used, 0) };
  });

  const act = async (leaveId, action) => {
    setActionError("");
    try {
      if (action === "approve") await approveLeave(leaveId);
      if (action === "reject") { const reason = window.prompt("Why is this leave being rejected?"); if (!reason?.trim()) return; await rejectLeave(leaveId, reason.trim()); }
      if (action === "revert") await revertLeave(leaveId);
      await onChanged();
    } catch (error) { setActionError(error.message); }
  };

  return <section className="hr-panel leave-management"><div className="hr-panel-heading"><div><h2>Leave management</h2><p>Review requests, balances, and approval history.</p></div><div className="leave-filters"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option><option value="Cancelled">Cancelled</option></select><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">All leave types</option>{types.map((type) => <option key={type._id} value={type._id}>{type.name}</option>)}</select></div></div>{actionError && <p className="hr-inline-error">{actionError}</p>}<div className="leave-balance-strip">{balance.map((type) => <div key={type._id}><span>{type.name}</span><strong>{type.available}</strong><small>days available</small></div>)}</div><h3>Pending requests</h3>{pending.length ? pending.map((leave) => <div className="leave-management-row" key={leave._id}><div><strong>{leave.employee?.firstName || "Employee"} {leave.employee?.lastName || ""}</strong><span>{leave.leaveType?.name || "Leave"} · {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</span><small>{leave.reason || "No reason provided"}</small></div><div className="leave-actions"><button type="button" onClick={() => act(leave._id, "approve")}>Approve</button><button type="button" onClick={() => act(leave._id, "reject")}>Reject</button></div></div>) : <p className="empty-state">No pending requests match the selected filters.</p>}<h3>Approval history</h3><div className="history-list">{history.length ? history.map((leave) => <div className="leave-management-row" key={leave._id}><div><strong>{leave.employee?.firstName || "Employee"} {leave.employee?.lastName || ""}</strong><span>{leave.leaveType?.name || "Leave"} · {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</span></div><div><span className={`status-pill ${String(leave.status).toLowerCase()}`}>{leave.status}</span>{["Approved", "Rejected"].includes(leave.status) && <button className="revert-button" type="button" onClick={() => act(leave._id, "revert")}>Revert</button>}</div></div>) : <p className="empty-state">No approval history.</p>}</div></section>;
}

export default LeaveManagement;
