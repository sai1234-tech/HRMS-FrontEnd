import { useCallback, useEffect, useMemo, useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import LeaveManagement from "../../components/hr/LeaveManagement";
import MonthlyAttendanceReport from "../../components/hr/MonthlyAttendanceReport";
import Loader from "../../components/common/Loader";
import { getAllAttendance, getAllLeaves, getEmployees } from "../../services/hrService";
import { formatDate, formatTime } from "../../utils/date";
import "./HRDashboard.css";

function listFrom(response) {
  const value = response?.data || response?.records || response?.employees || [];
  return Array.isArray(value) ? value : [];
}

function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const [employeeResponse, attendanceResponse, leaveResponse] = await Promise.all([getEmployees(search), getAllAttendance(), getAllLeaves()]);
      setEmployees(listFrom(employeeResponse));
      setAttendance(listFrom(attendanceResponse));
      setLeaves(listFrom(leaveResponse));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const activeEmployees = employees.filter((employee) => employee.employment?.status !== "Inactive");
  const pendingLeaves = useMemo(() => leaves.filter((leave) => leave.status === "Pending"), [leaves]);
  const presentToday = attendance.filter((record) => ["present", "late", "half-day", "completed"].includes(String(record.status || "").toLowerCase())).length;

  if (loading) return <Loader label="Loading HR workspace..." />;

  return <><EmployeeHeader /><main className="hr-dashboard"><header className="hr-heading"><div><p className="hr-kicker">People operations</p><h1>HR dashboard</h1><p>Monitor your workforce, attendance, and leave approvals.</p></div><button type="button" onClick={() => { setRefreshing(true); loadDashboard(); }} disabled={refreshing}>{refreshing ? "Refreshing..." : "Refresh data"}</button></header>{error && <div className="hr-alert" role="alert">{error}<button type="button" onClick={loadDashboard}>Try again</button></div>}<section className="hr-metrics"><div className="hr-metric"><span>Total employees</span><strong>{employees.length}</strong><small>People in directory</small></div><div className="hr-metric"><span>Active employees</span><strong>{activeEmployees.length}</strong><small>Currently active</small></div><div className="hr-metric"><span>Attendance records</span><strong>{attendance.length}</strong><small>{presentToday} attended records</small></div><div className="hr-metric"><span>Pending leave</span><strong>{pendingLeaves.length}</strong><small>Awaiting review</small></div></section><section className="hr-panel"><div className="hr-panel-heading"><div><h2>Employee directory</h2><p>Search employees by name, code, department, or email.</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees" aria-label="Search employees" /></div><div className="hr-table-wrap"><table><thead><tr><th>Employee</th><th>Code</th><th>Department</th><th>Designation</th><th>Status</th></tr></thead><tbody>{employees.map((employee, index) => <tr key={employee._id || employee.id || index}><td><strong>{`${employee.firstName || ""} ${employee.lastName || ""}`.trim() || employee.user?.name || "Employee"}</strong><small>{employee.email}</small></td><td>{employee.employeeCode || "-"}</td><td>{employee.employment?.department || "-"}</td><td>{employee.employment?.designation || "-"}</td><td><span className="status-pill">{employee.employment?.status || (employee.user?.isActive ? "Active" : "Inactive")}</span></td></tr>)}</tbody></table></div></section><LeaveManagement leaves={leaves} onChanged={loadDashboard} /><section className="hr-panel attendance-panel"><div className="hr-panel-heading"><div><h2>Attendance monitoring</h2><p>Latest attendance activity across the workforce.</p></div></div><div className="hr-table-wrap"><table><thead><tr><th>Employee</th><th>Date</th><th>Clock in</th><th>Clock out</th><th>Status</th></tr></thead><tbody>{attendance.slice(0, 10).map((record, index) => <tr key={record._id || record.id || index}><td>{record.employee?.name || `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`.trim() || "Employee"}</td><td>{formatDate(record.date)}</td><td>{formatTime(record.checkIn)}</td><td>{formatTime(record.checkOut)}</td><td><span className={`status-pill ${String(record.status || "").toLowerCase()}`}>{record.status || "-"}</span></td></tr>)}</tbody></table></div></section><MonthlyAttendanceReport /></main></>;
}

export default HRDashboard;
