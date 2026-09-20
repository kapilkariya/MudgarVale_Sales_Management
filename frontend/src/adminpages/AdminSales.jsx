import { useEffect, useState, useMemo } from "react";
import SalesTable from "../components/SalesTable";
import { fetchSales, deleteSale } from "../services/api";

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [employeeName, setEmployeeName] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Sorting (client-side)
  const [sortBy, setSortBy] = useState("date"); // date | amount | employee
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  // Quick time range
  const [quickRange, setQuickRange] = useState("all"); // all | today | week | month

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (employeeName) params.employeeName = employeeName;
      if (category) params.category = category;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await fetchSales(params);
      setSales(res.data.sales || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      await deleteSale(id);
      setSales((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete.");
    }
  };

  const handleResetFilters = () => {
    setEmployeeName("");
    setCategory("");
    setPaymentMethod("");
    setFrom("");
    setTo("");
    setQuickRange("all");
    setTimeout(load, 0);
  };

  // Apply quick range to date fields
  const applyQuickRange = (range) => {
    setQuickRange(range);
    const now = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];

    if (range === "today") {
      setFrom(fmt(now));
      setTo(fmt(now));
    } else if (range === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      setFrom(fmt(weekAgo));
      setTo(fmt(now));
    } else if (range === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      setFrom(fmt(monthAgo));
      setTo(fmt(now));
    } else {
      setFrom("");
      setTo("");
    }
  };

  // Client-side sort
  const sortedSales = useMemo(() => {
    const dir = sortOrder === "asc" ? 1 : -1;
    return [...sales].sort((a, b) => {
      if (sortBy === "amount") {
        return ((a.amount || 0) - (b.amount || 0)) * dir;
      }
      if (sortBy === "employee") {
        return (a.employeeName || "").localeCompare(b.employeeName || "") * dir;
      }
      // date default
      const da = new Date(a.createdAt || a.date || 0).getTime();
      const db = new Date(b.createdAt || b.date || 0).getTime();
      return (da - db) * dir;
    });
  }, [sales, sortBy, sortOrder]);

  // Stats
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalCount = sales.length;
  const onlineCount = sales.filter((s) => s.paymentMethod === "Online").length;
  const codCount = sales.filter((s) => s.paymentMethod === "COD").length;

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

  const categories = [
    "mudgar",
    "gada",
    "samtola",
    "senaboard",
    "decor",
    "sticks",
  ];

  const sortOptions = [
    { field: "date", label: "Date" },
    { field: "amount", label: "Amount" },
    { field: "employee", label: "Employee" },
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
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  All Sales
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  View, filter and manage every sale
                </p>
              </div>
            </div>
            <button
              onClick={load}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {/* ===== STATS CARDS ===== */}
          {!loading && !error && sales.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: "Total Sales",
                  value: totalCount,
                  bg: "bg-gradient-to-br from-indigo-50 to-violet-50",
                  border: "border-indigo-100",
                  iconBg: "bg-indigo-500",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Revenue",
                  value: totalRevenue.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  }),
                  bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
                  border: "border-emerald-100",
                  iconBg: "bg-emerald-500",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Online",
                  value: onlineCount,
                  bg: "bg-gradient-to-br from-amber-50 to-orange-50",
                  border: "border-amber-100",
                  iconBg: "bg-amber-500",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "COD",
                  value: codCount,
                  bg: "bg-gradient-to-br from-violet-50 to-fuchsia-50",
                  border: "border-violet-100",
                  iconBg: "bg-violet-500",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
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
                    <div
                      className={`${stat.iconBg} text-white rounded-xl p-2 shadow-md flex-shrink-0`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== FILTERS PANEL ===== */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          {/* Quick range tabs */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick range
              </span>
              <div className="inline-flex p-1 rounded-xl bg-slate-50 border border-slate-200">
                {[
                  { key: "all", label: "All" },
                  { key: "today", label: "Today" },
                  { key: "week", label: "7 Days" },
                  { key: "month", label: "30 Days" },
                ].map((r) => (
                  <button
                    key={r.key}
                    onClick={() => applyQuickRange(r.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      quickRange === r.key
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-500/25"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleResetFilters}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </button>
          </div>

          {/* Filters grid */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Employee */}
              <div className="relative lg:col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Employee
                </label>
                <input
                  type="text"
                  placeholder="Search name..."
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputCls}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Payment
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={inputCls}
                >
                  <option value="">All methods</option>
                  <option value="COD">COD</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              {/* From */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  From
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setQuickRange("all");
                  }}
                  className={inputCls}
                />
              </div>

              {/* To */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  To
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setQuickRange("all");
                  }}
                  className={inputCls}
                />
              </div>

              {/* Apply */}
              <div className="flex items-end">
                <button
                  onClick={load}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SORT BAR (shown when data exists) ===== */}
        {!loading && !error && sales.length > 0 && (
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {sortedSales.length}
              </span>{" "}
              {sortedSales.length === 1 ? "result" : "results"}
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              {/* Sort by */}
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

              {/* Sort order */}
              <div className="flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
                <button
                  onClick={() => setSortOrder("asc")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sortOrder === "asc"
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
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
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                    />
                  </svg>
                  High → Low
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== CONTENT STATES ===== */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Loading sales…</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/70 backdrop-blur-xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 mb-4">
              <svg
                className="w-6 h-6 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-sm text-rose-600 font-medium">{error}</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">
              No sales match your filters.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <SalesTable
              sales={sortedSales}
              showEmployee
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSales;