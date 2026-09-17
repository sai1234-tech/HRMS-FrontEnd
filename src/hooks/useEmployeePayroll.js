import { useCallback, useEffect, useState } from "react";
import { getMyPayslip, getMySalary, normalizePayslip, unwrapPayrollData } from "../services/payrollService";

export function useEmployeePayroll(month, year) {
  const [salary, setSalary] = useState(null);
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [salaryResult, payslipResult] = await Promise.allSettled([getMySalary(month, year), getMyPayslip(month, year)]);
      if (salaryResult.status === "rejected") throw salaryResult.reason;
      setSalary(unwrapPayrollData(salaryResult.value, ["salary"]));
      if (payslipResult.status === "fulfilled") setPayslip(normalizePayslip(payslipResult.value));
      else if ([401, 403].includes(payslipResult.reason?.status)) throw payslipResult.reason;
      else setPayslip(null);
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }, [month, year]);
  useEffect(() => { load(); }, [load]);
  return { salary, payslip, loading, error, reload: load };
}