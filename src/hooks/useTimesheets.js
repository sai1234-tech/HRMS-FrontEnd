import { useCallback, useEffect, useState } from "react";
import {
  createTimesheet,
  deleteTimesheet,
  getMyWeek,
  submitTimesheet,
  submitWeek,
  updateTimesheet,
} from "../services/timesheetService";
import { useSyncRefresh } from "../utils/syncManager";

function normalizeWeek(response) {
  const data = response?.data || response || {};
  return {
    entries: Array.isArray(data.entries) ? data.entries : [],
    totalHours: Number(data.totalHours || 0),
    statusCounts: data.statusCounts || {},
    week: data.week || {},
  };
}

export function useTimesheets() {
  const [timesheetWeek, setTimesheetWeek] = useState(() => normalizeWeek({}));
  const [activeDate, setActiveDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWeek = useCallback(async (date, silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    const targetDate = date !== undefined ? date : activeDate;
    if (date !== undefined) setActiveDate(date || "");

    try {
      setTimesheetWeek(normalizeWeek(await getMyWeek(targetDate)));
    } catch (requestError) {
      if (!silent) setError(requestError.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeDate]);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  useSyncRefresh(() => loadWeek(activeDate, true), { interval: 4000, silent: true });

  const performAction = async (action) => {
    await action();
    await loadWeek(activeDate, true);
  };

  return {
    ...timesheetWeek,
    loading,
    error,
    reload: loadWeek,
    create: (data) => performAction(() => createTimesheet(data)),
    update: (id, data) => performAction(() => updateTimesheet(id, data)),
    remove: (id) => performAction(() => deleteTimesheet(id)),
    submit: (id) => performAction(() => submitTimesheet(id)),
    submitAll: (date) => performAction(() => submitWeek(date)),
  };
}