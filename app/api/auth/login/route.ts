import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { createSessionCookie, signSessionToken } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Datos inválidos.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const user = await prisma.users.findUnique({
    where: { username: parsed.data.username },
  });

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Usuario o contraseña incorrectos.",
      },
      { status: 401 },
    );
  }

  const isPasswordValid = await verifyPassword(parsed.data.password, user.password_hash);
  if (!isPasswordValid) {
    return NextResponse.json(
      {
        ok: false,
        message: "Usuario o contraseña incorrectos.",
      },
      { status: 401 },
    );
  }

  if (!user.is_active || !user.has_paid) {
    return NextResponse.json(
      {
        ok: false,
        message: "Tu cuenta no está activa. Contacta al administrador.",
      },
      { status: 403 },
    );
  }

  const token = signSessionToken({
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    role: user.role,
  });

  await createSessionCookie(token);

  return NextResponse.json({ ok: true });
}
