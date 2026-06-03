"use server";

import { prisma } from "@/lib/db/prisma";
import { createSessionCookie, signSessionToken } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/auth";

export type LoginActionResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const rawInput = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los datos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await prisma.users.findUnique({
    where: { username: parsed.data.username },
  });

  if (!user) {
    return {
      ok: false,
      message: "Usuario o contraseña incorrectos.",
    };
  }

  const isPasswordValid = await verifyPassword(parsed.data.password, user.password_hash);
  if (!isPasswordValid) {
    return {
      ok: false,
      message: "Usuario o contraseña incorrectos.",
    };
  }

  if (!user.is_active || !user.has_paid) {
    return {
      ok: false,
      message: "Tu cuenta no está activa. Contacta al administrador.",
    };
  }

  const token = signSessionToken({
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
  });

  await createSessionCookie(token);

  return { ok: true };
}
