import { prisma } from "@/lib/db/prisma";
import { calculatePredictionPoints } from "@/lib/domain/scoring";

export async function recalculatePredictionsForMatch(matchId: string): Promise<void> {
  const match = await prisma.matches.findUnique({
    where: { id: matchId },
    include: { predictions: true },
  });

  if (!match || match.home_score === null || match.away_score === null) {
    return;
  }

  await Promise.all(
    match.predictions.map((prediction) => {
      const result = calculatePredictionPoints(
        {
          homeScore: prediction.predicted_home_score,
          awayScore: prediction.predicted_away_score,
        },
        {
          homeScore: match.home_score as number,
          awayScore: match.away_score as number,
        },
        {
          isKnockout: match.phase !== "GROUP_STAGE",
          predictedAdvancingSide: prediction.predicted_advancing_side,
          actualAdvancingSide: match.advancing_side,
        },
      );

      return prisma.predictions.update({
        where: { id: prediction.id },
        data: {
          points: result.points,
          is_exact: result.isExact,
          is_result_correct: result.isResultCorrect,
        },
      });
    }),
  );
}

export async function getLeaderboardRows() {
  const leaderboard = await prisma.users.findMany({
    where: {
      is_active: true,
      has_paid: true,
      role: "user",
    },
    select: {
      id: true,
      username: true,
      display_name: true,
      predictions: {
        select: {
          points: true,
          is_exact: true,
          is_result_correct: true,
        },
      },
    },
  });

  return leaderboard
    .map((user) => {
      const puntos = user.predictions.reduce((acc, prediction) => acc + prediction.points, 0);
      const exactos = user.predictions.filter((prediction) => prediction.is_exact).length;
      const resultadosCorrectos = user.predictions.filter(
        (prediction) => prediction.is_result_correct,
      ).length;

      return {
        userId: user.id,
        username: user.username,
        displayName: user.display_name,
        puntos,
        exactos,
        resultadosCorrectos,
        prediccionesRealizadas: user.predictions.length,
      };
    })
    .sort(
      (a, b) =>
        b.puntos - a.puntos ||
        b.exactos - a.exactos ||
        b.resultadosCorrectos - a.resultadosCorrectos ||
        a.displayName.localeCompare(b.displayName),
    )
    .map((entry, index) => ({
      posicion: index + 1,
      ...entry,
    }));
}
