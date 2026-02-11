import React from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebace";

type OrderStatus = "pending" | "paid" | "cancelled";

type AnalyticsOrder = {
  totalPrice: number;
  status: OrderStatus;
  items: { productId: string; name: string; qty: number; subtotal: number; imageUrl?: string | null }[];
};

type ProductDoc = { stock: number };

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [kpi, setKpi] = React.useState({
    revenuePaid: 0,
    ordersTotal: 0,
    customersTotal: 0,
    lowStockCount: 0,
  });

  const [statusCounts, setStatusCounts] = React.useState<Record<OrderStatus, number>>({
    pending: 0,
    paid: 0,
    cancelled: 0,
  });

  const [topProducts, setTopProducts] = React.useState<
    { productId: string; name: string; qty: number; revenue: number; imageUrl?: string | null }[]
  >([]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      // 1) Customers count
      const customersSnap = await getDocs(collection(db, "customers"));
      const customersTotal = customersSnap.size;

      // 2) Products low stock
      const productsSnap = await getDocs(collection(db, "products"));
      let lowStockCount = 0;
      productsSnap.docs.forEach((d) => {
        const data = d.data() as ProductDoc;
        if ((data.stock ?? 0) <= 3) lowStockCount += 1; // threshold
      });

      // 3) Orders: counts + revenue + top products
      const ordersSnap = await getDocs(collection(db, "orders"));
      const ordersTotal = ordersSnap.size;

      let revenuePaid = 0;
      const counts: Record<OrderStatus, number> = { pending: 0, paid: 0, cancelled: 0 };

      const agg = new Map<string, { productId: string; name: string; qty: number; revenue: number; imageUrl?: string | null }>();

      ordersSnap.docs.forEach((d) => {
        const o = d.data() as AnalyticsOrder;

        const status = (o.status ?? "pending") as OrderStatus;
        counts[status] = (counts[status] ?? 0) + 1;

        if (status === "paid") {
          revenuePaid += Number(o.totalPrice ?? 0);
        }

        // Top products از روی آیتم‌های سفارش
        (o.items ?? []).forEach((it) => {
          const key = it.productId;
          const prev = agg.get(key);
          const qty = Number(it.qty ?? 0);
          const rev = Number(it.subtotal ?? 0);

          if (!prev) {
            agg.set(key, {
              productId: it.productId,
              name: it.name,
              qty,
              revenue: rev,
              imageUrl: it.imageUrl ?? null,
            });
          } else {
            agg.set(key, {
              ...prev,
              qty: prev.qty + qty,
              revenue: prev.revenue + rev,
            });
          }
        });
      });

      const top = Array.from(agg.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 8);

      setKpi({ revenuePaid, ordersTotal, customersTotal, lowStockCount });
      setStatusCounts(counts);
      setTopProducts(top);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-gray-500">
            Overview of sales, orders, customers, and inventory health.
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl border hover:bg-gray-50" onClick={load}>
          Refresh
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border shadow-sm p-4 text-gray-500">
          Loading...
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-2xl border shadow-sm p-4 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Revenue (Paid)" value={`${kpi.revenuePaid} ₸`} note="Sum of paid orders" />
            <KpiCard title="Orders" value={`${kpi.ordersTotal}`} note="All statuses" />
            <KpiCard title="Customers" value={`${kpi.customersTotal}`} note="Created at checkout" />
            <KpiCard title="Low Stock" value={`${kpi.lowStockCount}`} note="Stock ≤ 3" />
          </div>

          {/* Order status breakdown */}
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <h2 className="text-lg font-semibold">Order Status</h2>
            <p className="text-sm text-gray-500">Distribution of orders by status.</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatusPill label="Pending" value={statusCounts.pending} />
              <StatusPill label="Paid" value={statusCounts.paid} />
              <StatusPill label="Cancelled" value={statusCounts.cancelled} />
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Top Products</h2>
                <p className="text-sm text-gray-500">Based on total quantity in orders.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {topProducts.length === 0 ? (
                <div className="text-sm text-gray-500">No order items yet.</div>
              ) : (
                topProducts.map((p) => (
                  <div key={p.productId} className="rounded-2xl border p-3 flex gap-3">
                    <img
                      src={p.imageUrl ?? "/placeholder_image.png"}
                      className="w-14 h-14 rounded-xl object-cover"
                      alt=""
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-sm text-gray-500">
                        Qty: <span className="font-semibold">{p.qty}</span> • Revenue:{" "}
                        <span className="font-semibold">{p.revenue} ₸</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">{p.productId}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-2 text-xs text-gray-400">{note}</div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
