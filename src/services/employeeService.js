import { apiRequest } from "./apiClient";

export function getEmployee() {
  return apiRequest("/auth/me");
}

export function updateEmployee(data) {
  return apiRequest("/employee/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getAllEmployees(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/employees${query}`);
}

export function createEmployees(employees) {
  return apiRequest("/employees", {
    method: "POST",
    body: JSON.stringify(employees),
  });
}

export function updateEmployeeById(id, employee) {
  return apiRequest(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
}

export function deleteEmployeeById(id) {
  return apiRequest(`/employees/${id}`, { method: "DELETE" });
}

export function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append("profilePicture", file);

  return apiRequest("/employee/me/profile-picture", {
    method: "POST",
    body: formData,
  });
}