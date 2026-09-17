import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { getAdminSummary } from "../../services/authService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    setError("");
    try {
      const response = await getAdminSummary();
      setSummary(response.data || response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
  const metric = (label, value, detail, tone = "") => <article className={`admin-stat ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;

  if (loading) return <Loader label="Loading admin statistics..." />;

  return (
    <>
      <EmployeeHeader />
      <main className="admin-dashboard">
        <header className="admin-dashboard-heading">
          <div>
            <p className="admin-kicker">System administration</p>
            <h1>Admin dashboard</h1>
            <p>Welcome back, {user?.name || "Administrator"}. Monitor the organization from one place.</p>
          </div>
          <div className="admin-heading-actions"><div className="admin-identity"><span>Signed in as</span><strong>{user?.email}</strong><small>Administrator</small></div><button type="button" className="admin-refresh" onClick={() => { setRefreshing(true); loadSummary(); }} disabled={refreshing}>{refreshing ? "Refreshing..." : "Refresh data"}</button></div>
        </header>

        {error && <div className="admin-alert" role="alert">{error}<button type="button" onClick={loadSummary}>Try again</button></div>}

        {summary && <>
          <section className="admin-section"><div className="admin-section-heading"><div><p className="admin-kicker">Workforce overview</p><h2>People at a glance</h2></div></div><div className="admin-stats-grid">{metric("Total employees", summary.employees.total, "Employee profiles")}{metric("Total HRs", summary.hr.total, "HR accounts", "teal")}{metric("Active employees", summary.employees.active, "Currently active", "green")}{metric("Inactive employees", summary.employees.inactive, "Inactive or terminated", "amber")}{metric("Departments", summary.departments.total, "Organization units")}{metric("Pending documents", summary.documents.pending, "Requests awaiting action", "rose")}</div></section>

          <section className="admin-summary-grid"><article className="admin-summary-card"><div className="admin-card-heading"><div><p className="admin-kicker">Payroll summary</p><h2>Compensation overview</h2></div><Link to="/hr/payroll">Open payroll</Link></div><div className="admin-detail-grid"><div><span>Net payroll</span><strong>{money(summary.payroll.net)}</strong></div><div><span>Gross payroll</span><strong>{money(summary.payroll.gross)}</strong></div><div><span>Deductions</span><strong>{money(summary.payroll.deductions)}</strong></div><div><span>Paid records</span><strong>{summary.payroll.paid} / {summary.payroll.records}</strong></div></div></article><article className="admin-summary-card"><div className="admin-card-heading"><div><p className="admin-kicker">Attendance summary</p><h2>Workforce activity</h2></div><Link to="/hr/dashboard">View attendance</Link></div><div className="admin-detail-grid"><div><span>Total records</span><strong>{summary.attendance.total}</strong></div><div><span>Present</span><strong>{summary.attendance.present || 0}</strong></div><div><span>Late</span><strong>{summary.attendance.late || 0}</strong></div><div><span>Absent</span><strong>{summary.attendance.absent || 0}</strong></div></div></article></section>

          <section className="admin-section admin-account-summary"><div className="admin-section-heading"><div><p className="admin-kicker">System statistics</p><h2>Account control</h2></div><Link className="admin-action admin-action-light" to="/admin/accounts">Manage accounts <span aria-hidden="true">-&gt;</span></Link></div><div className="admin-account-stats"><div><span>Total accounts</span><strong>{summary.accounts.total}</strong></div><div><span>Active accounts</span><strong>{summary.accounts.active}</strong></div><div><span>Inactive accounts</span><strong>{summary.accounts.inactive}</strong></div></div></section>
        </>}

        <section className="admin-dashboard-grid">
          <article className="admin-dashboard-card admin-dashboard-primary">
            <span className="admin-card-label">Account provisioning</span>
            <h2>Create HR or employee accounts</h2>
            <p>Set up login credentials and a linked employee profile from one secure admin form.</p>
            <Link className="admin-action" to="/admin/accounts">Create an account <span aria-hidden="true">-&gt;</span></Link>
          </article>
          <article className="admin-dashboard-card">
            <span className="admin-card-label">Account control</span>
            <h2>Manage existing accounts</h2>
            <p>Create access for HR and employees, with one linked profile for each person.</p>
            <Link className="admin-action admin-action-light" to="/admin/accounts">Open account management <span aria-hidden="true">-&gt;</span></Link>
          </article>
        </section>

        <section className="admin-checklist">
          <div><p className="admin-kicker">Access model</p><h2>Keep account creation controlled</h2></div>
          <ul><li>Public signup creates employee accounts only.</li><li>Only admins can create HR credentials.</li><li>Passwords are hashed and cannot be viewed after creation.</li></ul>
        </section>
      </main>
    </>
  );
}

export default AdminDashboard;
