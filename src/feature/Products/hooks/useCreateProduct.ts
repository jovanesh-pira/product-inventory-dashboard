import { useState } from "react";
import type { ProductCreateInput } from "../types/product.types";
import { createProductDoc, uploadProductImage } from "../api/products.api";

type UseCreateProductResult = {
  createProduct: (values: ProductCreateInput) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export function useCreateProduct(): UseCreateProductResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (values: ProductCreateInput) => {
    setLoading(true);
    setError(null);

    try {
      const { image, ...rest } = values;

      let imageUrl: string | undefined;
      let imagePath: string | undefined;

      if (image) {
        const uploaded = await uploadProductImage(image);
        imageUrl = uploaded.imageUrl;
        imagePath = uploaded.imagePath;
      }

      await createProductDoc({
        data: rest,
        imageUrl,
        imagePath,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { createProduct, loading, error };
}
