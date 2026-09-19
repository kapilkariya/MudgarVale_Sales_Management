import { useEffect, useState } from "react";
import SalesTable from "../components/SalesTable";
import { fetchSales, deleteSale } from "../services/api";

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [employeeName, setEmployeeName] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">All Sales</h1>
        <p className="text-sm text-slate-500 mt-1">
          View, filter and manage every sale.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Employee name"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className={inputCls}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            <option value="">All categories</option>
            {["mudgar", "gada", "samtola", "senaboard", "decor", "sticks"].map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={inputCls}
          >
            <option value="">All methods</option>
            <option value="COD">COD</option>
            <option value="Online">Online</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
          />
          <button
            onClick={load}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading sales…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <SalesTable sales={sales} showEmployee onDelete={handleDelete} />
      )}
    </div>
  );
}

