import { useEffect, useMemo, useState } from "react";
import { listAllProducts, type Product } from "../serviseces/products.firebase";
import {Link} from "react-router-dom"
export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"all" | string>("all");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listAllProducts();
        if (mounted) setItems(data);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Failed to load products.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchQ =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query);

      const matchCat = category === "all" ? true : p.category === category;
      return matchQ && matchCat;
    });
  }, [items, q, category]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Loaded from Firestore</p>
        </div>

        <Link
          to="/app/products/new"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
          
        >
          Add product
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-md">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Search
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">
            Products ({filtered.length})
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-600">Loading…</div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-900">No products found</p>
            <p className="text-sm text-slate-500 mt-1">
              Add a product to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filtered.map((p) => (
                  
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      
                      {p.imageUrl ? (
                                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-slate-100" />
                                                          )}

                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">SKU: {p.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.category}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      ${Number(p.price ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
