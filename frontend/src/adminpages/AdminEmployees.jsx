import { useEffect, useState } from "react";
import {
  fetchEmployeesWithStats,
  toggleEmployeeVerify,
  toggleEmployeeActive,
  updateEmployee,
} from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // employee being edited
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");

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

  const handleVerify = async (id) => {
    try {
      const res = await toggleEmployeeVerify(id);
      setEmployees((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, isVerified: res.data.employee.isVerified } : e
        )
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
    }
  };

  const handleActive = async (id) => {
    try {
      const res = await toggleEmployeeActive(id);
      setEmployees((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, isActive: res.data.employee.isActive } : e
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

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
        <p className="text-sm text-slate-500 mt-1">
          Verify, deactivate, edit — and see sales totals per employee.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading employees…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center text-sm text-slate-500">
          No employees yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium text-right">Sales</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-right">Paid</th>
                  <th className="px-4 py-3 font-medium text-right">Pending</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{e.name}</td>
                    <td className="px-4 py-3 text-slate-600">{e.username}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{e.totalSales}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-medium">
                      {formatCurrency(e.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {formatCurrency(e.totalPaid)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        e.totalPending > 0 ? "text-amber-600" : "text-slate-700"
                      }`}
                    >
                      {formatCurrency(e.totalPending)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium ${
                            e.isVerified
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {e.isVerified ? "Verified" : "Unverified"}
                        </span>
                        <span
                          className={`inline-flex w-fit px-2 py-0.5 rounded-full text-xs font-medium ${
                            e.isActive
                              ? "bg-slate-100 text-slate-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {e.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleVerify(e._id)}
                          className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2 py-1 rounded border border-slate-200"
                        >
                          {e.isVerified ? "Unverify" : "Verify"}
                        </button>
                        <button
                          onClick={() => handleActive(e._id)}
                          className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2 py-1 rounded border border-slate-200"
                        >
                          {e.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => openEdit(e)}
                          className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2 py-1 rounded border border-slate-200"
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
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={submitEdit}
            className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Edit Employee
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Password (leave blank to keep)
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
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}