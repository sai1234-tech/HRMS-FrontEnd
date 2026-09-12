import { apiRequest } from "./apiClient";

export function getAttendance() {
  return apiRequest("/v1/attendance/my");
}

export function getTodayAttendance() {
  return apiRequest("/v1/attendance/today");
}

export function clockIn() {
  return apiRequest("/v1/attendance/check-in", { method: "POST" });
}

export function clockOut() {
  return apiRequest("/v1/attendance/check-out", { method: "POST" });
}
