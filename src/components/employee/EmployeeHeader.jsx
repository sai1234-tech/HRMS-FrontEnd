import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";
import { normalizeRole } from "../../utils/auth";

function EmployeeHeader() {
  const { user, logout } = useAuth();
  const role = normalizeRole(user);
  const isEmployee = role === "employee";
  const isAdmin = role === "admin";
  const isHr = role === "hr";
  return (
    <header className="employee-header">
      <div className="brand">
        <strong>HRMS</strong>
        <span>{isEmployee ? "Employee portal" : "People operations"}</span>
      </div>
      <nav aria-label="Primary navigation">
        {isEmployee ? (
          <>
            <NavLink to="/employee/dashboard">Overview</NavLink>
            <NavLink to="/employee/attendance">Attendance</NavLink>
            <NavLink to="/employee/timesheets">Timesheets</NavLink>
            <NavLink to="/employee/leaves">Leave</NavLink>
            <NavLink to="/employee/payroll">Payroll</NavLink>
            <NavLink to="/employee/documents">Documents</NavLink>
            <NavLink to="/employee/profile">Profile</NavLink>
          </>
        ) : isHr ? (
          <>
            <NavLink to="/hr/dashboard">HR dashboard</NavLink>
            <NavLink to="/hr/employees">Employees</NavLink>
            <NavLink to="/hr/departments">Departments</NavLink>
            <NavLink to="/hr/timesheets">Timesheets</NavLink>
            <NavLink to="/hr/payroll">Payroll</NavLink>
            <NavLink to="/hr/documents">Documents</NavLink>
            <NavLink to="/employee/payroll">My payroll</NavLink>
          </>
        ) : (
          <>
            {isAdmin && <NavLink to="/admin/dashboard">Admin dashboard</NavLink>}
            {isAdmin && <NavLink to="/admin/accounts">Accounts</NavLink>}
          </>
        )}
      </nav>
      <div className="employee-header-actions">
        <span>{user?.name || user?.email || "User"}</span>
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default EmployeeHeader;
