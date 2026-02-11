import { z } from "zod";

export const customerDocSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  avatar: z.string().url().optional().nullable(),

  ordersCount: z.number().int().min(0).optional().default(0),

  createdAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(),
  lastOrderAt: z.any().optional(),
});

export const customerDomainSchema = customerDocSchema.extend({
  id: z.string().min(1),
});

export type CustomerDoc = z.infer<typeof customerDocSchema>;
export type CustomerDomain = z.infer<typeof customerDomainSchema>;
