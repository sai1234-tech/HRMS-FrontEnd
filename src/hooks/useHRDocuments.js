import { useCallback, useEffect, useState } from "react";
import {
  deleteDocument,
  getDocumentTypes,
  getEmployeeDocuments,
  normalizeDocumentTypes,
  requestDocument,
  updateDocumentStatus,
} from "../services/documentService";

function listFrom(response) {
  const value =
    response?.data || response?.documents || response?.types || response || [];
  return Array.isArray(value) ? value : [];
}

export function useHRDocuments(employeeId) {
  const [documents, setDocuments] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!employeeId) {
      setDocuments([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [documentResponse, typeResponse] = await Promise.all([
        getEmployeeDocuments(employeeId),
        getDocumentTypes(),
      ]);
      setDocuments(listFrom(documentResponse));
      setTypes(normalizeDocumentTypes(typeResponse));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);
  useEffect(() => {
    load();
  }, [load]);
  const request = async (data) => {
    await requestDocument(data);
    await load();
  };
  const setStatus = async (id, status, verificationNotes = "") => {
    await updateDocumentStatus(id, status, verificationNotes);
    await load();
  };
  const remove = async (id) => {
    await deleteDocument(id);
    await load();
  };
  return {
    documents,
    types,
    loading,
    error,
    reload: load,
    request,
    setStatus,
    remove,
  };
}
