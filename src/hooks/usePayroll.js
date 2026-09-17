import { useCallback, useEffect, useState } from "react";
import { generatePayroll, getPayroll, updateEmployeeSalary, unwrapPayrollData } from "../services/payrollService";

function listData(response) {
  const payload = unwrapPayrollData(response, ["payroll", "records", "items"]);
  if (Array.isArray(payload)) return payload;
  return payload?.payroll || payload?.records || payload?.items || [];
}

export function useHRPayroll(filters) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await getPayroll(filters);
      setRecords(listData(response));
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { load(); }, [load]);
  const generate = async (data) => { await generatePayroll(data); await load(); };
  const updateSalary = async (employeeId, data) => { await updateEmployeeSalary(employeeId, data); await load(); };
  return { records, loading, error, reload: load, generate, updateSalary };
}