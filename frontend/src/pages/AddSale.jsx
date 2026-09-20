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

const AddSale = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-violet-200/30 blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-sky-200/25 blur-[140px]" />
        </div>

        <div className="relative max-w-xl mx-auto mt-16 px-4">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 p-8 sm:p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-5">
              <svg
                className="w-8 h-8 text-amber-500"
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
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Account Pending Approval
            </h1>
            <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto leading-relaxed">
              Hi{" "}
              <span className="font-semibold text-slate-700">{user?.name}</span>,
              your account is waiting for admin verification. You'll be able to
              add sales once the admin verifies you.
            </p>
            <button
              onClick={handleCheckAgain}
              disabled={checking}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {checking ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Check again
                </>
              )}
            </button>
          </div>
        </div>
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
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev
    );
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
      setMessage({
        type: "error",
        text: "Fix the highlighted rows and try again.",
      });
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
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";

  // Summary stats for footer
  const grandTotal = rows.reduce((sum, r) => sum + computeRow(r).total, 0);
  const grandPending = rows.reduce((sum, r) => sum + computeRow(r).pending, 0);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Add Sale
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Logged in as{" "}
                  <span className="font-semibold text-slate-700">
                    {user?.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick summary pills */}
            {rows.length > 0 && (
              <div className="flex gap-2 self-start sm:self-auto">
                <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Total
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(grandTotal)}
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Pending
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      grandPending > 0 ? "text-amber-600" : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(grandPending)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveAll}>
          {/* ===== DESKTOP TABLE ===== */}
          <div className="hidden lg:block rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Product
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Weight
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Selling (₹)
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Delivery (₹)
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Paid (₹)
                    </th>
                    <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Total
                    </th>
                    <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Pending
                    </th>
                    <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const { total, pending } = computeRow(r);
                    const selectedProduct = r.products.find(
                      (p) => p._id === r.productId
                    );
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          r.error
                            ? "bg-rose-50/60"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="px-4 py-3 align-top">
                          <select
                            value={r.category}
                            onChange={(e) =>
                              changeCategory(r.id, e.target.value)
                            }
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

                        <td className="px-4 py-3 align-top min-w-[160px]">
                          <select
                            value={r.productId}
                            onChange={(e) =>
                              updateRow(r.id, {
                                productId: e.target.value,
                                weight: "",
                              })
                            }
                            disabled={!r.category}
                            className={cellInput}
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

                        <td className="px-4 py-3 align-top">
                          <select
                            value={r.weight}
                            onChange={(e) =>
                              updateRow(r.id, { weight: e.target.value })
                            }
                            disabled={!selectedProduct}
                            className={cellInput}
                          >
                            <option value="">Select</option>
                            {selectedProduct?.weights?.map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3 align-top min-w-[110px]">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={r.sellingPrice}
                            onChange={(e) =>
                              updateRow(r.id, {
                                sellingPrice: e.target.value,
                              })
                            }
                            className={cellInput}
                            placeholder="0"
                          />
                        </td>

                        <td className="px-4 py-3 align-top min-w-[100px]">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={r.deliveryCharge}
                            onChange={(e) =>
                              updateRow(r.id, {
                                deliveryCharge: e.target.value,
                              })
                            }
                            className={cellInput}
                            placeholder="0"
                          />
                        </td>

                        <td className="px-4 py-3 align-top">
                          <select
                            value={r.paymentMethod}
                            onChange={(e) =>
                              updateRow(r.id, {
                                paymentMethod: e.target.value,
                              })
                            }
                            className={cellInput}
                          >
                            <option value="COD">COD</option>
                            <option value="Online">Online</option>
                          </select>
                        </td>

                        <td className="px-4 py-3 align-top min-w-[100px]">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={r.paidAmount}
                            onChange={(e) =>
                              updateRow(r.id, {
                                paidAmount: e.target.value,
                              })
                            }
                            className={cellInput}
                            placeholder="0"
                          />
                        </td>

                        <td className="px-4 py-3 align-top text-right whitespace-nowrap font-bold text-slate-900">
                          {formatCurrency(total)}
                        </td>

                        <td
                          className={`px-4 py-3 align-top text-right whitespace-nowrap font-bold ${
                            pending > 0 ? "text-amber-600" : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(pending)}
                        </td>

                        <td className="px-4 py-3 align-top text-right">
                          <button
                            type="button"
                            onClick={() => removeRow(r.id)}
                            disabled={rows.length === 1}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-rose-50"
                            title="Remove row"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                          {r.error && (
                            <p className="text-[11px] text-rose-600 mt-1.5 text-right font-medium">
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
          </div>

          {/* ===== MOBILE CARDS ===== */}
          <div className="lg:hidden space-y-3 mb-4">
            {rows.map((r, index) => {
              const { total, pending } = computeRow(r);
              const selectedProduct = r.products.find(
                (p) => p._id === r.productId
              );
              return (
                <div
                  key={r.id}
                  className={`rounded-2xl border bg-white shadow-lg transition-all ${
                    r.error
                      ? "border-rose-200 shadow-rose-100"
                      : "border-slate-200 shadow-slate-200/50"
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[11px] font-bold shadow-sm">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Sale Item
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(r.id)}
                      disabled={rows.length === 1}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Category
                        </label>
                        <select
                          value={r.category}
                          onChange={(e) =>
                            changeCategory(r.id, e.target.value)
                          }
                          className={cellInput}
                        >
                          <option value="">Select</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Product
                        </label>
                        <select
                          value={r.productId}
                          onChange={(e) =>
                            updateRow(r.id, {
                              productId: e.target.value,
                              weight: "",
                            })
                          }
                          disabled={!r.category}
                          className={cellInput}
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
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Weight
                        </label>
                        <select
                          value={r.weight}
                          onChange={(e) =>
                            updateRow(r.id, { weight: e.target.value })
                          }
                          disabled={!selectedProduct}
                          className={cellInput}
                        >
                          <option value="">Select</option>
                          {selectedProduct?.weights?.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Payment
                        </label>
                        <select
                          value={r.paymentMethod}
                          onChange={(e) =>
                            updateRow(r.id, {
                              paymentMethod: e.target.value,
                            })
                          }
                          className={cellInput}
                        >
                          <option value="COD">COD</option>
                          <option value="Online">Online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Selling (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={r.sellingPrice}
                          onChange={(e) =>
                            updateRow(r.id, {
                              sellingPrice: e.target.value,
                            })
                          }
                          className={cellInput}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Delivery (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={r.deliveryCharge}
                          onChange={(e) =>
                            updateRow(r.id, {
                              deliveryCharge: e.target.value,
                            })
                          }
                          className={cellInput}
                          placeholder="0"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Paid (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={r.paidAmount}
                          onChange={(e) =>
                            updateRow(r.id, {
                              paidAmount: e.target.value,
                            })
                          }
                          className={cellInput}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                          Total
                        </p>
                        <p className="text-base font-bold text-slate-900">
                          {formatCurrency(total)}
                        </p>
                      </div>
                      <div
                        className={`rounded-xl border p-3 ${
                          pending > 0
                            ? "bg-amber-50 border-amber-100"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                          Pending
                        </p>
                        <p
                          className={`text-base font-bold ${
                            pending > 0
                              ? "text-amber-600"
                              : "text-slate-900"
                          }`}
                        >
                          {formatCurrency(pending)}
                        </p>
                      </div>
                    </div>

                    {/* Row error */}
                    {r.error && (
                      <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2">
                        <p className="text-xs text-rose-600 font-medium">
                          ⚠️ {r.error}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== MESSAGE ===== */}
          {message && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3.5 text-sm font-medium border shadow-sm flex items-start gap-2.5 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <span className="text-base leading-none mt-0.5">
                {message.type === "success" ? "✅" : "⚠️"}
              </span>
              <span>{message.text}</span>
            </div>
          )}

          {/* ===== ACTION BAR ===== */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-4 sm:p-5">
              {/* Left: Add row */}
              <div className="flex-1">
                <button
                  type="button"
                  onClick={addRow}
                  disabled={!allRowsValid}
                  title={
                    !allRowsValid
                      ? "Fill the current row correctly first"
                      : ""
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add More
                </button>
                {!allRowsValid && (
                  <p className="text-xs text-slate-500 mt-2 sm:mt-1">
                    Complete the current row to add more.
                  </p>
                )}
              </div>

              {/* Right: Reset + Save */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex-1 sm:flex-initial px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving || !allRowsValid}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                      Save {rows.length > 1 ? "All" : "Sale"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSale;