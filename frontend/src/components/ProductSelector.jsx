import { useEffect, useState } from "react";
import { fetchProductsByCategory } from "../services/api";

const CATEGORIES = ["mudgar", "gada", "samtola", "senaboard", "decor", "sticks"];

export default function ProductSelector({ onSelect }) {
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p._id === productId);

  // Reset when category changes
  useEffect(() => {
    setProducts([]);
    setProductId("");
    setWeight("");
    if (onSelect) onSelect(null);
  }, [category]);

  // Fetch products when category selected
  useEffect(() => {
    if (!category) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetchProductsByCategory(category);
        if (!cancelled) setProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category]);

  // Notify parent when product + weight chosen
  useEffect(() => {
    if (!onSelect) return;
    if (selectedProduct && weight) {
      onSelect({
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        category: selectedProduct.category,
        weight,
      });
    } else {
      onSelect(null);
    }
  }, [selectedProduct, weight]);

  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";
  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900";

  return (
    <div className="space-y-4">
      {/* Category */}
      <div>
        <label className={labelCls}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputCls}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Product */}
      <div>
        <label className={labelCls}>Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          disabled={!category || loading}
          className={`${inputCls} disabled:bg-slate-100 disabled:cursor-not-allowed`}
        >
          <option value="">
            {loading ? "Loading..." : !category ? "Select category first" : "Select product"}
          </option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        {category && !loading && products.length === 0 && (
          <p className="mt-1 text-xs text-slate-500">
            No active products in this category.
          </p>
        )}
      </div>

      {/* Weight */}
      <div>
        <label className={labelCls}>Weight</label>
        <select
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          disabled={!selectedProduct}
          className={`${inputCls} disabled:bg-slate-100 disabled:cursor-not-allowed`}
        >
          <option value="">Select weight</option>
          {selectedProduct?.weights?.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}