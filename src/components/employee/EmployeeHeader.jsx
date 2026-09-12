import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

function EmployeeHeader() {
  const { user, logout } = useAuth();
  const isEmployee = user?.role === "employee";
  return <header className="employee-header"><div className="brand"><strong>HRMS</strong><span>{isEmployee ? "Employee portal" : "People operations"}</span></div><nav aria-label="Primary navigation">{isEmployee ? <><NavLink to="/employee/dashboard">Overview</NavLink><NavLink to="/employee/attendance">Attendance</NavLink><NavLink to="/employee/leaves">Leave</NavLink><NavLink to="/employee/profile">Profile</NavLink></> : <><NavLink to="/hr/dashboard">HR dashboard</NavLink><NavLink to="/hr/employees">Employees</NavLink><NavLink to="/hr/departments">Departments</NavLink></>}</nav><div className="employee-header-actions"><span>{user?.name || user?.email || "User"}</span><button type="button" onClick={logout}>Sign out</button></div></header>;
}

export default EmployeeHeader;
