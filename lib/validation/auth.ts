import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres.")
    .max(40, "El usuario no puede exceder 40 caracteres."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(100, "La contraseña no puede exceder 100 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;
