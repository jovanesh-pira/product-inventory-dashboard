import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebace";

type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

type Order = {
  id: string;
  customerName: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt?: Timestamp | { seconds: number; nanoseconds: number } | null;
};

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const data: Order[] = snap.docs.map((doc) => {
          const d = doc.data() as Partial<Order>;
          return {
            id: doc.id,
            customerName: String(d.customerName ?? "Unknown"),
            totalPrice: Number(d.totalPrice ?? 0),
            status: (d.status as OrderStatus) ?? "pending",
            createdAt: d.createdAt ?? null,
          };
        });

        if (mounted) setItems(data);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Failed to load orders.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (value: Order["createdAt"]) => {
    if (!value) return "—";
    if (value instanceof Timestamp) return value.toDate().toLocaleString();
    if (typeof value === "object" && "seconds" in value) {
      return new Date(value.seconds * 1000).toLocaleString();
    }
    return "—";
  };

  const statusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
      shipped: "bg-blue-50 text-blue-700 border-blue-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status]}`}
      >
        {status}
      </span>
    );
  };

  const totalCount = useMemo(() => items.length, [items]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">Loaded from Firestore</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">
            Orders ({totalCount})
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
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-slate-900">No orders found</p>
            <p className="text-sm text-slate-500 mt-1">
              Orders will appear here when created.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Total Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created At</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {items.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-700">{o.id}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {o.customerName}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      ${Number(o.totalPrice ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(o.status)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/app/orders/${o.id}`}
                        className="text-sm text-slate-600 hover:text-slate-900"
                      >
                        View
                      </Link>
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
