import { z } from "zod";

export const productStatusSchema = z.enum(["active", "draft", "archived"]);

export const productCreateSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),

  // input ممکنه string باشه، output number میشه
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),

  description: z.string().min(10),
  status: productStatusSchema,

  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 2 * 1024 * 1024,
      "Image must be <= 2MB.",
    )
    .refine(
      (file) => !file || ["image/png", "image/jpeg"].includes(file.type),
      "Image must be PNG or JPG.",
    ),
});

// ✅ type ورودی فرم (قبل از coerce)
export type ProductCreateFormValues = z.input<typeof productCreateSchema>;

// ✅ type داده‌ی نهایی بعد از validate (بعد از coerce)
export type ProductCreateData = z.output<typeof productCreateSchema>; // یا z.infer
