import { apiRequest } from "./apiClient";

export function getEmployees(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/../employees${query}`);
}

export function getAllAttendance() {
  return apiRequest("/v1/attendance/all");
}

export function getMonthlyAttendanceReport(year, month) {
  return apiRequest(`/v1/attendance/monthly?year=${year}&month=${month}`);
}

export function getAttendanceSummary() {
  return apiRequest("/v1/attendance/summary");
}

export function getAllLeaves() {
  return apiRequest("/v1/leaves/all");
}

export function getLeaveTypes() {
  return apiRequest("/v1/leaves/types");
}

export function approveLeave(leaveId) {
  return apiRequest(`/v1/leaves/${leaveId}/approve`, { method: "PATCH" });
}

export function rejectLeave(leaveId, rejectionReason) {
  return apiRequest(`/v1/leaves/${leaveId}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason }) });
}

export function revertLeave(leaveId) {
  return apiRequest(`/v1/leaves/${leaveId}/revert`, { method: "PATCH" });
}
