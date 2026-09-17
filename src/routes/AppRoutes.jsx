import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import AdminSetup from "../pages/auth/AdminSetup";

// Employee pages
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeeAttendance from "../pages/employee/EmployeeAttendance";
import EmployeeLeaves from "../pages/employee/EmployeeLeaves";
import EmployeeTimesheets from "../pages/employee/EmployeeTimesheets";
import EmployeeProfile from "../pages/employee/EmployeeProfile";
import EmployeePayroll from "../pages/employee/EmployeePayroll";
import EmployeeDocuments from "../pages/employee/EmployeeDocuments";

// HR pages
import HRDashboard from "../pages/hr/HRDashboard";
import DepartmentManagement from "../pages/hr/DepartmentManagement";
import EmployeeManagement from "../pages/hr/EmployeeManagement";
import TimesheetManagement from "../pages/hr/TimesheetManagement";
import PayrollManagement from "../pages/hr/PayrollManagement";
import DocumentManagement from "../pages/hr/DocumentManagement";
import AccountManagement from "../pages/admin/AccountManagement";
import AdminDashboard from "../pages/admin/AdminDashboard";

import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../utils/auth";

/**
 * Protect routes based on authentication and role.
 */
function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  // Auth state is still loading
  if (loading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role before checking
  const userRole = normalizeRole(user);

  // Role is not allowed
  if (roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/admin/setup"
        element={<AdminSetup />}
      />


      {/* =========================
          EMPLOYEE ROUTES
      ========================== */}

      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeAttendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/leaves"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeLeaves />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/timesheets"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeTimesheets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/payroll"
        element={
          <ProtectedRoute roles={["employee", "hr"]}>
            <EmployeePayroll />
          </ProtectedRoute>
        }
      />

      <Route path="/employee/documents" element={<ProtectedRoute roles={["employee"]}><EmployeeDocuments /></ProtectedRoute>} />


      {/* =========================
          ADMIN ROUTES
      ========================== */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/accounts"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AccountManagement />
          </ProtectedRoute>
        }
      />


      {/* =========================
          HR / ADMIN ROUTES
      ========================== */}

      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute roles={["hr"]}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/departments"
        element={
          <ProtectedRoute roles={["hr"]}>
            <DepartmentManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/employees"
        element={
          <ProtectedRoute roles={["hr"]}>
            <EmployeeManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/timesheets"
        element={
          <ProtectedRoute roles={["hr"]}>
            <TimesheetManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr/payroll"
        element={
          <ProtectedRoute roles={["hr"]}>
            <PayrollManagement />
          </ProtectedRoute>
        }
      />

      <Route path="/hr/documents" element={<ProtectedRoute roles={["hr"]}><DocumentManagement /></ProtectedRoute>} />


      {/* =========================
          UNAUTHORIZED
      ========================== */}

      <Route
        path="/unauthorized"
        element={
          <main style={{ padding: "30px" }}>
            <h1>Access Denied</h1>
            <p>
              You do not have permission to access this page.
            </p>
          </main>
        }
      />


      {/* =========================
          FALLBACK
      ========================== */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;