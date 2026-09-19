import { useEffect, useState } from "react";
import SalesTable from "../components/SalesTable";
import { fetchSales } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MySales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSales();
        setSales(res.data.sales || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <SalesTable sales={sales} showEmployee={false} />
      )}
    </div>
  );
}