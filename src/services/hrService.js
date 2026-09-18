import { apiRequest } from "./apiClient";

export function getEmployees(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/employees${query}`);
}

export function getAllAttendance() {
  return apiRequest("/attendance/all");
}

export function getMonthlyAttendanceReport(year, month) {
  return apiRequest(`/attendance/monthly?year=${year}&month=${month}`);
}

export function getAttendanceSummary() {
  return apiRequest("/attendance/summary");
}

export function getAllLeaves() {
  return apiRequest("/leaves/all");
}

export function getLeaveTypes() {
  return apiRequest("/leaves/types");
}

export function approveLeave(leaveId) {
  return apiRequest(`/leaves/${leaveId}/approve`, { method: "PATCH" });
}

export function rejectLeave(leaveId, rejectionReason) {
  return apiRequest(`/leaves/${leaveId}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason }) });
}

export function revertLeave(leaveId) {
  return apiRequest(`/leaves/${leaveId}/revert`, { method: "PATCH" });
}
