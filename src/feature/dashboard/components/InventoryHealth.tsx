
import HealthRow from "./HealthRow"
import type { DashboardKpis} from "../service/dashboard.service";
function InventoryHealth({kpis}:{kpis:DashboardKpis}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Inventory health
      </h3>

      <div className="space-y-3">
        <HealthRow label="Active products" value={kpis.totalProducts} />
        <HealthRow label="In stock" value={kpis.inStock} />
        <HealthRow
          label="Low stock"
          value={kpis.lowStock}
          warning
        />
        <HealthRow
          label="Out of stock"
          value={kpis.outOfStock}
          danger
        />
      </div>
    </div>
  )
}

export default InventoryHealth
