import { useCallback, useEffect, useState } from "react";
import { applyForLeave, cancelLeave, getLeaveBalance, getLeaveTypes, getLeaves } from "../services/leaveService";

export function useLeaves() {
	const [leaves, setLeaves] = useState([]);
	const [leaveTypes, setLeaveTypes] = useState([]);
	const [balance, setBalance] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const loadLeaves = useCallback(async () => {
		setLoading(true); setError("");
		try {
			const [response, typesResponse, balanceResponse] = await Promise.all([getLeaves(), getLeaveTypes(), getLeaveBalance()]);
			const records = response.leaves || response.records || response.data || [];
			const types = typesResponse.leaveTypes || typesResponse.types || typesResponse.data || [];
			const balanceRecords = balanceResponse.data || balanceResponse.balance || [];
			setLeaves(Array.isArray(records) ? records : [records]);
			setLeaveTypes(Array.isArray(types) ? types : [types]);
			setBalance(Array.isArray(balanceRecords) ? balanceRecords : [balanceRecords]);
		}
		catch (requestError) { setError(requestError.message); }
		finally { setLoading(false); }
	}, []);
	useEffect(() => { loadLeaves(); }, [loadLeaves]);
	const submitLeave = async (data) => { await applyForLeave(data); await loadLeaves(); };
	const cancel = async (leaveId) => { await cancelLeave(leaveId); await loadLeaves(); };
	return { leaves, leaveTypes, balance, loading, error, reload: loadLeaves, submitLeave, cancel };
}
