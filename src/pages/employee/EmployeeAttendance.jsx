import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAttendance } from "../../hooks/useAttendance";
import { formatDate, formatTime } from "../../utils/date";
import "../../styles/employee/attendance.css";

function EmployeeAttendance() {
	const { attendance, todayAttendance, loading, error, reload } = useAttendance();
	const countStatus = (statuses) => attendance.filter((record) => statuses.includes(String(record.status || "").toLowerCase())).length;
	const present = countStatus(["present", "completed", "half-day", "halfday"]);
	const late = countStatus(["late"]);
	const absent = countStatus(["absent"]);
	return <><EmployeeHeader /><main className="employee-page"><div className="attendance-page-heading"><div><p className="page-kicker">Time and attendance</p><h1>Attendance</h1><p>Track your working hours and attendance history.</p></div><button type="button" className="refresh-button" onClick={reload}>Refresh</button></div>{loading ? <Loader /> : error ? <ErrorMessage message={error} onRetry={reload} /> : <><section className="attendance-summary"><div className="panel"><span>Total records</span><strong>{attendance.length}</strong></div><div className="panel"><span>Present</span><strong className="text-present">{present}</strong></div><div className="panel"><span>Late</span><strong className="text-late">{late}</strong></div><div className="panel"><span>Absent</span><strong className="text-absent">{absent}</strong></div></section><section className="panel today-attendance"><div><span className="page-kicker">Today</span><h2>{todayAttendance?.status || (todayAttendance?.checkIn ? "Checked in" : "Not checked in")}</h2></div><div><span>Clock in</span><strong>{formatTime(todayAttendance?.checkIn)}</strong></div><div><span>Clock out</span><strong>{formatTime(todayAttendance?.checkOut)}</strong></div></section><div className="panel table-wrapper"><table><thead><tr><th>Date</th><th>Clock in</th><th>Clock out</th><th>Working hours</th><th>Status</th></tr></thead><tbody>{attendance.length ? attendance.map((record, index) => <tr key={record.id || record._id || index}><td>{formatDate(record.date)}</td><td>{formatTime(record.checkIn || record.clockIn)}</td><td>{formatTime(record.checkOut || record.clockOut)}</td><td>{record.workingHours ?? "-"}</td><td><span className={`attendance-status ${String(record.status || "").toLowerCase()}`}>{record.status || "-"}</span></td></tr>) : <tr><td colSpan="5" className="empty-cell">No attendance records yet.</td></tr>}</tbody></table></div></>}</main></>;
}

export default EmployeeAttendance;
