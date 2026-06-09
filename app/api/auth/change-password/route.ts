import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSessionFromCookies } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "La contraseña actual no es válida."),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirma la nueva contraseña."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "La confirmación no coincide con la nueva contraseña.",
    path: ["confirmPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "La nueva contraseña debe ser distinta a la actual.",
    path: ["newPassword"],
  });

export async function POST(request: Request) {
  const session = await getCurrentSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        message: "No autorizado.",
      },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
      },
      { status: 400 },
    );
  }

  const user = await prisma.users.findUnique({
    where: { id: session.sub },
    select: { id: true, password_hash: true, is_active: true, has_paid: true },
  });

  if (!user || !user.is_active || !user.has_paid) {
    return NextResponse.json(
      {
        ok: false,
        message: "No autorizado.",
      },
      { status: 401 },
    );
  }

  const isCurrentPasswordValid = await verifyPassword(
    parsed.data.currentPassword,
    user.password_hash,
  );
  if (!isCurrentPasswordValid) {
    return NextResponse.json(
      {
        ok: false,
        message: "La contraseña actual es incorrecta.",
      },
      { status: 400 },
    );
  }

  const nextPasswordHash = await hashPassword(parsed.data.newPassword);
  await prisma.users.update({
    where: { id: user.id },
    data: { password_hash: nextPasswordHash },
  });

  return NextResponse.json({
    ok: true,
    message: "Contraseña actualizada correctamente.",
  });
}
