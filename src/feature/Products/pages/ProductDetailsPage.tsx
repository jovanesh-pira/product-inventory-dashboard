// src/feature/Products/pages/ProductDetailsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Product } from "@/feature/Products/serviseces/products.firebase";
import { getProductById } from "@/feature/Products/serviseces/products.firebase";

function formatTimestamp(ts?: { toDate: () => Date } | null) {
  if (!ts) return "-";
  const d = ts.toDate()
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeId = useMemo(() => (id ?? "").trim(), [id]);

  useEffect(() => {
    // the componnet still alive so make sure that state not get value after leaving page or component before mount
    let isMounted = true; 

    async function run() {
      if (!safeId) {
        setError("Invalid product id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const product = await getProductById(safeId);
        if (!isMounted) return;

        setData(product);
      } catch (e) {
        if (!isMounted) return;
        const message = e instanceof Error ? e.message : "Something went wrong";
        setError(message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      isMounted = false;
    };
  }, [safeId]);

  // 
  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="mt-4 h-48 w-full rounded-xl bg-slate-100" />
          <div className="mt-4 grid gap-3">
            <div className="h-3 w-64 rounded bg-slate-100" />
            <div className="h-3 w-56 rounded bg-slate-100" />
            <div className="h-3 w-48 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-slate-900">Product</h1>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              Back
            </button>
          </div>

          <p className="mt-4 text-sm text-rose-600">{error}</p>

          <div className="mt-6">
            <Link
              to="/app/products"
              className="text-sm font-semibold text-slate-900 hover:underline"
            >
              Go to products list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            <Link to="/app/products" className="hover:underline">
              Products
            </Link>{" "}
            <span className="px-1">/</span>
            <span className="text-slate-700">{data.name}</span>
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{data.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Back
          </button>

          <Link
            to={`/app/products/${data.id}/edit`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-1">
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt={data.name}
              className="h-72 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
              No image
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Status</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Stock</p>
              <p className="text-sm font-semibold text-slate-900">{data.stock}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Details</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">SKU</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{data.sku}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Price</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">${data.price}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Created</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {
                formatTimestamp(data.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Updated</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatTimestamp(data.updatedAt)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Product ID: <span className="font-mono text-slate-700">{data.id}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
