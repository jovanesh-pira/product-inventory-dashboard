import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export const productStatusSchema = z.enum(["active", "draft", "archived"]);

export const productCreateSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),

  stock: z.coerce
    .number()
    .int({ message: "Stock must be an integer" })
    .min(0, { message: "Stock cannot be negative" }),
  price: z.coerce
    .number()
    .positive({ message: "Price must be positive" })
    .finite({ message: "Enter a valid number" })
    .min(1, { message: "Minimum price is 1" })
    .int({ message: "Price must be an integer" }),
  description: z.string().min(10),
  status: z.enum(["active", "draft", "archived"]),
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

// this type just only for the input value when we trying typing some thing
// it can be number or string so mabey we know that can be number/ string
// and the RFH is just controlling the inputs and thats so the value of the input is validation
// with the Zod but as u see in the top Schema is force the input value (string || number ) converted to
// number so that all the story need devide the 2 type
// type of valuse of the input
// type of the output that vaidated with zod
export type ProductCreateFormValues = z.input<typeof productCreateSchema>;

export type ProductCreateData = z.output<typeof productCreateSchema>;

// ____________________________________________|
export const ProductDomainSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),

  stock: z.number().int().min(0),
  price: z.number().int().min(1),

  description: z.string().min(10),
  status: productStatusSchema,

  imageUrl: z.string().url().optional().nullable(), // ✅ به جای File
  imagePath: z.string().optional().nullable(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export const CreateProductSchema_v2 = ProductDomainSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  imageUrl: true,
}).extend({
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().int().min(1),
  image: z
    .custom<FileList | null>()
    .optional()
    .nullable()
    .refine(
      (f) => !f || f.length === 0 || f?.[0].size <= 2 * 1024 * 1024,
      "Image must lessthen 2Mb",
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ["image/png", "image/jpeg"].includes(files[0].type as any),
      "Image must be PNG or JPG.",
    ),
});

export const UpdateProductSchema_v2 = CreateProductSchema_v2.partial();
