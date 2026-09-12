import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeeAttendance from "../pages/employee/EmployeeAttendance";
import EmployeeLeaves from "../pages/employee/EmployeeLeaves";
import EmployeeProfile from "../pages/employee/EmployeeProfile";
import HRDashboard from "../pages/hr/HRDashboard";
import DepartmentManagement from "../pages/hr/DepartmentManagement";
import EmployeeManagement from "../pages/hr/EmployeeManagement";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/employee/dashboard" element={<ProtectedRoute roles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
    <Route path="/employee/attendance" element={<ProtectedRoute roles={["employee"]}><EmployeeAttendance /></ProtectedRoute>} />
    <Route path="/employee/leaves" element={<ProtectedRoute roles={["employee"]}><EmployeeLeaves /></ProtectedRoute>} />
    <Route path="/employee/profile" element={<ProtectedRoute roles={["employee"]}><EmployeeProfile /></ProtectedRoute>} />
    <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><HRDashboard /></ProtectedRoute>} />
    <Route path="/hr/dashboard" element={<ProtectedRoute roles={["hr", "admin"]}><HRDashboard /></ProtectedRoute>} />
    <Route path="/hr/departments" element={<ProtectedRoute roles={["hr", "admin"]}><DepartmentManagement /></ProtectedRoute>} />
    <Route path="/hr/employees" element={<ProtectedRoute roles={["hr", "admin"]}><EmployeeManagement /></ProtectedRoute>} />
    <Route path="/unauthorized" element={<main style={{ padding: 30 }}><h1>Access Denied</h1></main>} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>;
}

export default AppRoutes;
