import * as z from "zod"


export const loginSchema
=z.object({
    email:z.string().min(1,{message:"email is requered !"}).email({message:"email is not valid !!"}),
    password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
})

export const registerSchema = loginSchema.extend({
  username: z.string().min(3, "حداقل ۳ کاراکتر"),
});
export type registerInput=z.infer<typeof  registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

