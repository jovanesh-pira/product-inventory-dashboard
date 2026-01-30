import { z } from "zod";

export const productStatusSchema = z.enum(["active", "draft", "archived"]);

export const productCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  sku: z.string().min(2, "SKU must be at least 2 characters."),
  category: z.string().min(2, "Category must be at least 2 characters."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  stock: z.coerce
    .number()
    .int("Stock must be an integer.")
    .min(0, "Stock cannot be negative."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  status: productStatusSchema,
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 2 * 1024 * 1024, "Image must be <= 2MB.")
    .refine(
      (file) => !file || ["image/png", "image/jpeg"].includes(file.type),
      "Image must be PNG or JPG."
    ),
});
