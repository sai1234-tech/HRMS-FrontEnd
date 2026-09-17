import EmployeeHeader from "../../components/employee/EmployeeHeader";
import EmployeeProfile from "../../components/employee/EmployeeProfile";
import AttendanceCard from "../../components/employee/AttendanceCard";
import AttendanceSummary from "../../components/employee/AttendanceSummary";
import RecentActivity from "../../components/employee/RecentActivity";
import LeaveBalance from "../../components/employee/LeaveBalance";
import RecentLeaves from "../../components/employee/RecentLeaves";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import { useEmployee } from "../../hooks/useEmployee";
import { useAttendance } from "../../hooks/useAttendance";
import { useLeaves } from "../../hooks/useLeaves";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const { employee: sessionEmployee } = useAuth();
  const employeeState = useEmployee();
  const attendanceState = useAttendance();
  const leavesState = useLeaves();
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  if (employeeState.loading)
    return <Loader label="Loading your workspace..." />;
  if (employeeState.error)
    return (
      <ErrorMessage
        message={employeeState.error}
        onRetry={employeeState.reload}
      />
    );

  return (
    <>
      <EmployeeHeader />
      <main className="employee-dashboard">
        <div className="dashboard-heading">
          <div>
            <p className="dashboard-kicker">Employee workspace</p>
            <h1>
              {greeting},{" "}
              {employeeState.employee?.name?.split(" ")[0] ||
                sessionEmployee?.name?.split(" ")[0] ||
                "there"}
            </h1>
            <p>Here is your attendance and leave overview.</p>
          </div>
          <time>
            {new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
              new Date(),
            )}
          </time>
        </div>
        <EmployeeProfile
          employee={employeeState.employee || sessionEmployee}
          compact
        />
        <AttendanceCard
          attendance={attendanceState.todayAttendance}
          onClockIn={attendanceState.clockIn}
          onClockOut={attendanceState.clockOut}
        />
        <AttendanceSummary attendance={attendanceState.attendance} />
        <div className="dashboard-columns">
          <RecentActivity
            attendance={attendanceState.attendance}
            leaves={leavesState.leaves}
          />
          <div>
            <LeaveBalance balance={employeeState.employee?.leaveBalance || 0} />
            <RecentLeaves leaves={leavesState.leaves} />
          </div>
        </div>
        {attendanceState.error && (
          <p className="dashboard-notice">
            Attendance is temporarily unavailable: {attendanceState.error}
          </p>
        )}
        {leavesState.error && (
          <p className="dashboard-notice">
            Leave data is temporarily unavailable: {leavesState.error}
          </p>
        )}
      </main>
    </>
  );
}

export default EmployeeDashboard;
