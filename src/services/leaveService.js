import { apiRequest } from "./apiClient";

export function getLeaves() {
  return apiRequest("/v1/leaves/my");
}

export function getLeaveBalance() {
  return apiRequest("/v1/leaves/balance");
}

export function cancelLeave(leaveId) {
  return apiRequest(`/v1/leaves/${leaveId}/cancel`, { method: "PATCH" });
}

export function getLeaveTypes() {
  return apiRequest("/v1/leaves/types");
}

export function applyForLeave(data) {
  return apiRequest("/v1/leaves/apply", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
