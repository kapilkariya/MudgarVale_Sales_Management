import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

export default function SalesTable({ sales = [], showEmployee = true, onDelete }) {
  if (!sales.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <p className="text-sm text-slate-500">No sales found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              {showEmployee && <th className="px-4 py-3 font-medium">Employee</th>}
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Weight</th>
              <th className="px-4 py-3 font-medium text-right">Selling</th>
              <th className="px-4 py-3 font-medium text-right">Delivery</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium text-right">Paid</th>
              <th className="px-4 py-3 font-medium text-right">Pending</th>
              <th className="px-4 py-3 font-medium">Date</th>
              {onDelete && <th className="px-4 py-3 font-medium text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50">
                {showEmployee && (
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {s.employeeName}
                  </td>
                )}
                <td className="px-4 py-3 text-slate-900">{s.productName}</td>
                <td className="px-4 py-3 text-slate-600 capitalize">{s.category}</td>
                <td className="px-4 py-3 text-slate-600">{s.weight}</td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {formatCurrency(s.sellingPrice)}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {formatCurrency(s.deliveryCharge)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatCurrency(s.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.paymentMethod === "COD"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {s.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {formatCurrency(s.paidAmount)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    s.pendingAmount > 0 ? "text-amber-600" : "text-slate-700"
                  }`}
                >
                  {formatCurrency(s.pendingAmount)}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {formatDate(s.createdAt)}
                </td>
                {onDelete && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDelete(s._id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}