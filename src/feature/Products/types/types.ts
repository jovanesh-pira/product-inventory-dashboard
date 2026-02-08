import type { Timestamp } from "firebase/firestore";
import * as z from "zod";
import {
  productStatusSchema,
  productCreateSchema,
  ProductDomainSchema,
  CreateProductSchema_v2,
  UpdateProductSchema_v2,
} from "../shcemas/product.schema";

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
  description: string;
};

export type Product = ProductDoc & { id: string };

export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;

// ______________________________V2___________________________________
export type ProductDomainType = z.infer<typeof ProductDomainSchema>;
export type CreateProductType_v2_Input = z.input<typeof CreateProductSchema_v2>;
export type CreateProductType_v2_OutPut = z.output<
  typeof CreateProductSchema_v2
>;

export type UpdateProducType_v2_Input = z.input<typeof UpdateProductSchema_v2>;
export type UpdateProducType_v2_OutPut = z.output<
  typeof UpdateProductSchema_v2
>;

export const ProductFirestoreSchema = ProductDomainSchema.omit({ id: true });

export type ProductFirestore = z.output<typeof ProductFirestoreSchema>;
