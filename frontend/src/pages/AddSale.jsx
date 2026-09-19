import { useEffect, useState } from "react";
import { createSale, fetchProductsByCategory } from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["mudgar", "gada", "samtola", "senaboard", "decor", "sticks"];

let rowIdCounter = 1;
const makeEmptyRow = () => ({
  id: rowIdCounter++,
  category: "",
  products: [],
  productId: "",
  weight: "",
  sellingPrice: "",
  deliveryCharge: "",
  paymentMethod: "COD",
  paidAmount: "",
  error: "",
});

export default function AddSale() {
  const { user, isVerified, refreshUser } = useAuth();

  const [rows, setRows] = useState([makeEmptyRow()]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [checking, setChecking] = useState(false);

  // Always refresh user info when this page mounts
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckAgain = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  };

  if (!isVerified) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-semibold text-slate-900">
          Account Pending Approval
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Hi {user?.name}, your account is waiting for admin verification.
          You'll be able to add sales once the admin verifies you.
        </p>
        <button
          onClick={handleCheckAgain}
          disabled={checking}
          className="mt-5 px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {checking ? "Checking..." : "Check again"}
        </button>
      </div>
    );
  }

  const updateRow = (id, patch) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  };

  const changeCategory = async (id, category) => {
    updateRow(id, {
      category,
      productId: "",
      weight: "",
      products: [],
      error: "",
    });
    if (!category) return;
    try {
      const res = await fetchProductsByCategory(category);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, products: res.data.products || [] } : r
        )
      );
    } catch {
      // ignore
    }
  };

  const addRow = () => {
    setRows((prev) => [...prev, makeEmptyRow()]);
  };

  const removeRow = (id) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const resetAll = () => {
    setRows([makeEmptyRow()]);
    setMessage(null);
  };

  const computeRow = (r) => {
    const sp = Number(r.sellingPrice) || 0;
    const dc = Number(r.deliveryCharge) || 0;
    const paid = Number(r.paidAmount) || 0;
    const total = sp + dc;
    const pending = Math.max(total - paid, 0);
    return { total, pending };
  };

  const validateRow = (r) => {
    if (!r.category) return "Select a category";
    if (!r.productId) return "Select a product";
    if (!r.weight) return "Select a weight";
    if (r.sellingPrice === "" || Number(r.sellingPrice) < 0)
      return "Enter a valid selling price";
    return "";
  };

  const allRowsValid = rows.every((r) => validateRow(r) === "");

  const handleSaveAll = async (e) => {
    e.preventDefault();
    setMessage(null);

    let hasError = false;
    const validated = rows.map((r) => {
      const err = validateRow(r);
      if (err) hasError = true;
      return { ...r, error: err };
    });
    setRows(validated);

    if (hasError) {
      setMessage({ type: "error", text: "Fix the highlighted rows and try again." });
      return;
    }

    setSaving(true);

    const failures = [];
    let successCount = 0;

    for (const r of rows) {
      try {
        await createSale({
          productId: r.productId,
          weight: r.weight,
          sellingPrice: Number(r.sellingPrice),
          deliveryCharge: Number(r.deliveryCharge) || 0,
          paymentMethod: r.paymentMethod,
          paidAmount: Number(r.paidAmount) || 0,
        });
        successCount++;
      } catch (err) {
        failures.push({
          ...r,
          error: err?.response?.data?.message || "Failed to save",
        });
      }
    }

    setSaving(false);

    // Refresh user so any status changes reflect immediately
    refreshUser();

    if (failures.length === 0) {
      setMessage({
        type: "success",
        text: `${successCount} sale${successCount > 1 ? "s" : ""} saved successfully ✅`,
      });
      setRows([makeEmptyRow()]);
    } else {
      setRows(failures);
      setMessage({
        type: "error",
        text: `${successCount} saved, ${failures.length} failed. Fix and retry.`,
      });
    }
  };

  const cellInput =
    "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Add Sale</h1>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as <span className="font-medium text-slate-700">{user?.name}</span>
        </p>
      </div>

      <form
        onSubmit={handleSaveAll}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Weight</th>
                <th className="px-3 py-3 font-medium">Selling (₹)</th>
                <th className="px-3 py-3 font-medium">Delivery (₹)</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 font-medium">Paid (₹)</th>
                <th className="px-3 py-3 font-medium text-right">Total</th>
                <th className="px-3 py-3 font-medium text-right">Pending</th>
                <th className="px-3 py-3 font-medium text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const { total, pending } = computeRow(r);
                const selectedProduct = r.products.find(
                  (p) => p._id === r.productId
                );
                return (
                  <tr key={r.id} className={r.error ? "bg-red-50" : ""}>
                    <td className="px-3 py-2 align-top">
                      <select
                        value={r.category}
                        onChange={(e) => changeCategory(r.id, e.target.value)}
                        className={cellInput}
                      >
                        <option value="">Select</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2 align-top min-w-[160px]">
                      <select
                        value={r.productId}
                        onChange={(e) =>
                          updateRow(r.id, {
                            productId: e.target.value,
                            weight: "",
                          })
                        }
                        disabled={!r.category}
                        className={`${cellInput} disabled:bg-slate-100 disabled:cursor-not-allowed`}
                      >
                        <option value="">
                          {!r.category ? "Pick category" : "Select"}
                        </option>
                        {r.products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2 align-top">
                      <select
                        value={r.weight}
                        onChange={(e) => updateRow(r.id, { weight: e.target.value })}
                        disabled={!selectedProduct}
                        className={`${cellInput} disabled:bg-slate-100 disabled:cursor-not-allowed`}
                      >
                        <option value="">Select</option>
                        {selectedProduct?.weights?.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-3 py-2 align-top min-w-[110px]">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={r.sellingPrice}
                        onChange={(e) =>
                          updateRow(r.id, { sellingPrice: e.target.value })
                        }
                        className={cellInput}
                        placeholder="0"
                      />
                    </td>

                    <td className="px-3 py-2 align-top min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={r.deliveryCharge}
                        onChange={(e) =>
                          updateRow(r.id, { deliveryCharge: e.target.value })
                        }
                        className={cellInput}
                        placeholder="0"
                      />
                    </td>

                    <td className="px-3 py-2 align-top">
                      <select
                        value={r.paymentMethod}
                        onChange={(e) =>
                          updateRow(r.id, { paymentMethod: e.target.value })
                        }
                        className={cellInput}
                      >
                        <option value="COD">COD</option>
                        <option value="Online">Online</option>
                      </select>
                    </td>

                    <td className="px-3 py-2 align-top min-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={r.paidAmount}
                        onChange={(e) =>
                          updateRow(r.id, { paidAmount: e.target.value })
                        }
                        className={cellInput}
                        placeholder="0"
                      />
                    </td>

                    <td className="px-3 py-2 align-top text-right whitespace-nowrap font-medium text-slate-900">
                      {formatCurrency(total)}
                    </td>

                    <td
                      className={`px-3 py-2 align-top text-right whitespace-nowrap font-medium ${
                        pending > 0 ? "text-amber-600" : "text-slate-900"
                      }`}
                    >
                      {formatCurrency(pending)}
                    </td>

                    <td className="px-3 py-2 align-top text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(r.id)}
                        disabled={rows.length === 1}
                        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                      {r.error && (
                        <p className="text-xs text-red-600 mt-1 text-right">
                          {r.error}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {message && (
          <div
            className={`mx-4 mt-4 text-sm rounded-lg px-4 py-3 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center gap-3 px-4 py-4 bg-slate-50 border-t border-slate-100 mt-4">
          <div>
            <button
              type="button"
              onClick={addRow}
              disabled={!allRowsValid}
              title={!allRowsValid ? "Fill the current row correctly first" : ""}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Add More
            </button>
            {!allRowsValid && (
              <p className="text-xs text-slate-500 mt-1">
                Complete the current row to add more.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetAll}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving || !allRowsValid}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : `Save ${rows.length > 1 ? "All" : "Sale"}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}