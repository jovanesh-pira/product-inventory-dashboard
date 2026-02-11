import { email, z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "paid",
  "shipped",
  "cancelled",
]);

export const orderSourceSchema = z.enum(["online", "manual", "seed"]);

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().finite().min(0),
  qty: z.number().int().min(1),
  subtotal: z.number().finite().min(0),
});

export const customerInfoSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
 
});

export const orderDocSchema = z.object({
  customer: customerInfoSchema,
  items: z.array(orderItemSchema).min(1),
  totalPrice: z.number().finite().min(0),
  status: orderStatusSchema,
  source: orderSourceSchema,
  createdAt: z.any(),
  updatedAt: z.any(),
});

export const orderDomainSchema = orderDocSchema.extend({
  id: z.string().min(1),
});

export type OrderDomain = z.infer<typeof orderDomainSchema>;
export type OrderDocInput = z.infer<typeof orderDocSchema>;
