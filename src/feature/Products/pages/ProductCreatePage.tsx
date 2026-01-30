
import { useState ,useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { productCreateSchema } from "../shcemas/product.schema";
import type { ProductCreateInput } from "../types/types";
import { useCreateProduct } from "../hooks/useCreateProduct";

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const [preview, setPreview] =   useState<string | null>(null);
  const inputId = "product-image";
  const { createProduct, loading, error } = useCreateProduct();
  useEffect(() => {
  return () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };
}, [preview]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      status: "active",
      price: 0,
      stock: 0,
      name: "",
      sku: "",
      category: "",
      description: "",
    },
  });

  const onSubmit = async (values: ProductCreateInput) => {
    await createProduct(values);
    navigate("/app/products", { replace: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Add Product</h1>
          <p className="text-sm text-slate-500">Create a new product item</p>
        </div>

        <Link
          to="/app/products"
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900 mb-4">Product info</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                  {...register("name")}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SKU-123"
                  {...register("sku")}
                />
                {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Electronics"
                  {...register("category")}
                />
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    {...register("price")}
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    {...register("stock")}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full min-h-30 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write product details..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
         {/* State of Product select */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900 mb-4">Status</p>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              {...register("status")}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center">
            

              

              <label
  htmlFor={inputId}
  className="block rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition"
        >
  {preview ? (
    <img
      src={preview}
      alt="Product preview"
      className="w-40 h-40 mx-auto mb-5 rounded-2xl object-cover"
    />
  ) : (
    <div className="w-25 h-25 rounded-2xl mx-auto mb-5 bg-slate-200" />
  )}
  <p className="text-sm text-slate-700 font-medium">Upload product image</p>
  <p className="text-xs text-slate-500 mt-1">PNG/JPG up to 2MB</p>

 
  <input
    id={inputId}
    type="file"
    accept="image/png,image/jpeg"
    className="sr-only"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setValue("image", file, { shouldValidate: true });
      console.log(file)
      const url = URL.createObjectURL(file);
      setPreview(url);
    }}
  />

  {errors.image && (
    <p className="mt-2 text-xs text-red-600">{errors.image.message}</p>
  )}
</label>
              
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={[
              "w-full rounded-xl py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2",
              loading
                ? "bg-slate-300 text-slate-700 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800",
            ].join(" ")}
          >
            {loading && (
              <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            )}
            {loading ? "Saving..." : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
