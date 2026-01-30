
import type { RecentProduct } from "../service/dashboard.service";
import StockBadge from "./Badge"
function RecentProducts({recent}:{recent:RecentProduct[]}) {
  return (
  <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Recent products</h3>
        <span className="text-xs text-slate-500">Last added</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600">
              <th className="px-5 py-3 text-left">Product</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">SKU</th>
              <th className="px-5 py-3 text-left hidden lg:table-cell">Created</th>
              <th className="px-5 py-3 text-right">Price</th>
              <th className="px-5 py-3 text-right">Stock</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {recent.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                  No products yet.
                </td>
              </tr>
            ) : (
              recent.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => {
                    // بعداً می‌تونی navigate کنی
                    // navigate(`/app/products/${p.id}`)
                  }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100" />
                      )}

                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500 md:hidden">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3 text-slate-600 hidden md:table-cell">
                    {p.sku}
                  </td>

                  <td className="px-5 py-3 text-slate-600 hidden lg:table-cell">
                    {p.createdAtText ?? "-"}
                  </td>

                  <td className="px-5 py-3 text-right font-medium text-slate-900">
                    ${p.price}
                  </td>

                  <td className="px-5 py-3 text-right text-slate-700">
                    {p.stock}
                  </td>

                  <td className="px-5 py-3 text-right">
                    <StockBadge stock={p.stock} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    
      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
        <span className="text-xs text-slate-500">Showing {Math.min(recent.length, 5)} items</span>
        <a href="/app/products" className="text-sm font-semibold text-slate-900 hover:underline">
          View all
        </a>
      </div>
    </div>
  )
}

export default RecentProducts
