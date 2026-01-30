import type { Timestamp } from "firebase/firestore";
import * as z from "zod"
import {productStatusSchema,productCreateSchema} from "../shcemas/product.schema"


export type ProductDoc = {
  ownerId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Product = ProductDoc & { id: string };


export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;