import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DashboardKpis, RecentProduct } from "../service/dashboard.service";
import { fetchDashboardData } from "../service/dashboard.service";
import RecentProducts from "../components/RecentProducts"
import InventoryHealth from "../components/InventoryHealth"
import RecentSkeleton from "../components/RecentSkeleton"

type DashboardState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; kpis: DashboardKpis; recent: RecentProduct[] };

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { kpis, recent } = await fetchDashboardData(5);
        if (!mounted) return;
        setState({ status: "success", kpis, recent });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong";
        if (!mounted) return;
        setState({ status: "error", message });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (state.status === "loading") {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (state.status === "error") {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">{state.message}</p>
      </div>
    );
  }

  const { kpis, recent } = state;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of your inventory</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/app/products/new"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add product
          </Link>
          <Link
            to="/app/products"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            View products
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total products" value={kpis.totalProducts} />
        <KpiCard label="In stock" value={kpis.inStock} />
        <KpiCard label="Low stock" value={kpis.lowStock} />
        <KpiCard label="Out of stock" value={kpis.outOfStock} />
      </div>

      {/* Alerts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Alerts</p>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {kpis.outOfStock > 0 ? (
            <p>❌ {kpis.outOfStock} products are out of stock</p>
          ) : (
            <p>✅ No out-of-stock products</p>
          )}
          {kpis.lowStock > 0 ? (
            <p>⚠️ {kpis.lowStock} products are low in stock</p>
          ) : (
            <p>✅ No low-stock warnings</p>
          )}
        </div>
      </div>

     

<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
   {/* Recent */}
  <div className="lg:col-span-2">
    {status === "loading" ? <RecentSkeleton /> : <RecentProducts recent={recent} />}
  </div>

  <div className="lg:col-span-1">
    <InventoryHealth kpis={kpis} />
  </div>
</div>


    </div>
  );
}
