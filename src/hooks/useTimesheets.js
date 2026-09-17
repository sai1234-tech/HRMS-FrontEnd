import { useCallback, useEffect, useState } from "react";
import { createTimesheet, deleteTimesheet, getMyWeek, submitTimesheet, submitWeek, updateTimesheet } from "../services/timesheetService";

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

  const loadWeek = useCallback(async (date) => {
    setLoading(true);
    setError("");
    setActiveDate(date || "");
    try {
      setTimesheetWeek(normalizeWeek(await getMyWeek(date)));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWeek(); }, [loadWeek]);

  const performAction = async (action) => {
    await action();
    await loadWeek(activeDate);
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