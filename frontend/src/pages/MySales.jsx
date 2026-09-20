import { useEffect, useState, useMemo } from "react";
import SalesTable from "../components/SalesTable";
import { fetchSales, updateSale, deleteSale } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";

const MySales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editing, setEditing] = useState(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paidAmount, setPaidAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [quickRange, setQuickRange] = useState("all"); // all | today | week | month

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchSales();
      setSales(res.data.sales || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---- Delete with confirmation ----
  const handleDelete = async (sale) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this sale?\n\n` +
        `Product: ${sale.productName}\n` +
        `Weight: ${sale.weight}\n` +
        `Total: ${formatCurrency(sale.totalAmount)}\n\n` +
        `This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteSale(sale._id);
      setSales((prev) => prev.filter((s) => s._id !== sale._id));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete sale.");
    }
  };

  // ---- Edit modal ----
  const openEdit = (sale) => {
    setEditing(sale);
    setSellingPrice(String(sale.sellingPrice));
    setDeliveryCharge(String(sale.deliveryCharge));
    setPaymentMethod(sale.paymentMethod);
    setPaidAmount(String(sale.paidAmount));
    setError("");
  };

  const closeEdit = () => {
    setEditing(null);
    setError("");
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await updateSale(editing._id, {
        sellingPrice: Number(sellingPrice),
        deliveryCharge: Number(deliveryCharge) || 0,
        paymentMethod,
        paidAmount: Number(paidAmount) || 0,
      });
      const updated = res.data.sale;
      setSales((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
      closeEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update sale.");
    } finally {
      setSaving(false);
    }
  };

  // ---- Filter (search + quick range only) ----
  const visibleSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();

    return sales.filter((s) => {
      // Text search
      if (q) {
        const match =
          s.productName?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.weight?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Quick range
      if (quickRange !== "all") {
        const d = new Date(s.createdAt || s.date || 0);
        if (quickRange === "today") {
          if (d.toDateString() !== now.toDateString()) return false;
        } else if (quickRange === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (d < weekAgo) return false;
        } else if (quickRange === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          if (d < monthAgo) return false;
        }
      }

      return true;
    });
  }, [sales, searchQuery, quickRange]);

  // ---- Stats ----
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalPending = sales.reduce(
    (sum, s) =>
      sum + Math.max((s.totalAmount || 0) - (s.paidAmount || 0), 0),
    0
  );
  const totalCount = sales.length;

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10";

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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  My Sales
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  All sales recorded under{" "}
                  <span className="font-semibold text-slate-700">
                    {user?.name}
                  </span>
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
          {!loading && sales.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
                  label: "Total Revenue",
                  value: formatCurrency(totalRevenue),
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
                  label: "Pending",
                  value: formatCurrency(totalPending),
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-4 sm:p-5 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/60 duration-300`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 truncate">
                        {stat.label}
                      </p>
                      <p className="text-base sm:text-2xl font-bold text-slate-900 truncate">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`${stat.iconBg} text-white rounded-xl p-2 shadow-md flex-shrink-0 hidden sm:block`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== SEARCH & QUICK RANGE ===== */}
        {!loading && sales.length > 0 && (
          <div className="mb-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product, category or weight..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm self-start overflow-x-auto">
              {[
                { key: "all", label: "All" },
                { key: "today", label: "Today" },
                { key: "week", label: "7 Days" },
                { key: "month", label: "30 Days" },
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setQuickRange(r.key)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
        )}

        {/* ===== CONTENT STATES ===== */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Loading sales…</p>
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
            <p className="text-slate-500 text-sm">No sales yet.</p>
          </div>
        ) : visibleSales.length === 0 ? (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
              sales={visibleSales}
              showEmployee={false}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) closeEdit();
          }}
        >
          <div className="relative w-full max-w-md">
            {/* Soft glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-300/40 via-violet-300/40 to-purple-300/40 rounded-3xl blur-xl opacity-60" />

            <form
              onSubmit={submitEdit}
              className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl shadow-slate-300/50"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Edit Sale
                    </h3>
                    <p className="text-xs text-slate-500 truncate max-w-[220px]">
                      {editing.productName} · {editing.weight}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={inputCls}
                  >
                    <option value="COD">COD</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-xl px-4 py-3 bg-rose-50 text-rose-700 border border-rose-200 text-sm font-medium flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-7">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySales;