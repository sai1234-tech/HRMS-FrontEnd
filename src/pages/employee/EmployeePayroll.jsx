import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import EmployeeHeader from "../../components/employee/EmployeeHeader";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import { useEmployeePayroll } from "../../hooks/useEmployeePayroll";
import { downloadRenderedPayslip } from "../../services/payrollService";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../utils/auth";

import "../../styles/employee/payroll.css";

const current = new Date();

const initialPeriod = `${current.getFullYear()}-${String(
  current.getMonth() + 1
).padStart(2, "0")}`;

const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const valueOf = (object, keys) =>
  keys.reduce(
    (value, key) => value ?? object?.[key],
    undefined
  );

const amount = (value) =>
  Number(
    value && typeof value === "object"
      ? value.amount || value.value || 0
      : value || 0
  );

const formatPeriod = (period) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${period}-01T00:00:00`));


function EmployeePayrollContent({ user, employee }) {
  const [period, setPeriod] = useState(initialPeriod);
  const [activeTab, setActiveTab] = useState("salary");
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState("");
  const payslipRef = useRef(null);

  const [year, month] = period.split("-");

  const {
    salary,
    payslip,
    loading,
    error,
    reload,
  } = useEmployeePayroll(
    Number(month),
    Number(year)
  );

  // =========================================================
  // SALARY
  // =========================================================

  const salarySource =
    salary ||
    employee?.salary ||
    employee?.compensation ||
    user?.salary ||
    user?.compensation ||
    {};

  const salaryRecord =
    salary?.salary &&
    typeof salary.salary === "object"
      ? salary.salary
      : salary?.compensation || salarySource;

  const numericSalary =
    typeof salary === "number"
      ? salary
      : typeof salary?.salary === "number"
        ? salary.salary
        : typeof salaryRecord === "number"
          ? salaryRecord
          : 0;

  const annual = Number(
    valueOf(salaryRecord, [
      "annualSalary",
      "annual",
      "yearlySalary",
      "grossAnnualSalary",
    ]) ||
      numericSalary ||
      0
  );

  const base = Number(
    valueOf(salaryRecord, [
      "baseSalary",
      "basicSalary",
      "salary",
      "monthlySalary",
      "monthly",
    ]) || 0
  );

  const monthly = Number(
    valueOf(salaryRecord, [
      "monthlySalary",
      "monthly",
      "monthlyBaseSalary",
    ]) ??
      (annual ? annual / 12 : base)
  );

  // =========================================================
  // PAYSLIP
  // =========================================================

  const netPay = Number(valueOf(payslip, ["netSalary", "netPay", "netAmount"]) || 0);

  const currency = "INR";

  const earnings =
    payslip?.earnings ||
    payslip?.income ||
    {};

  const deductions =
    payslip?.deductions ||
    {};

  const grossPay = Number(valueOf(payslip, ["grossSalary", "grossPay"]) || earnings.total || monthly);

  const totalDeductions = Number(
    valueOf(payslip, [
      "totalDeductions",
      "deductionsTotal",
      "deduction",
    ]) ||
      deductions.total ||
      Math.max(grossPay - netPay, 0)
  );

  // =========================================================
  // EMPLOYEE
  // =========================================================

  const profile =
    payslip?.employee ||
    employee ||
    user ||
    {};

  const employeeName =
    profile.name ||
    `${profile.firstName || ""} ${
      profile.lastName || ""
    }`.trim() ||
    "Employee";

  const employeeCode =
    profile.employeeCode ||
    profile.employeeId ||
    "Not assigned";

  const employeeEmail =
    profile.email ||
    user?.email ||
    "Not provided";

  const department =
    profile.employment?.department ||
    profile.department ||
    "Not assigned";

  const designation =
    profile.employment?.designation ||
    profile.designation ||
    profile.jobTitle ||
    "Not assigned";

  const dateOfJoining =
    profile.dateOfJoining
      ? new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
        }).format(new Date(profile.dateOfJoining))
      : "N/A";

  // =========================================================
  // PAYSLIP VALUES
  // =========================================================

  const basicSalary = amount(
    valueOf(payslip, [
      "basicSalary",
      "basic",
      "baseSalary",
    ]) ||
      valueOf(earnings, [
        "basicSalary",
        "basic",
        "baseSalary",
      ]) ||
      base ||
      monthly
  );

  const allowances = amount(
    valueOf(payslip, [
      "allowances",
      "allowance",
      "totalAllowances",
    ]) ||
      valueOf(earnings, [
        "allowances",
        "allowance",
        "totalAllowances",
      ])
  );

  const bonus = amount(
    valueOf(payslip, [
      "bonus",
      "bonusAmount",
    ]) ||
      valueOf(earnings, [
        "bonus",
        "bonusAmount",
      ])
  );

  const tax = amount(
    valueOf(payslip, [
      "tax",
      "incomeTax",
      "taxDeduction",
    ]) ||
      valueOf(deductions, [
        "tax",
        "incomeTax",
        "taxDeduction",
      ])
  );

  const pf = amount(
    valueOf(payslip, [
      "pf",
      "providentFund",
      "pfDeduction",
    ]) ||
      valueOf(deductions, [
        "pf",
        "providentFund",
        "pfDeduction",
      ])
  );

  const otherDeductions = Number(valueOf(payslip, ["otherDeductions", "deduction"]) || Math.max(totalDeductions - tax - pf, 0));

  const generatedStatus = payslip?.status || "Generated";
  const generatedAt = payslip?.generatedAt
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(payslip.generatedAt))
    : "Not available";

  // =========================================================
  // DOWNLOAD
  // =========================================================

  const handleDownload = async () => {
    setDownloading(true);
    setActionError("");

    try {
      await downloadRenderedPayslip(payslipRef.current, period);
    } catch (requestError) {
      setActionError(
        requestError?.message ||
          `Payslip download failed for ${formatPeriod(
            period
          )}.`
      );
    } finally {
      setDownloading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <EmployeeHeader />

      <main className="employee-page payroll-page">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <header className="payroll-heading">
          <div>
            <p className="page-kicker">
              Compensation
            </p>

            <h1>My Payroll</h1>

            <p>
              Review your annual salary, fixed base pay,
              and monthly payslip.
            </p>
          </div>

          <label className="pay-period-control">
            <span>Pay Period</span>

            <input
              type="month"
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value)
              }
            />
          </label>
        </header>


        {/* =====================================================
            LOADING / ERROR
        ===================================================== */}

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={reload}
          />
        ) : (
          <>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section
              className="payroll-summary"
              aria-label="Payroll summary"
            >

              <div className="payroll-hero">
                <span>
                  Estimated Monthly Pay
                </span>

                <strong>
                  {money(monthly, currency)}
                </strong>

                <small>
                  Regular monthly base
                </small>
              </div>


              <div className="payroll-stat">
                <span>
                  Annual Salary
                </span>

                <strong>
                  {money(annual, currency)}
                </strong>

                <small>
                  Yearly compensation
                </small>
              </div>


              <div
                className={`payroll-stat ${
                  payslip
                    ? ""
                    : "payroll-stat-pending"
                }`}
              >
                <span>
                  Net Pay
                </span>

                <strong>
                  {payslip
                    ? money(netPay, currency)
                    : "Not generated"}
                </strong>

                <small>
                  {payslip
                    ? formatPeriod(period)
                    : "Awaiting payroll run"}
                </small>
              </div>

            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {actionError && (
              <p
                className="form-error"
                role="alert"
              >
                {actionError}
              </p>
            )}


            {/* =================================================
                PAYROLL TABS
            ================================================= */}

            <section
              className="payroll-tabs"
              aria-label="Payroll details"
            >

              <div
                className="payroll-tab-list"
                role="tablist"
              >

                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    activeTab === "salary"
                  }
                  className={
                    activeTab === "salary"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("salary")
                  }
                >
                  Salary Profile
                </button>


                <button
                  type="button"
                  role="tab"
                  aria-selected={
                    activeTab === "statement"
                  }
                  className={
                    activeTab === "statement"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("statement")
                  }
                >
                  Monthly Statement
                </button>

              </div>


              {/* =================================================
                  SALARY PROFILE
              ================================================= */}

              {activeTab === "salary" ? (

                <article
                  className="payroll-tab-panel"
                  role="tabpanel"
                >

                  <div className="payroll-panel-heading">

                    <div>
                      <p className="page-kicker">
                        Salary Profile
                      </p>

                      <h2>
                        Compensation Overview
                      </h2>

                      <p className="salary-definition">
                        Annual salary is the full yearly
                        amount. Base salary is the fixed
                        regular pay before variable earnings
                        and deductions.
                      </p>
                    </div>

                    <span className="payroll-badge">
                      {currency}
                    </span>

                  </div>


                  <dl className="payroll-details">

                    <div>
                      <dt>
                        Annual Salary
                        <small>
                          Yearly compensation
                        </small>
                      </dt>

                      <dd>
                        {money(
                          annual,
                          currency
                        )}
                      </dd>
                    </div>


                    <div>
                      <dt>
                        Monthly Salary
                        <small>
                          Annual salary divided by 12
                        </small>
                      </dt>

                      <dd>
                        {money(
                          monthly,
                          currency
                        )}
                      </dd>
                    </div>


                    <div>
                      <dt>
                        Base Salary
                        <small>
                          Fixed regular pay
                        </small>
                      </dt>

                      <dd>
                        {money(
                          base || monthly,
                          currency
                        )}
                      </dd>
                    </div>


                    <div>
                      <dt>
                        Pay Frequency
                      </dt>

                      <dd>
                        {salaryRecord.payFrequency ||
                          "Monthly"}
                      </dd>
                    </div>


                    <div>
                      <dt>
                        Effective From
                      </dt>

                      <dd>
                        {salaryRecord.effectiveDate
                          ? new Intl.DateTimeFormat(
                              "en-IN",
                              {
                                dateStyle:
                                  "medium",
                              }
                            ).format(
                              new Date(
                                salaryRecord.effectiveDate
                              )
                            )
                          : "Current record"}
                      </dd>
                    </div>


                    <div>
                      <dt>
                        Payment Method
                      </dt>

                      <dd>
                        {salaryRecord.paymentMethod ||
                          "Payroll deposit"}
                      </dd>
                    </div>

                  </dl>

                </article>

              ) : (

                /* =================================================
                   MONTHLY STATEMENT / PAYSLIP
                ================================================= */

                <article
                  className="payroll-tab-panel"
                  role="tabpanel"
                >

                  <div className="payroll-panel-heading">

                    <div>
                      <p className="page-kicker">
                        Monthly Statement
                      </p>

                      <h2>
                        {payslip
                          ? `Payslip · ${formatPeriod(
                              period
                            )}`
                          : "Payslip Unavailable"}
                      </h2>
                    </div>


                    <div className="payroll-panel-actions">

                      <button
                        type="button"
                        onClick={reload}
                      >
                        Refresh Payslip
                      </button>

                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={
                          downloading ||
                          !payslip
                        }
                      >
                        {downloading
                          ? "Preparing..."
                          : "Download PDF"}
                      </button>

                    </div>

                  </div>


                  {payslip ? (

                    <div className="payslip-document" ref={payslipRef}>

                      {/* =========================================
                          COMPANY HEADER
                      ========================================== */}

                      <div className="payslip-header">

                        <div>
                          <h2>
                            Quadratics Inc
                          </h2>

                          <p>
                            Employee Payslip
                          </p>
                        </div>


                        <div className="payslip-generated">

                          <span>
                            PAYSLIP
                          </span>

                          <strong>
                            {formatPeriod(period)}
                          </strong>

                        </div>

                      </div>


                      {/* =========================================
                          EMPLOYEE INFORMATION
                      ========================================== */}

                      <div className="payslip-info-grid">

                        <div className="payslip-info-item">
                          <span>
                            Employee Name
                          </span>

                          <strong>
                            {employeeName}
                          </strong>
                        </div>


                        <div className="payslip-info-item">
                          <span>
                            Employee ID
                          </span>

                          <strong>
                            {employeeCode}
                          </strong>
                        </div>


                        <div className="payslip-info-item">
                          <span>
                            Email
                          </span>

                          <strong>
                            {employeeEmail}
                          </strong>
                        </div>


                        <div className="payslip-info-item">
                          <span>
                            Department
                          </span>

                          <strong>
                            {department}
                          </strong>
                        </div>


                        <div className="payslip-info-item">
                          <span>
                            Designation
                          </span>

                          <strong>
                            {designation}
                          </strong>
                        </div>


                        <div className="payslip-info-item">
                          <span>
                            Date of Joining
                          </span>

                          <strong>
                            {dateOfJoining}
                          </strong>
                        </div>


                        <div className="payslip-info-item">
                          <span>
                            Pay Period
                          </span>

                          <strong>
                            {formatPeriod(period)}
                          </strong>
                        </div>

                      </div>


                      {/* =========================================
                          EARNINGS + DEDUCTIONS
                      ========================================== */}

                      <div className="payslip-table-grid">


                        {/* ================= EARNINGS ================= */}

                        <div className="payslip-table-wrapper">

                          <h3>
                            Earnings
                          </h3>

                          <table className="payslip-table">

                            <thead>
                              <tr>
                                <th>
                                  Description
                                </th>

                                <th>
                                  Amount
                                </th>
                              </tr>
                            </thead>


                            <tbody>

                              <tr>
                                <td>
                                  Basic Salary
                                </td>

                                <td>
                                  {money(
                                    basicSalary,
                                    currency
                                  )}
                                </td>
                              </tr>


                              <tr>
                                <td>
                                  Allowances
                                </td>

                                <td>
                                  {money(
                                    allowances,
                                    currency
                                  )}
                                </td>
                              </tr>


                              <tr>
                                <td>
                                  Bonus
                                </td>

                                <td>
                                  {money(
                                    bonus,
                                    currency
                                  )}
                                </td>
                              </tr>

                            </tbody>


                            <tfoot>
                              <tr>
                                <th>
                                  Total Earnings
                                </th>

                                <th>
                                  {money(
                                    grossPay,
                                    currency
                                  )}
                                </th>
                              </tr>
                            </tfoot>

                          </table>

                        </div>


                        {/* ================= DEDUCTIONS ================= */}

                        <div className="payslip-table-wrapper">

                          <h3>
                            Deductions
                          </h3>

                          <table className="payslip-table">

                            <thead>
                              <tr>
                                <th>
                                  Description
                                </th>

                                <th>
                                  Amount
                                </th>
                              </tr>
                            </thead>


                            <tbody>

                              <tr>
                                <td>
                                  Provident Fund
                                </td>

                                <td className="deduction">
                                  -{money(
                                    pf,
                                    currency
                                  )}
                                </td>
                              </tr>


                              <tr>
                                <td>
                                  Professional Tax
                                </td>

                                <td className="deduction">
                                  -{money(
                                    tax,
                                    currency
                                  )}
                                </td>
                              </tr>


                              <tr>
                                <td>
                                  Other Deductions
                                </td>

                                <td className="deduction">
                                  -{money(
                                    otherDeductions,
                                    currency
                                  )}
                                </td>
                              </tr>

                            </tbody>


                            <tfoot>
                              <tr>
                                <th>
                                  Total Deductions
                                </th>

                                <th className="deduction">
                                  -{money(
                                    totalDeductions,
                                    currency
                                  )}
                                </th>
                              </tr>
                            </tfoot>

                          </table>

                        </div>

                      </div>


                      {/* =========================================
                          SALARY SUMMARY
                      ========================================== */}

                      <div className="payslip-net-pay">

                        <div>
                          <span>
                            Total Earnings
                          </span>

                          <strong>
                            {money(
                              grossPay,
                              currency
                            )}
                          </strong>
                        </div>


                        <div>
                          <span>
                            Total Deductions
                          </span>

                          <strong className="deduction">
                            -{money(
                              totalDeductions,
                              currency
                            )}
                          </strong>
                        </div>


                        <div className="net-pay-highlight">

                          <span>
                            Net Pay
                          </span>

                          <strong>
                            {money(
                              netPay,
                              currency
                            )}
                          </strong>

                        </div>

                      </div>


                      {/* =========================================
                          STATUS
                      ========================================== */}

                      <div className="payslip-status-row">

                        <span>
                          Payroll Status
                        </span>

                        <strong className="payroll-status generated">
                          {generatedStatus}
                        </strong>

                        <span>
                          Generated at
                        </span>

                        <strong>
                          {generatedAt}
                        </strong>

                      </div>


                      {/* =========================================
                          SIGNATURES
                      ========================================== */}

                      <div className="payslip-signatures">

                        <div>
                          <div className="signature-line"></div>

                          <span>
                            Employer Signature
                          </span>
                        </div>


                        <div>
                          <div className="signature-line"></div>

                          <span>
                            Employee Signature
                          </span>
                        </div>

                      </div>


                      {/* =========================================
                          FOOTER
                      ========================================== */}

                      <div className="payslip-footer">
                        This is a system generated
                        payslip and does not require
                        a physical signature.
                      </div>

                    </div>

                  ) : (

                    <p className="empty-state">
                      Your payslip will appear here after
                      HR generates payroll for{" "}
                      {formatPeriod(period)}.
                      Select Refresh Payslip after HR
                      completes the payroll run.
                    </p>

                  )}

                </article>

              )}

            </section>

          </>
        )}

      </main>
    </>
  );
}


/* =========================================================
   ROLE PROTECTION
========================================================= */

function EmployeePayroll() {
  const { user, employee } = useAuth();

  return ["employee", "hr"].includes(
    normalizeRole(user)
  ) ? (
    <EmployeePayrollContent
      user={user}
      employee={employee}
    />
  ) : (
    <Navigate
      to="/hr/payroll"
      replace
    />
  );
}

export default EmployeePayroll;