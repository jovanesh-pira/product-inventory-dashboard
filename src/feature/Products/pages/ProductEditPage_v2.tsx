import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebace";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  uploadBytes,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

import InputField from "@/Shared/InputField";
import StatusButton from "@/Shared/StatusButton";
// SomeTypes & Some Schema ////////////////////////
import {
  type ProductDomainType,
  type UpdateProducType_v2_Input,
} from "../types/types";
import {
  ProductDomainSchema,
  UpdateProductSchema_v2,
} from "../shcemas/product.schema";

type Status =
  | { state: "idle" } // just normal
  | { state: "loading" }
  | { state: "success" }
  | { state: "error"; scope: "id" | "product" | "network"; message: string };

function ProductEditPage_v2() {
  const navigation = useNavigate();
  const param = useParams();
  const ID = param.id;
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [product, setProduct] = useState<ProductDomainType | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDone, setUploadedDone] = useState(false);

  // UseForm Section & ZOD --------------------------------------
  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateProducType_v2_Input>({
    resolver: zodResolver(UpdateProductSchema_v2),
  });
  async function UpdateHandler(data: UpdateProducType_v2_Input) {
    const safeId = CheckID_isSafe(ID);
    const file = data.image?.[0];

    try {
      let uploaded: { url?: string; path?: string } | null = null;
      setIsUploading(true);
      setProgress(0);
      setUploadedDone(false);
      if (file) {
        uploaded = await UpLoadingImage_FireBase(file, safeId, (p) => {
          setProgress(p);

          if (p >= 100) {
            setUploadedDone(true);
            setTimeout(() => setUploadedDone(false), 2500);
          }
        });
      }

      console.log(uploaded);
      let doc_ref = doc(db, "products", safeId);

      await updateDoc(doc_ref, {
        name: data?.name,
        sku: data?.sku,
        category: data?.category,

        stock: data?.stock,
        price: data?.price,

        description: data?.description,
        status: data?.status,

        imageUrl: uploaded?.url ?? product?.imageUrl,
        imagePath: uploaded?.path ?? product?.imagePath,

        updatedAt: serverTimestamp(),
      });
      navigation("/app/products", { replace: true });
    } catch (err) {
      let error_message =
        err instanceof Error ? err?.message : "Some thing is Wrong";
      console.log(error_message);
    } finally {
      setIsUploading(false);
    }
  }
  // Watch the File and Image and remove the URL everytime  --------------------------------------
  const file = watch("image")?.[0];

  var previewImage = useMemo(() => {
    if (!file && !file) return null;
    return URL.createObjectURL(file);
  }, [file]);
  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);
  // -------------------------------------------------------------
  // ----------------------------------------------------------
  // ____________________________________________________________
  // get SingleProduct with ID
  // Side Effect-------------------------------------------------

  useEffect(() => {
    var inMounted: boolean = true;
    setStatus({ state: "loading" });
    let getProduct_single = async () => {
      try {
        // lets get product 1- ref 2-getDoc with ID
        let safe_id = CheckID_isSafe(ID);
        var doc_ref = doc(db, "products", safe_id);
        var product_response = await getDoc(doc_ref);

        // Check is product and not get me Error to Show
        if (!product_response.exists()) {
          setStatus({
            state: "error",
            scope: "product",
            message: "Product not found",
          });

          return;
        }

        let snapProduct = product_response.data();
        if (!snapProduct) {
          setStatus({
            state: "error",
            scope: "product",
            message: "Product data is corrupted",
          });

          return;
        }

        const parsed = ProductDomainSchema.safeParse({
          id: product_response.id,
          ...snapProduct,
        });

        if (!parsed.success) {
          console.error(parsed.error);
          setStatus({
            state: "error",
            scope: "product",
            message: "Invalid product data structure",
          });
          return;
        }
        reset({
          name: parsed.data?.name,
          sku: parsed.data?.sku,
          category: parsed.data?.category,
          stock: parsed.data?.stock,
          price: parsed.data?.price,
          description: parsed.data?.description,
          status: parsed.data?.status,
        });
        setProduct(parsed.data);
        setStatus({ state: "success" });

        if (!inMounted) return;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setStatus({ state: "error", scope: "id", message });
      } finally {
        inMounted = false;
        setStatus({ state: "success" });
      }
    };
    getProduct_single();
    return () => {
      inMounted = false;
    };
  }, [ID]);

  // -----------------------------------------
  if (status.state === "loading") return <h1>Loading</h1>;
  if (status.state === "error" && status.scope == "product")
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-red-600">
            Product not found
          </h1>

          <p className="mb-6 text-sm text-red-500">{status.message}</p>

          <button
            onClick={() => navigation("/app/products", { replace: true })}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  return (
    <div className="min-h-[80vh] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Inputs */}
          <div className="lg:col-span-7">
            <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Product information
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Edit details. Image is on the right panel.
                </p>
              </div>

              {/* Inputs Form (same handleSubmit) */}
              <form
                onSubmit={handleSubmit(UpdateHandler)}
                className="space-y-6"
              >
                {/* Row 1 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Name"
                    placeholder="e.g. iPhone 15 Pro"
                    disabled={isUploading}
                    error={errors.name?.message as string | undefined}
                    {...register("name")}
                  />

                  <InputField
                    label="SKU"
                    placeholder="e.g. IP15P-256-BLK"
                    disabled={isUploading}
                    error={errors.sku?.message as string | undefined}
                    {...register("sku")}
                  />
                </div>

                {/* Row 2 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    label="Category"
                    placeholder="e.g. Phones"
                    disabled={isUploading}
                    error={errors.category?.message as string | undefined}
                    {...register("category")}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Stock"
                      type="number"
                      placeholder="0"
                      disabled={isUploading}
                      error={errors.stock?.message as string | undefined}
                      {...register("stock")}
                    />

                    <InputField
                      label="Price"
                      type="number"
                      placeholder="1"
                      disabled={isUploading}
                      error={errors.price?.message as string | undefined}
                      {...register("price")}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Status
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <StatusButton
                      title="Active"
                      subtitle="Visible in list"
                      active={watch("status") === "active"}
                      disabled={isUploading}
                      onClick={() =>
                        // اگر setValue داری بهتره، ولی چون register داری از radio هم می‌تونیم استفاده کنیم
                        // اینجا نسخه radio رو پایین گذاشتم
                        null
                      }
                    />
                    <StatusButton
                      title="Draft"
                      subtitle="Hidden for now"
                      active={watch("status") === "draft"}
                      disabled={isUploading}
                      onClick={() => null}
                    />
                  </div>

                  {/* نسخه‌ی درست‌تر برای RHF: radio های مخفی */}
                  <div className="sr-only">
                    <input
                      type="radio"
                      value="active"
                      {...register("status")}
                    />
                    <input type="radio" value="draft" {...register("status")} />
                  </div>

                  {errors.status?.message ? (
                    <p className="mt-2 text-xs text-red-600">
                      {String(errors.status.message)}
                    </p>
                  ) : null}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Description
                  </label>

                  <textarea
                    disabled={isUploading}
                    placeholder="Minimum 10 characters..."
                    className={[
                      "min-h-[160px] w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition",
                      "placeholder:text-slate-400",
                      errors.description
                        ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-100",
                      isUploading ? "opacity-60" : "",
                    ].join(" ")}
                    {...register("description")}
                  />

                  {errors.description?.message ? (
                    <p className="mt-2 text-xs text-red-600">
                      {String(errors.description.message)}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500">
                      Tip: explain what it is, who it’s for, and key specs.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() =>
                      navigation("/app/products", { replace: true })
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Image + Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Update product image
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Upload a new image or keep the current one.
                </p>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-white">
                    <img
                      src={
                        previewImage ??
                        product?.imageUrl ??
                        "/placeholder_image.png"
                      }
                      alt={product?.name ?? "product"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Progress + Uploaded badge */}
                  <div className="mt-4">
                    {isUploading ? (
                      <>
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                          <span>Uploading...</span>
                          <span className="tabular-nums">{progress}%</span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-slate-900 transition-[width] duration-200"
                            style={{
                              width: `${Math.min(100, Math.max(0, progress))}%`,
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          PNG/JPG up to 2MB
                        </p>

                        {uploadedDone ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            Uploaded ✅
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* File input (همون register(image) که داری) */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Choose a new image
                  </label>

                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    disabled={isUploading}
                    {...register("image")}
                    className="block w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700
                  file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-white
                  hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {errors.image?.message ? (
                    <p className="mt-2 text-xs text-red-600">
                      {String(errors.image.message)}
                    </p>
                  ) : null}
                </div>

                {/* Small helper */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Tip for better images
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Use a square image with good lighting. It will look best in
                    your product list.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductEditPage_v2;

// Lets make Some Function to Check ID before used inthe hole program

function CheckID_isSafe(id: string | null | undefined) {
  if (!id) {
    throw new Error("Product ID is missing");
  }
  if (id.trim() === "" || !id.trim()) {
    throw new Error("Product ID is empty");
  }
  return id.trim();
}

async function UpLoadingImage_FireBase(
  file: File,
  id: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string; path: string }> {
  const extImage = file.name.split(".").pop() || "jpg";
  const pathFile = `/products/${id}_${Date.now()}.${extImage}`;
  const refFile = ref(storage, pathFile);
  await uploadBytes(refFile, file);
  let task_uploading = uploadBytesResumable(refFile, file);
  return await new Promise((resolve, reject) => {
    task_uploading.on(
      "state_changed",
      (snap) => {
        let number_progress_cal =
          Math.round(snap.bytesTransferred / snap.totalBytes) * 100;
        onProgress?.(number_progress_cal);
      },
      (error) => reject(error),
      async () => {
        let url = await getDownloadURL(refFile);
        resolve({ url, path: pathFile });
      },
    );
  });
}
