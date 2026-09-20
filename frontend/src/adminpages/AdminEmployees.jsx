import { useEffect, useState, useMemo } from "react";
import {
  fetchEmployeesWithStats,
  toggleEmployeeVerify,
  toggleEmployeeActive,
  updateEmployee,
} from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const AdminEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting: field + direction
  const [sortBy, setSortBy] = useState("name"); // name | sales | revenue
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  // Time range for sales data: today | month | all
  const [timeRange, setTimeRange] = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchEmployeesWithStats();
      setEmployees(res.data.employees || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (emp) => {
    const action = emp.isVerified ? "unverify" : "verify";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${emp.name}"?\n\n` +
        (emp.isVerified
          ? "They will no longer be able to add sales."
          : "They will be able to add sales immediately.")
    );
    if (!confirmed) return;

    try {
      const res = await toggleEmployeeVerify(emp._id);
      setEmployees((prev) =>
        prev.map((e) =>
          e._id === emp._id
            ? { ...e, isVerified: res.data.employee.isVerified }
            : e
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleActive = async (emp) => {
    const action = emp.isActive ? "deactivate" : "activate";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${emp.name}"?\n\n` +
        (emp.isActive
          ? "They will be logged out and unable to log in again until reactivated."
          : "They will be able to log in again.")
    );
    if (!confirmed) return;

    try {
      const res = await toggleEmployeeActive(emp._id);
      setEmployees((prev) =>
        prev.map((e) =>
          e._id === emp._id
            ? { ...e, isActive: res.data.employee.isActive }
            : e
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setEditName(emp.name);
    setEditPassword("");
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: editName };
      if (editPassword) payload.password = editPassword;
      await updateEmployee(editing._id, payload);
      setEmployees((prev) =>
        prev.map((e) => (e._id === editing._id ? { ...e, name: editName } : e))
      );
      setEditing(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update");
    }
  };

  // Helper: pick sales/revenue based on selected time range
  // Falls back gracefully if backend doesn't provide these fields yet
  const getSalesForRange = (emp) => {
    if (timeRange === "today") {
      return emp.todaySales ?? emp.totalSales ?? 0;
    }
    if (timeRange === "month") {
      return emp.monthSales ?? emp.totalSales ?? 0;
    }
    return emp.totalSales ?? 0;
  };

  const getRevenueForRange = (emp) => {
    if (timeRange === "today") {
      return emp.todayRevenue ?? emp.totalRevenue ?? 0;
    }
    if (timeRange === "month") {
      return emp.monthRevenue ?? emp.totalRevenue ?? 0;
    }
    return emp.totalRevenue ?? 0;
  };

  // Filter + Sort
  const visibleEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = employees.filter((emp) => {
      if (!q) return true;
      return (
        emp.name?.toLowerCase().includes(q) ||
        emp.username?.toLowerCase().includes(q)
      );
    });

    // Sort
    const dir = sortOrder === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      if (sortBy === "sales") {
        return (getSalesForRange(a) - getSalesForRange(b)) * dir;
      }
      if (sortBy === "revenue") {
        return (getRevenueForRange(a) - getRevenueForRange(b)) * dir;
      }
      return 0;
    });

    return list;
  }, [employees, searchQuery, sortBy, sortOrder, timeRange]);

  // Stats — based on selected time range
  const totalRevenue = employees.reduce(
    (sum, e) => sum + getRevenueForRange(e),
    0
  );
  const totalSales = employees.reduce(
    (sum, e) => sum + getSalesForRange(e),
    0
  );
  const activeCount = employees.filter((e) => e.isActive).length;

  // Human label for time range
  const rangeLabel =
    timeRange === "today"
      ? "Today"
      : timeRange === "month"
      ? "This Month"
      : "All Time";

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

  const sortOptions = [
    { field: "name", label: "Name" },
    { field: "sales", label: "Sales" },
    { field: "revenue", label: "Revenue" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-200/30 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-sky-200/25 blur-[140px]" />
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ===== HEADER ===== */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Employees
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Manage team access, verification & performance
                </p>
              </div>
            </div>
            <button
              onClick={load}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* ===== TIME RANGE SELECTOR ===== */}
          {!loading && !error && employees.length > 0 && (
            <div className="mb-4">
              <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
                {[
                  { key: "today", label: "Today" },
                  { key: "month", label: "This Month" },
                  { key: "all", label: "All Time" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTimeRange(t.key)}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      timeRange === t.key
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== STATS CARDS ===== */}
          {!loading && !error && employees.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: "Total Employees",
                  value: employees.length,
                  bg: "bg-gradient-to-br from-indigo-50 to-violet-50",
                  border: "border-indigo-100",
                  iconBg: "bg-indigo-500",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  label: "Active",
                  value: activeCount,
                  bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
                  border: "border-emerald-100",
                  iconBg: "bg-emerald-500",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  label: `Sales · ${rangeLabel}`,
                  value: totalSales,
                  bg: "bg-gradient-to-br from-amber-50 to-orange-50",
                  border: "border-amber-100",
                  iconBg: "bg-amber-500",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ),
                },
                {
                  label: `Revenue · ${rangeLabel}`,
                  value: formatCurrency(totalRevenue),
                  bg: "bg-gradient-to-br from-violet-50 to-fuchsia-50",
                  border: "border-violet-100",
                  iconBg: "bg-violet-500",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-4 sm:p-5 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/60 duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 truncate">
                        {stat.label}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.iconBg} text-white rounded-xl p-2 shadow-md flex-shrink-0`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== SEARCH & SORT BAR ===== */}
        {!loading && !error && employees.length > 0 && (
          <div className="mb-5 flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Sort controls */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Sort by field */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sort
                </span>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.field}
                    onClick={() => setSortBy(opt.field)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      sortBy === opt.field
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort order — only relevant for numeric fields */}
              {sortBy !== "name" && (
                <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <button
                    onClick={() => setSortOrder("asc")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      sortOrder === "asc"
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Low → High
                  </button>
                  <button
                    onClick={() => setSortOrder("desc")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      sortOrder === "desc"
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    High → Low
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== CONTENT STATES ===== */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Loading employees…</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/70 backdrop-blur-xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 mb-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-rose-600 font-medium">{error}</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No employees yet.</p>
          </div>
        ) : visibleEmployees.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No employees match your search.</p>
          </div>
        ) : (
          <>
            {/* ===== DESKTOP TABLE ===== */}
            <div className="hidden lg:block rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Username
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Sales
                      <span className="ml-1.5 text-[9px] font-medium text-slate-400 normal-case">
                        ({rangeLabel})
                      </span>
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Revenue
                      <span className="ml-1.5 text-[9px] font-medium text-slate-400 normal-case">
                        ({rangeLabel})
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleEmployees.map((e) => (
                    <tr
                      key={e._id}
                      className="group transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md shadow-indigo-500/20">
                            {e.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-semibold text-slate-900">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        @{e.username}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 font-medium">
                        {getSalesForRange(e)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {formatCurrency(getRevenueForRange(e))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              e.isVerified
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                e.isVerified ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {e.isVerified ? "Verified" : "Unverified"}
                          </span>
                          <span
                            className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              e.isActive
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                e.isActive ? "bg-slate-500" : "bg-rose-500"
                              }`}
                            />
                            {e.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleVerify(e)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:scale-105 hover:shadow-sm ${
                              e.isVerified
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {e.isVerified ? "Unverify" : "Verify"}
                          </button>
                          <button
                            onClick={() => handleActive(e)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:scale-105 hover:shadow-sm ${
                              e.isActive
                                ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {e.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => openEdit(e)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all hover:scale-105 hover:shadow-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== MOBILE CARDS ===== */}
            <div className="lg:hidden space-y-3">
              {visibleEmployees.map((e) => (
                <div
                  key={e._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50 transition-all hover:border-slate-300 hover:shadow-xl"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-md shadow-indigo-500/20">
                        {e.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{e.name}</p>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          @{e.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        e.isVerified
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          e.isVerified ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {e.isVerified ? "Verified" : "Unverified"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        e.isActive
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          e.isActive ? "bg-slate-500" : "bg-rose-500"
                        }`}
                      />
                      {e.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                        Sales
                        <span className="ml-1 text-slate-400 font-medium normal-case">
                          · {rangeLabel}
                        </span>
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {getSalesForRange(e)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                        Revenue
                        <span className="ml-1 text-slate-400 font-medium normal-case">
                          · {rangeLabel}
                        </span>
                      </p>
                      <p className="text-lg font-bold text-slate-900 truncate">
                        {formatCurrency(getRevenueForRange(e))}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleVerify(e)}
                      className={`text-xs font-semibold px-2 py-2.5 rounded-xl border transition-all ${
                        e.isVerified
                          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {e.isVerified ? "Unverify" : "Verify"}
                    </button>
                    <button
                      onClick={() => handleActive(e)}
                      className={`text-xs font-semibold px-2 py-2.5 rounded-xl border transition-all ${
                        e.isActive
                          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {e.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => openEdit(e)}
                      className="text-xs font-semibold px-2 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) setEditing(null);
          }}
        >
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300/40 via-violet-300/40 to-purple-300/40 rounded-3xl blur-xl opacity-60" />

            <form
              onSubmit={submitEdit}
              className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl shadow-slate-300/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Edit Employee
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update account details
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={inputCls}
                    placeholder="Employee name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    New Password
                    <span className="ml-2 text-slate-400 normal-case tracking-normal font-normal">
                      (leave blank to keep)
                    </span>
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02]"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployees;