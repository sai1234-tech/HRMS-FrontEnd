import { apiRequest } from "./apiClient";

export function getDocumentTypes() {
  return apiRequest("/v1/documents/types");
}

export function normalizeDocumentTypes(response) {
  let value = response?.data ?? response;

  // Backend response:
  // { success: true, data: [...] }
  if (value?.data) {
    value = value.data;
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((type, index) => {
    // Current backend returns strings:
    // "Aadhaar / ID Proof", "PAN", etc.
    if (typeof type === "string") {
      return {
        id: type,
        label: type,
      };
    }

    // Keep compatibility if backend later returns objects
    return {
      ...type,
      id:
        type._id ||
        type.id ||
        type.value ||
        type.code ||
        String(index),
      label:
        type.name ||
        type.title ||
        type.typeName ||
        type.documentTypeName ||
        type.label ||
        type.documentType ||
        type.code ||
        `Document type ${index + 1}`,
    };
  });
}

export function getMyDocuments() {
  return apiRequest("/v1/documents/my");
}

export function uploadDocument(file, data = {}) {
  const body = new FormData();

  // IMPORTANT:
  // Backend uses upload.single("document")
  body.append("document", file);

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      body.append(key, value);
    }
  });

  return apiRequest("/v1/documents/upload", {
    method: "POST",
    body,
  });
}

export function getEmployeeDocuments(employeeId) {
  return apiRequest(`/v1/documents/employee/${employeeId}`);
}

export function requestDocument(data) {
  return apiRequest("/v1/documents/request", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getDocument(documentId) {
  return apiRequest(`/v1/documents/${documentId}`);
}

export async function downloadDocument(
  documentId,
  filename = "document",
) {
  const token = sessionStorage.getItem("hrms_token");

  const apiUrl = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api"
  ).replace(/\/$/, "");

  const response = await fetch(
    `${apiUrl}/v1/documents/${documentId}/download`,
    {
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.message ||
        `Document download failed (${response.status})`,
    );
  }

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function updateDocumentStatus(
  documentId,
  status,
  verificationNotes = "",
) {
  return apiRequest(`/v1/documents/${documentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      verificationNotes,
    }),
  });
}

export function deleteDocument(documentId) {
  return apiRequest(`/v1/documents/${documentId}`, {
    method: "DELETE",
  });
}