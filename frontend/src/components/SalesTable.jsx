import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

export default function SalesTable({
  sales = [],
  showEmployee = true,
  onEdit,
  onDelete,
}) {
  const hasActions = onEdit || onDelete;

  // ===== EMPTY STATE =====
  if (!sales.length) {
    return (
      <div className="p-16 text-center">
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
        <p className="text-sm text-slate-500">No sales found.</p>
      </div>
    );
  }

  return (
    <>
      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
                {showEmployee && (
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>
                )}
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Weight
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Selling
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Delivery
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Payment
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Paid
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Pending
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Date
                </th>
                {hasActions && (
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((s) => (
                <tr
                  key={s._id}
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  {showEmployee && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-md shadow-indigo-500/20">
                          {s.employeeName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="font-semibold text-slate-900 whitespace-nowrap">
                          {s.employeeName}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {s.productName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                      {s.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {s.weight}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-700 whitespace-nowrap">
                    {formatCurrency(s.sellingPrice)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-700 whitespace-nowrap">
                    {formatCurrency(s.deliveryCharge)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(s.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        s.paymentMethod === "COD"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.paymentMethod === "COD"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-700 whitespace-nowrap">
                    {formatCurrency(s.paidAmount)}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                      s.pendingAmount > 0
                        ? "text-amber-600"
                        : "text-slate-900"
                    }`}
                  >
                    {formatCurrency(s.pendingAmount)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                    {formatDate(s.createdAt)}
                  </td>
                  {hasActions && (
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(s)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all hover:scale-105 hover:shadow-sm"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(s)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all hover:scale-105 hover:shadow-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {sales.map((s) => (
          <div
            key={s._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50 transition-all hover:border-slate-300 hover:shadow-xl"
          >
            {/* Card header: Product + Payment */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {s.productName}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                    {s.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {s.weight}
                  </span>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                  s.paymentMethod === "COD"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    s.paymentMethod === "COD"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                {s.paymentMethod}
              </span>
            </div>

            {/* Employee (if shown) */}
            {showEmployee && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                  {s.employeeName?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="text-xs text-slate-600">
                  Sold by{" "}
                  <span className="font-semibold text-slate-900">
                    {s.employeeName}
                  </span>
                </span>
              </div>
            )}

            {/* Financial grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
                  Selling
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(s.sellingPrice)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
                  Delivery
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(s.deliveryCharge)}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-indigo-600 font-bold mb-0.5">
                  Total
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(s.totalAmount)}
                </p>
              </div>
              <div
                className={`rounded-xl border p-2.5 ${
                  s.pendingAmount > 0
                    ? "bg-amber-50 border-amber-100"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <p
                  className={`text-[9px] uppercase tracking-wider font-bold mb-0.5 ${
                    s.pendingAmount > 0
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`}
                >
                  Pending
                </p>
                <p
                  className={`text-sm font-bold ${
                    s.pendingAmount > 0
                      ? "text-amber-600"
                      : "text-slate-900"
                  }`}
                >
                  {formatCurrency(s.pendingAmount)}
                </p>
              </div>
            </div>

            {/* Paid + Date row */}
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-slate-500">
                Paid:{" "}
                <span className="font-semibold text-slate-900">
                  {formatCurrency(s.paidAmount)}
                </span>
              </span>
              <span className="text-slate-400 text-[11px]">
                {formatDate(s.createdAt)}
              </span>
            </div>

            {/* Actions */}
            {hasActions && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                {onEdit && (
                  <button
                    onClick={() => onEdit(s)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(s)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all"
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
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}