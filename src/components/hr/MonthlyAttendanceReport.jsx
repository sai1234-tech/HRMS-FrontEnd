import { useEffect, useState } from "react";
import { getMonthlyAttendanceReport } from "../../services/hrService";
import { formatDate, formatTime } from "../../utils/date";
import "./MonthlyAttendanceReport.css";

function MonthlyAttendanceReport() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    getMonthlyAttendanceReport(year, month).then((response) => { if (active) setRecords(response.data || []); }).catch((requestError) => { if (active) setError(requestError.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [year, month]);

  return <section className="hr-panel monthly-report"><div className="hr-panel-heading"><div><h2>Monthly attendance report</h2><p>Review attendance activity by month.</p></div><div className="report-filters"><select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2000, index, 1).toLocaleString(undefined, { month: "short" })}</option>)}</select><select value={year} onChange={(event) => setYear(Number(event.target.value))}>{[year - 1, year, year + 1].map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div>{loading ? <p className="empty-state">Loading monthly report...</p> : error ? <p className="hr-inline-error">{error}</p> : <div className="hr-table-wrap"><table><thead><tr><th>Employee</th><th>Date</th><th>Clock in</th><th>Clock out</th><th>Hours</th><th>Status</th></tr></thead><tbody>{records.length ? records.map((record, index) => <tr key={record.id || index}><td>{record.employee?.name || "Employee"}</td><td>{formatDate(record.date)}</td><td>{formatTime(record.checkIn)}</td><td>{formatTime(record.checkOut)}</td><td>{record.workingHours ?? "-"}</td><td>{record.status || "-"}</td></tr>) : <tr><td colSpan="6" className="empty-cell">No attendance records for this month.</td></tr>}</tbody></table></div>}</section>;
}

export default MonthlyAttendanceReport;
