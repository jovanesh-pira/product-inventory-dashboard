import { useState } from "react";
import { seedOrdersFromProducts } from "../api/order.api";

export default function OrdersSeedPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  async function seed(count = 10) {
    try {
      setLoading(true);
      setDone(false);

      await seedOrdersFromProducts(count);

      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Seed Orders</h1>
        <p className="text-sm text-gray-500">
          Create sample orders from existing products
        </p>
      </div>

      <button
        disabled={loading}
        onClick={() => seed(10)}
        className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {loading ? "Seeding..." : "Create 10 orders"}
      </button>

      {done && (
        <div className="rounded-2xl border bg-white p-4 text-sm text-green-700">
          ✅ Done! Orders created from existing products.
        </div>
      )}
    </div>
  );
}
