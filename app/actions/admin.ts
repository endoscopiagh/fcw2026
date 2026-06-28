"use server";

import { revalidatePath } from "next/cache";
import { MatchPhase, MatchStatus, UserRole } from "@prisma/client";
import { z } from "zod";

import { getCurrentSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { recalculatePredictionsForMatch } from "@/lib/domain/predictions";

function formDataBool(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

async function assertAdminAction() {
  const session = await getCurrentSessionFromCookies();
  if (!session) {
    throw new Error("No autorizado.");
  }

  const user = await prisma.users.findUnique({
    where: { id: session.sub },
    select: { id: true, role: true, is_active: true },
  });

  if (!user || user.role !== "admin" || !user.is_active) {
    throw new Error("No autorizado.");
  }

  return user;
}

const createUserSchema = z.object({
  username: z.string().trim().min(3).max(40),
  display_name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(100),
  role: z.nativeEnum(UserRole),
  is_active: z.boolean(),
  has_paid: z.boolean(),
});

export async function createUserAction(formData: FormData): Promise<void> {
  await assertAdminAction();

  const parsed = createUserSchema.safeParse({
    username: formData.get("username"),
    display_name: formData.get("display_name"),
    password: formData.get("password"),
    role: formData.get("role"),
    is_active: formDataBool(formData.get("is_active")),
    has_paid: formDataBool(formData.get("has_paid")),
  });

  if (!parsed.success) {
    throw new Error("Datos inválidos para crear usuario.");
  }

  const password_hash = await hashPassword(parsed.data.password);

  await prisma.users.create({
    data: {
      username: parsed.data.username,
      display_name: parsed.data.display_name,
      password_hash,
      role: parsed.data.role,
      is_active: parsed.data.is_active,
      has_paid: parsed.data.has_paid,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

const updateUserSchema = z.object({
  user_id: z.string().min(1),
  display_name: z.string().trim().min(2).max(80),
  role: z.nativeEnum(UserRole),
  is_active: z.boolean(),
  has_paid: z.boolean(),
});

export async function updateUserAction(formData: FormData): Promise<void> {
  const adminUser = await assertAdminAction();

  const parsed = updateUserSchema.safeParse({
    user_id: formData.get("user_id"),
    display_name: formData.get("display_name"),
    role: formData.get("role"),
    is_active: formDataBool(formData.get("is_active")),
    has_paid: formDataBool(formData.get("has_paid")),
  });

  if (!parsed.success) {
    throw new Error("Datos inválidos para actualizar usuario.");
  }

  if (
    parsed.data.user_id === adminUser.id &&
    (parsed.data.role !== "admin" || parsed.data.is_active === false)
  ) {
    throw new Error("No puedes quitarte permisos admin o desactivarte.");
  }

  await prisma.users.update({
    where: { id: parsed.data.user_id },
    data: {
      display_name: parsed.data.display_name,
      role: parsed.data.role,
      is_active: parsed.data.is_active,
      has_paid: parsed.data.has_paid,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

const resetPasswordSchema = z.object({
  user_id: z.string().min(1),
  new_password: z.string().min(8).max(100),
});

export async function resetUserPasswordAction(formData: FormData): Promise<void> {
  await assertAdminAction();

  const parsed = resetPasswordSchema.safeParse({
    user_id: formData.get("user_id"),
    new_password: formData.get("new_password"),
  });

  if (!parsed.success) {
    throw new Error("Datos inválidos para resetear contraseña.");
  }

  const password_hash = await hashPassword(parsed.data.new_password);

  await prisma.users.update({
    where: { id: parsed.data.user_id },
    data: {
      password_hash,
    },
  });

  revalidatePath("/admin/users");
}

const updateMatchSchema = z.object({
  match_id: z.string().min(1),
  home_score: z.number().int().min(0),
  away_score: z.number().int().min(0),
  advancing_side: z.enum(["HOME", "AWAY"]).optional(),
});

function parseScore(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

export async function updateMatchResultAction(formData: FormData): Promise<void> {
  await assertAdminAction();

  const parsed = updateMatchSchema.safeParse({
    match_id: formData.get("match_id"),
    home_score: parseScore(formData.get("home_score")),
    away_score: parseScore(formData.get("away_score")),
    advancing_side: formData.get("advancing_side") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Datos inválidos para actualizar resultado.");
  }

  const match = await prisma.matches.findUnique({
    where: { id: parsed.data.match_id },
    select: { phase: true },
  });

  if (!match) {
    throw new Error("Partido no encontrado.");
  }

  const requiresAdvancingSide = match.phase !== "GROUP_STAGE";
  if (requiresAdvancingSide && !parsed.data.advancing_side) {
    throw new Error("Debes seleccionar qué equipo avanza en fase eliminatoria.");
  }

  await prisma.matches.update({
    where: { id: parsed.data.match_id },
    data: {
      home_score: parsed.data.home_score,
      away_score: parsed.data.away_score,
      advancing_side: requiresAdvancingSide ? parsed.data.advancing_side : null,
      status: MatchStatus.finished,
    },
  });

  await recalculatePredictionsForMatch(parsed.data.match_id);

  revalidatePath("/admin");
  revalidatePath("/admin/results");
  revalidatePath("/dashboard");
  revalidatePath("/partidos");
  revalidatePath("/leaderboard");
}

const phaseLockSchema = z.object({
  phase: z.nativeEnum(MatchPhase),
  is_enabled: z.boolean(),
});

export async function updatePhaseLockAction(formData: FormData): Promise<void> {
  await assertAdminAction();

  const parsed = phaseLockSchema.safeParse({
    phase: formData.get("phase"),
    is_enabled: formDataBool(formData.get("is_enabled")),
  });

  if (!parsed.success) {
    throw new Error("Datos inválidos para bloqueo de fase.");
  }

  await prisma.phase_locks.upsert({
    where: { phase: parsed.data.phase },
    update: { is_enabled: parsed.data.is_enabled },
    create: {
      phase: parsed.data.phase,
      is_enabled: parsed.data.is_enabled,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/results");
}
