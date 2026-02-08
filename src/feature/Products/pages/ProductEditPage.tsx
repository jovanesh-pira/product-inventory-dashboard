// make edit page and get the Product with ID from Params .... !

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "@/lib/firebace";
import {
  type ProductDomainType,
  ProductFirestoreSchema,
  type CreateProductType_v2_Input,
  type UpdateProducType_v2_Input,
} from "../types/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema_v2 } from "../shcemas/product.schema";

function ProductEditPage() {
  const [uploadPct, setUploadPct] = useState(0);
  let DEFAULT_IMAGE_URL = "/placeholder_image.png";
  let navigation = useNavigate();
  const [product, setProduct] = useState<Omit<ProductDomainType, "id"> | null>(
    null,
  );

  const param = useParams();
  // make sure that the ID
  let ID = Validated_ID(param.id);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateProductType_v2_Input>({
    resolver: zodResolver(CreateProductSchema_v2),
  });
  // useEffect Section Start------->
  useEffect(() => {
    let getProduct_single = async () => {
      try {
        let refDoc = doc(db, "products", ID);
        let product_snap = await getDoc(refDoc);
        if (!product_snap.exists()) {
          throw new Error("Product not founded sorry");
        }

        const Product_Parsed = ProductFirestoreSchema.parse(
          product_snap.data(),
        );

        setProduct(Product_Parsed);
        reset({
          name: Product_Parsed?.name,
          sku: Product_Parsed?.sku,
          category: Product_Parsed?.category,
          stock: Product_Parsed?.stock ?? 0,
          price: Product_Parsed?.price,
          description: Product_Parsed?.description,
          status: Product_Parsed?.status,
          image: null,
        });
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct_single();
  }, [ID, reset]);
  // end od useEffect---------------->
  var file = watch("image");
  var preview = file?.[0] ? URL.createObjectURL(file?.[0]) : null;

  const UpdateHandler = async (data: UpdateProducType_v2_Input) => {
    let file_image = data.image ? data.image?.[0] : null;
    var newUploaded: { url: string; path: string } | null = null;
    if (file_image) {
      newUploaded = await UploadImage(file_image, ID, setUploadPct);
    }
    console.log(uploadPct);
    let refDoc = doc(db, "products", ID);
    await updateDoc(refDoc, {
      name: data?.name,
      sku: data?.sku,
      category: data?.category,

      stock: data.stock,
      price: data.price,

      description: data?.description,
      status: data.status,

      imageUrl: newUploaded?.url ?? product?.imageUrl,
      imagePath: newUploaded?.path ?? product?.imagePath,

      updatedAt: serverTimestamp(),
    });

    if (product?.imagePath) {
      await deleteObject(ref(storage, product?.imagePath));
    }
    navigation("/app/products", { replace: true });
  };

  if (isLoadingDoc) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-52 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }
  return (
    <div>
      <form onSubmit={handleSubmit(UpdateHandler)}>
        <div className="space-y-4">
          <div className="flex flex-row">
            <div className=" rounded-2xl">
              <img
                src={preview || product?.imageUrl || DEFAULT_IMAGE_URL}
                alt={product?.name}
                className="w-40 h-40"
              />
              <input
                type="file"
                accept="image/png,image/jpeg"
                {...register("image")}
              />
              {errors?.image && (
                <span className="text-red-500">{errors?.image.message}</span>
              )}
            </div>
            {/* {this is the Date just for showing thats it } */}

            <div className="rounded-lg border p-4">
              <div className="text-sm text-zinc-500">Created at</div>
              <span className="font-medium">
                {product?.createdAt?.toDate?.().toLocaleString?.() ?? "—"}
              </span>

              <div className="mt-3 text-sm text-zinc-500">Updated at</div>
              <span className="font-medium">
                {product?.updatedAt?.toDate?.().toLocaleString?.() ?? "—"}
              </span>
            </div>
          </div>
          {/* image */}

          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <label className="text-sm">Name</label>
              <input
                className="mt-1 w-full rounded-md border p-2"
                {...register("name")}
              />
            </div>

            <div>
              <label className="text-sm">SKU</label>
              <input
                className="mt-1 w-full rounded-md border p-2"
                {...register("sku")}
              />
            </div>

            <div>
              <label className="text-sm">Category</label>
              <input
                className="mt-1 w-full rounded-md border p-2"
                {...register("category")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Stock</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border p-2"
                  {...register("stock")}
                />
              </div>

              <div>
                <label className="text-sm">Price</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border p-2"
                  {...register("price")}
                />
              </div>
            </div>

            <div>
              <label className="text-sm">Description</label>
              <textarea
                className="mt-1 w-full rounded-md border p-2 min-h-30"
                {...register("description")}
              />
            </div>

            <div>
              <label className="text-sm">Status</label>
              <select
                className="mt-1 w-full rounded-md border p-2"
                {...register("status")}
              >
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-500 text-white ">
          Update
        </button>
        <p>{uploadPct}</p>
      </form>
    </div>
  );
}

export default ProductEditPage;

function Validated_ID(id: unknown): string {
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid ID");
  }
  return id.trim();
}

async function UploadImage(
  file: File,
  productId: string,
  onProgress?: (pct: number) => void,
) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `products/${productId}-${Date.now()}.${ext}`;

  let file_ref = ref(storage, path);
  let task_uploading = uploadBytesResumable(file_ref, file);
  return new Promise<{ url: string; path: string }>((resolve, reject) => {
    task_uploading.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(task_uploading.snapshot.ref);
        resolve({ url, path });
      },
    );
  });
}
