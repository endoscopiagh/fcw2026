"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { canUserPredict } from "@/lib/domain/deadlines";
import { calculatePredictionPoints } from "@/lib/domain/scoring";

const predictionSchema = z.object({
  match_id: z.string().min(1),
  predicted_home_score: z.coerce.number().int().min(0).max(30),
  predicted_away_score: z.coerce.number().int().min(0).max(30),
  predicted_advancing_side: z.enum(["HOME", "AWAY"]).optional(),
});

export async function savePredictionAction(formData: FormData): Promise<void> {
  const session = await getCurrentSessionFromCookies();
  if (!session) {
    throw new Error("No autorizado.");
  }

  const parsed = predictionSchema.safeParse({
    match_id: formData.get("match_id"),
    predicted_home_score: formData.get("predicted_home_score"),
    predicted_away_score: formData.get("predicted_away_score"),
    predicted_advancing_side: formData.get("predicted_advancing_side") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Datos inválidos para la predicción.");
  }

  const [user, match, phaseLocks] = await Promise.all([
    prisma.users.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        role: true,
        is_active: true,
        has_paid: true,
      },
    }),
    prisma.matches.findUnique({
      where: { id: parsed.data.match_id },
      select: {
        id: true,
        phase: true,
        kickoff_at: true,
        status: true,
        home_team_id: true,
        away_team_id: true,
        home_score: true,
        away_score: true,
        advancing_side: true,
      },
    }),
    prisma.phase_locks.findMany(),
  ]);

  if (!user || !match) {
    throw new Error("No se encontró el usuario o el partido.");
  }

  const canPredict = canUserPredict({
    user,
    match,
    phaseLocks,
  });

  if (!canPredict) {
    throw new Error("La predicción para este partido ya está cerrada.");
  }

  const requiresAdvancingSide = match.phase !== "GROUP_STAGE";
  if (requiresAdvancingSide && !parsed.data.predicted_advancing_side) {
    throw new Error("Debes seleccionar qué equipo avanza en fase eliminatoria.");
  }

  let points = 0;
  let is_exact = false;
  let is_result_correct = false;
  const userUpdatedAt = new Date();

  if (match.home_score !== null && match.away_score !== null) {
    const scoring = calculatePredictionPoints(
      {
        homeScore: parsed.data.predicted_home_score,
        awayScore: parsed.data.predicted_away_score,
      },
      {
        homeScore: match.home_score,
        awayScore: match.away_score,
      },
      {
        isKnockout: match.phase !== "GROUP_STAGE",
        predictedAdvancingSide: parsed.data.predicted_advancing_side ?? null,
        actualAdvancingSide: match.advancing_side,
      },
    );

    points = scoring.points;
    is_exact = scoring.isExact;
    is_result_correct = scoring.isResultCorrect;
  }

  await prisma.predictions.upsert({
    where: {
      user_id_match_id: {
        user_id: user.id,
        match_id: match.id,
      },
    },
    create: {
      user_id: user.id,
      match_id: match.id,
      predicted_home_score: parsed.data.predicted_home_score,
      predicted_away_score: parsed.data.predicted_away_score,
      predicted_advancing_side: parsed.data.predicted_advancing_side ?? null,
      user_updated_at: userUpdatedAt,
      points,
      is_exact,
      is_result_correct,
    },
    update: {
      predicted_home_score: parsed.data.predicted_home_score,
      predicted_away_score: parsed.data.predicted_away_score,
      predicted_advancing_side: parsed.data.predicted_advancing_side ?? null,
      user_updated_at: userUpdatedAt,
      points,
      is_exact,
      is_result_correct,
    },
  });

  revalidatePath("/predicciones");
  revalidatePath("/dashboard");
  revalidatePath("/partidos");
  revalidatePath("/leaderboard");
}
