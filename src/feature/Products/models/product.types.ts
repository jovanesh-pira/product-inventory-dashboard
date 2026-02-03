import type { FieldValue, Timestamp } from "firebase/firestore";
import type { z } from "zod";

import {
    productBaseSchema,
    productCreateSchema,
    productStatusSchema,
    productUpdateSchema,
} from "./product.schema";

/**
 * Product status enum type
 */
export type ProductStatus = z.infer<typeof productStatusSchema>;

/**
 * Core product fields shared across forms and database
 */
export type ProductBase = z.infer<typeof productBaseSchema>;

/**
 * Form values for creating a product (used with react-hook-form)
 */
export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;

/**
 * Input type for updating a product
 */
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

/**
 * Firestore product document (stored data)
 */
export type ProductDoc = ProductBase & {
    ownerId: string;
    imageUrl?: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
};

/**
 * Product entity returned from Firestore (document + id)
 */
export type Product = ProductDoc & { id: string };
