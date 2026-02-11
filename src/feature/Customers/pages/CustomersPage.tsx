import React from "react";
import { listCustomers } from "../api/Customer.api";
import type { CustomerDomain } from "../model/Customer.schema";

export default function CustomersPage() {
  const [items, setItems] = React.useState<CustomerDomain[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [nextCursor, setNextCursor] = React.useState<any>(null); // Firestore cursor
  const [hasMore, setHasMore] = React.useState(true);

  const [q, setQ] = React.useState("");

  async function loadFirst() {
    setLoading(true);
    setError(null);
    try {
      const res = await listCustomers({ pageSize: 20, cursor: null });
      setItems(res.customers);
      setNextCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!hasMore || !nextCursor) return;
    try {
      const res = await listCustomers({ pageSize: 20, cursor: nextCursor });
      setItems((prev) => [...prev, ...res.customers]);
      setNextCursor(res.nextCursor);
      setHasMore(!!res.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load more");
    }
  }

  React.useEffect(() => {
    loadFirst();
  }, []);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => {
      return (
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.phone ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-gray-500">
            Your customer list (created during checkout).
          </p>
        </div>

        <button
          className="px-4 py-2 rounded-xl border hover:bg-gray-50"
          onClick={loadFirst}
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name / email / phone..."
            className="w-full md:max-w-md px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <div className="text-sm text-gray-500">
            Showing <span className="font-semibold">{filtered.length}</span>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Orders</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td className="p-4 text-red-600" colSpan={4}>
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && !filtered.length && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={4}>
                    No customers found.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img
                            src={c.avatar}
                            className="w-10 h-10 rounded-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate">{c.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {c.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone ?? "—"}</td>
                    <td className="p-3">{c.ordersCount ?? 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Loaded: {items.length} • Has more: {hasMore ? "Yes" : "No"}
          </div>

          <button
            className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-50"
            disabled={!hasMore || loading}
            onClick={loadMore}
          >
            Load more
          </button>
        </div>
      </div>
    </div>
  );
}
