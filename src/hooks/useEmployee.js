import { useCallback, useEffect, useState } from "react";
import { getEmployee } from "../services/employeeService";

export function useEmployee() {
	const [employee, setEmployee] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const loadEmployee = useCallback(async () => {
		setLoading(true); setError("");
		try { const response = await getEmployee(); setEmployee(response.employee || response); }
		catch (requestError) { setError(requestError.message); }
		finally { setLoading(false); }
	}, []);
	useEffect(() => { loadEmployee(); }, [loadEmployee]);
	return { employee, loading, error, reload: loadEmployee };
}
