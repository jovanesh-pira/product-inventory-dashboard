import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { GetProductWithId_myver } from "../serviseces/products.firebase";
import { type ProductCreateInput, type Product } from "../types/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productCreateSchema,
  type ProductCreateFormValues,
} from "../shcemas/product.schema";

function ProductEditPage() {
  //________________________ init states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, SetError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductCreateFormValues>({
    resolver: zodResolver(productCreateSchema),
  });
  //_________________________________________________________________________
  //______________get the ID from URL and checked is not to be wrong or empty
  const param = useParams();
  const IDproduct = param.id;
  let SafeId = (IDproduct ?? "").trim();
  // the id of product or document in the firebase is some 20 char and string
  if (!SafeId || SafeId.length < 10) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Product Edit</h1>
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Invalid product id
        </div>
      </div>
    );
  }

  //______________the useEffect Section !!!
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    let get = async () => {
      // mounted status of the component

      try {
        let { doc_snap } = await GetProductWithId_myver(SafeId);
        if (!isMounted) return;

        if (!doc_snap.exists()) {
          SetError("There is no product with this ID sry");
          throw new Error("Product not found");
        }
        const data = doc_snap.data() as Omit<Product, "id">;
        setProduct({
          id: doc_snap.id,
          ...data,
        });
        setLoading(false);
      } catch (err) {
        console.log(err);
        let err_msg =
          err instanceof Error ? err.message : " some thing wrong !!";
        SetError(err_msg);
        setLoading(false);
        if (!isMounted) return;
      } finally {
        setLoading(false);
        if (!isMounted) return;
      }
    };
    get();
    return () => {
      isMounted = false;
    };
  }, [SafeId]);
  //______________ End of useEffect Section
  //_____________________________________________

  return (
    <div>
      this is the ProductEditPage
      {error && <h3 className="text-red-400 font-semibold text-xl">{error}</h3>}
      {loading && <h1>Loading...</h1>}
      <form action="">
        <div className="">
          <label htmlFor=""></label>
        </div>
      </form>
    </div>
  );
}

export default ProductEditPage;
