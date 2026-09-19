import { useEffect, useState } from "react";
import SalesTable from "../components/SalesTable";
import { fetchSales, updateSale, deleteSale } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";

export default function MySales() {
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
      setSales((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      closeEdit();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update sale.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">My Sales</h1>
        <p className="text-sm text-slate-500 mt-1">
          All sales recorded under{" "}
          <span className="font-medium">{user?.name}</span>.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : (
        <SalesTable
          sales={sales}
          showEmployee={false}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ---- Edit Modal ---- */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={submitEdit}
            className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              Edit Sale
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editing.productName} · {editing.weight}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
              <div className="mt-4 text-sm rounded-lg px-4 py-3 bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeEdit}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}