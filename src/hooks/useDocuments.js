import { useCallback, useEffect, useState } from "react";
import { deleteDocument, getDocumentTypes, getMyDocuments, normalizeDocumentTypes, uploadDocument } from "../services/documentService";

function listFrom(response) {
  const value = response?.data || response?.documents || response?.types || response || [];
  return Array.isArray(value) ? value : [];
}

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [documentResponse, typeResponse] = await Promise.all([getMyDocuments(), getDocumentTypes()]);
      setDocuments(listFrom(documentResponse)); setTypes(normalizeDocumentTypes(typeResponse));
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const upload = async (file, data) => { await uploadDocument(file, data); await load(); };
  const remove = async (id) => { await deleteDocument(id); await load(); };
  return { documents, types, loading, error, reload: load, upload, remove };
}