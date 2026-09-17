import { useState } from "react";
import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";
import { downloadDocument } from "../../services/documentService";
import { useDocuments } from "../../hooks/useDocuments";
import "../../styles/employee/documents.css";

function EmployeeDocuments() {
  const { documents, types, loading, error, reload, upload, remove } =
    useDocuments();
  const [form, setForm] = useState({ type: "", description: "", file: null });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.type === "file"
          ? event.target.files[0]
          : event.target.value,
    }));
  const submit = async (event) => {
    event.preventDefault();
    setActionError("");
    setMessage("");
    if (!form.file) {
      setActionError("Choose a document to upload.");
      return;
    }
    try {
      setBusy(true);
      await upload(form.file, {
        documentType: form.type,
        description: form.description,
      });
      setForm({ type: "", description: "", file: null });
      event.target.reset();
      setMessage("Document uploaded successfully.");
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  const act = async (callback, success) => {
    setActionError("");
    try {
      await callback();
      setMessage(success);
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };
  return (
    <>
      <EmployeeHeader />
      <main className="employee-page documents-page">
        <header className="documents-heading">
          <div>
            <p className="page-kicker">Employee records</p>
            <h1>My documents</h1>
            <p>
              Upload and track the documents required for your employment
              record.
            </p>
          </div>
          <button type="button" className="refresh-button" onClick={reload}>
            Refresh
          </button>
        </header>
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : (
          <>
            <section className="panel document-upload-panel">
              <div className="section-heading">
                <h2>Upload document</h2>
                <p>
                  Use PDF, JPG, or PNG files. HR will review uploaded documents.
                </p>
              </div>
              {actionError && (
                <p className="form-error" role="alert">
                  {actionError}
                </p>
              )}
              {message && (
                <p className="form-success" role="status">
                  {message}
                </p>
              )}
              <form className="document-form" onSubmit={submit}>
                <label>
                  Document type
                  <select name="type" value={form.type} onChange={change} required>
                    <option value="">Select type</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Description
                  <input
                    name="description"
                    value={form.description}
                    onChange={change}
                    placeholder="Optional note"
                  />
                </label>
                <label className="file-field">
                  File
                  <input
                    name="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={change}
                  />
                </label>
                <button type="submit" disabled={busy}>
                  {busy ? "Uploading..." : "Upload document"}
                </button>
              </form>
            </section>
            <section className="panel document-list-panel">
              <div className="section-heading">
                <h2>Document history</h2>
                <p>
                  {documents.length} document{documents.length === 1 ? "" : "s"}{" "}
                  on your record.
                </p>
              </div>
              <div className="document-list">
                {documents.length ? (
                  documents.map((document) => (
                    <article
                      className="document-row"
                      key={document._id || document.id}
                    >
                      <div className="document-icon">DOC</div>
                      <div className="document-main">
                        <strong>
                          {document.documentType?.name ||
                            document.documentType?.title ||
                            document.type ||
                            document.name ||
                            "Employee document"}
                        </strong>
                        <span>
                          {document.originalName ||
                            document.fileName ||
                            document.filename ||
                            "Uploaded file"}
                        </span>
                        <small>
                          {document.description || "No description"}
                        </small>
                      </div>
                      <span
                        className={`document-status ${String(document.status || "pending").toLowerCase()}`}
                      >
                        {document.status || "Pending"}
                      </span>
                      <div className="document-actions">
                        <button
                          type="button"
                          onClick={() =>
                            act(
                              () =>
                                downloadDocument(
                                  document._id || document.id,
                                  document.originalName ||
                                    document.fileName ||
                                    "document",
                                ),
                              "Download started.",
                            )
                          }
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          className="quiet-action"
                          onClick={() =>
                            act(
                              () => remove(document._id || document.id),
                              "Document deleted.",
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="empty-state">No documents uploaded yet.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default EmployeeDocuments;
