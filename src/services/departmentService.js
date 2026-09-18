import { apiRequest } from "./apiClient";

export function getDepartments(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/departments${query}`);
}

export function createDepartments(departments) {
  return apiRequest("/departments", {
    method: "POST",
    body: JSON.stringify(departments),
  });
}

export function updateDepartment(id, department) {
  return apiRequest(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(department),
  });
}

export function deleteDepartment(id) {
  return apiRequest(`/departments/${id}`, { method: "DELETE" });
}
