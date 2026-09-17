
import { useEffect, useState } from "react";

import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import { getAllEmployees } from "../../services/employeeService";
import { downloadDocument } from "../../services/documentService";
import { useHRDocuments } from "../../hooks/useHRDocuments";

import "../../styles/employee/documents.css";

function employeeName(employee) {
  return (
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    employee.user?.name ||
    employee.email ||
    "Employee"
  );
}

function getEmployeeId(employee) {
  return employee?._id || employee?.id || "";
}

function getDocumentId(document) {
  return document?._id || document?.id || "";
}

function getDocumentType(type) {
  if (!type) return "";

  // Backend currently returns document types as strings.
  if (typeof type === "string") {
    return type;
  }

  return (
    type.name ||
    type.title ||
    type.typeName ||
    type.documentTypeName ||
    type.label ||
    type.documentType ||
    type.code ||
    ""
  );
}

function getDocumentTypeValue(type) {
  if (!type) return "";

  if (typeof type === "string") {
    return type;
  }

  return (
    type._id ||
    type.id ||
    type.value ||
    type.code ||
    getDocumentType(type)
  );
}

function getDocumentName(document) {
  return (
    document?.documentName ||
    document?.originalName ||
    document?.fileName ||
    document?.filename ||
    "Employee document"
  );
}

function getDocumentDescription(document) {
  return (
    document?.requestNote ||
    document?.verificationNotes ||
    document?.description ||
    "No description"
  );
}

function getDocumentStatus(document) {
  return String(document?.status || "pending").toLowerCase();
}

function DocumentManagement() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [form, setForm] = useState({
    type: "",
    description: "",
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const {
    documents,
    types,
    loading,
    error,
    reload,
    request,
    setStatus,
    remove,
  } = useHRDocuments(employeeId);

  /*
   * Load employees
   */
  useEffect(() => {
    let mounted = true;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setActionError("");

        const response = await getAllEmployees();

        const employeeList =
          response?.data ||
          response?.employees ||
          response ||
          [];

        if (mounted) {
          setEmployees(Array.isArray(employeeList) ? employeeList : []);
        }
      } catch (requestError) {
        if (mounted) {
          setActionError(
            requestError?.message || "Failed to load employees.",
          );
        }
      } finally {
        if (mounted) {
          setLoadingEmployees(false);
        }
      }
    };

    loadEmployees();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Selected employee
   */
  const selected = employees.find(
    (employee) => getEmployeeId(employee) === employeeId,
  );

  /*
   * Form change
   */
  const change = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setActionError("");
    setMessage("");
  };

  /*
   * Employee selection
   */
  const changeEmployee = (event) => {
    const id = event.target.value;

    setEmployeeId(id);

    setForm({
      type: "",
      description: "",
    });

    setActionError("");
    setMessage("");
  };

  /*
   * Request document from employee
   *
   * Backend expects:
   * employeeId
   * documentType
   * documentName
   * requestNote
   * isRequired
   *
   * It does NOT currently support:
   * description
   * dueDate
   */
  const requestFile = async (event) => {
    event.preventDefault();

    setActionError("");
    setMessage("");

    if (!employeeId) {
      setActionError("Please select an employee.");
      return;
    }

    if (!form.type) {
      setActionError("Please select a document type.");
      return;
    }

    try {
      setBusy(true);

      await request({
        employeeId,
        documentType: form.type,
        documentName: form.description || form.type,
        requestNote: form.description || "",
        isRequired: true,
      });

      setMessage("Document request sent successfully.");

      setForm({
        type: "",
        description: "",
      });
    } catch (requestError) {
      setActionError(
        requestError?.message || "Failed to send document request.",
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   * Common action wrapper
   */
  const act = async (callback, successMessage) => {
    setActionError("");
    setMessage("");

    try {
      await callback();
      setMessage(successMessage);
    } catch (requestError) {
      setActionError(
        requestError?.message || "Something went wrong.",
      );
    }
  };

  /*
   * Verify / Reject document
   *
   * Backend expects:
   * {
   *   status: "verified" | "rejected",
   *   verificationNotes: "..."
   * }
   */
  const reviewDocument = async (document, status) => {
    const documentId = getDocumentId(document);

    if (!documentId) {
      setActionError("Document ID is missing.");
      return;
    }

    const note = window.prompt(
      status === "verified"
        ? "Verification note (optional):"
        : "Reason for rejecting this document:",
      "",
    );

    // User clicked Cancel
    if (note === null) {
      return;
    }

    // Rejection requires a reason
    if (status === "rejected" && !note.trim()) {
      setActionError("Please provide a reason for rejecting the document.");
      return;
    }

    await act(
      () => setStatus(documentId, status, note.trim()),
      status === "verified"
        ? "Document verified successfully."
        : "Document rejected and returned for correction.",
    );
  };

  /*
   * Delete document
   */
  const deleteEmployeeDocument = async (document) => {
    const documentId = getDocumentId(document);

    if (!documentId) {
      setActionError("Document ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${getDocumentName(document)}"?`,
    );

    if (!confirmed) {
      return;
    }

    await act(
      () => remove(documentId),
      "Document deleted successfully.",
    );
  };

  /*
   * Download document
   */
  const downloadEmployeeDocument = async (document) => {
    const documentId = getDocumentId(document);

    if (!documentId) {
      setActionError("Document ID is missing.");
      return;
    }

    await act(
      () =>
        downloadDocument(
          documentId,
          document.originalName ||
            document.fileName ||
            document.documentName ||
            "document",
        ),
      "Download started.",
    );
  };

  return (
    <>
      <EmployeeHeader />

      <main className="employee-page documents-page">
        {/* =========================
            PAGE HEADER
        ========================== */}
        <header className="documents-heading">
          <div>
            <p className="page-kicker">People operations</p>

            <h1>Document management</h1>

            <p>
              Request, verify, and maintain employee compliance documents.
            </p>
          </div>

          <label className="employee-picker">
            Employee

            <select
              value={employeeId}
              onChange={changeEmployee}
              disabled={loadingEmployees}
            >
              <option value="">
                {loadingEmployees
                  ? "Loading employees..."
                  : "Select employee"}
              </option>

              {employees.map((employee) => {
                const id = getEmployeeId(employee);

                return (
                  <option key={id} value={id}>
                    {employeeName(employee)}
                  </option>
                );
              })}
            </select>
          </label>
        </header>

        {/* =========================
            GLOBAL ERROR
        ========================== */}
        {actionError && (
          <p className="form-error" role="alert">
            {actionError}
          </p>
        )}

        {/* =========================
            SUCCESS MESSAGE
        ========================== */}
        {message && (
          <p className="form-success" role="status">
            {message}
          </p>
        )}

        {/* =========================
            SELECTED EMPLOYEE
        ========================== */}
        {selected && (
          <>
            <section className="document-employee-banner">
              <strong>{employeeName(selected)}</strong>

              <span>
                {selected.employeeCode || "No code"} ·{" "}
                {selected.email || "No email"}
              </span>
            </section>

            {/* =========================
                REQUEST DOCUMENT
            ========================== */}
            <section className="panel document-upload-panel">
              <div className="section-heading">
                <h2>Request a document</h2>

                <p>
                  Send a document requirement to{" "}
                  {employeeName(selected)}.
                </p>
              </div>

              <form
                className="document-form"
                onSubmit={requestFile}
              >
                {/* DOCUMENT TYPE */}
                <label>
                  Document type

                  <select
                    name="type"
                    value={form.type}
                    onChange={change}
                    required
                  >
                    <option value="">
                      Select type
                    </option>

                    {types.map((type, index) => {
                      const value = getDocumentTypeValue(type);
                      const label = getDocumentType(type);

                      return (
                        <option
                          key={`${value}-${index}`}
                          value={value}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {/* DESCRIPTION / REQUEST NOTE */}
                <label>
                  Description

                  <input
                    name="description"
                    value={form.description}
                    onChange={change}
                    placeholder="Why is this document required?"
                    maxLength={500}
                  />
                </label>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={busy || !employeeId || !form.type}
                >
                  {busy
                    ? "Sending..."
                    : "Request document"}
                </button>
              </form>
            </section>

            {/* =========================
                DOCUMENT LIST
            ========================== */}
            {loading ? (
              <Loader />
            ) : error ? (
              <ErrorMessage
                message={error}
                onRetry={reload}
              />
            ) : (
              <section className="panel document-list-panel">
                <div className="section-heading">
                  <h2>Employee documents</h2>

                  <p>
                    {documents.length} record
                    {documents.length === 1 ? "" : "s"}{" "}
                    for the selected employee.
                  </p>
                </div>

                <div className="document-list">
                  {documents.length ? (
                    documents.map((document) => {
                      const documentId =
                        getDocumentId(document);

                      const status =
                        getDocumentStatus(document);

                      const canReview =
                        status === "pending";

                      return (
                        <article
                          className="document-row"
                          key={documentId}
                        >
                          {/* DOCUMENT ICON */}
                          <div className="document-icon">
                            DOC
                          </div>

                          {/* DOCUMENT INFORMATION */}
                          <div className="document-main">
                            <strong>
                              {getDocumentType(
                                document.documentType,
                              ) ||
                                document.type ||
                                document.name ||
                                "Employee document"}
                            </strong>

                            <span>
                              {getDocumentName(document)}
                            </span>

                            <small>
                              {getDocumentDescription(
                                document,
                              )}
                            </small>

                            {document.verificationNotes && (
                              <small>
                                Verification note:{" "}
                                {document.verificationNotes}
                              </small>
                            )}
                          </div>

                          {/* STATUS */}
                          <span
                            className={`document-status ${status}`}
                          >
                            {status}
                          </span>

                          {/* ACTIONS */}
                          <div className="document-actions">
                            {/* VERIFY / REJECT
                                Only pending documents */}
                            {canReview && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    reviewDocument(
                                      document,
                                      "verified",
                                    )
                                  }
                                >
                                  Verify
                                </button>

                                <button
                                  type="button"
                                  className="quiet-action"
                                  onClick={() =>
                                    reviewDocument(
                                      document,
                                      "rejected",
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {/* DOWNLOAD */}
                            <button
                              type="button"
                              onClick={() =>
                                downloadEmployeeDocument(
                                  document,
                                )
                              }
                            >
                              Download
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              className="quiet-action"
                              onClick={() =>
                                deleteEmployeeDocument(
                                  document,
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="empty-state">
                      No documents found for this employee.
                    </p>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default DocumentManagement;
