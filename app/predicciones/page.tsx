import Link from "next/link";

import { PredictionForm } from "@/components/matches/prediction-form";
import { Flag } from "@/components/ui/flag";
import { UserShell } from "@/components/layout/user-shell";
import { requireAuth } from "@/lib/auth/guards";
import { PHASE_LABELS_ES } from "@/lib/constants/tournament";
import { prisma } from "@/lib/db/prisma";
import { canUserPredict, isMatchPredictionClosed } from "@/lib/domain/deadlines";

export default async function PrediccionesPage() {
  const user = await requireAuth();
  const [phaseLocks, matches, summary] = await Promise.all([
    prisma.phase_locks.findMany(),
    prisma.matches.findMany({
      include: {
        home_team: {
          select: { name: true, flag_emoji: true },
        },
        away_team: {
          select: { name: true, flag_emoji: true },
        },
        predictions: {
          where: { user_id: user.id },
          select: {
            predicted_home_score: true,
            predicted_away_score: true,
            points: true,
            is_exact: true,
            is_result_correct: true,
          },
        },
      },
      orderBy: [{ kickoff_at: "asc" }],
      take: 80,
    }),
    prisma.predictions.aggregate({
      where: { user_id: user.id },
      _sum: { points: true },
      _count: {
        _all: true,
      },
    }),
  ]);

  const userPredictions = await prisma.predictions.findMany({
    where: { user_id: user.id },
    select: { is_exact: true, is_result_correct: true },
  });
  const exactos = userPredictions.filter((item) => item.is_exact).length;
  const resultadosCorrectos = userPredictions.filter((item) => item.is_result_correct).length;
  const puntos = summary._sum.points ?? 0;
  const totalPredicciones = summary._count._all;

  return (
    <UserShell
      title="Predicciones"
      subtitle="Captura marcadores y suma puntos en la quiniela."
      userDisplayName={user.display_name}
      showAdminLink={user.role === "admin"}
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-sm text-zinc-400">Puntos actuales</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{puntos}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-sm text-zinc-400">Marcadores exactos</p>
            <p className="mt-2 text-3xl font-bold text-zinc-100">{exactos}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-sm text-zinc-400">Resultados correctos</p>
            <p className="mt-2 text-3xl font-bold text-zinc-100">{resultadosCorrectos}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
            <p className="text-sm text-zinc-400">Predicciones realizadas</p>
            <p className="mt-2 text-3xl font-bold text-zinc-100">{totalPredicciones}</p>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Tus predicciones por partido</h2>
            <Link
              href="/leaderboard"
              className="text-sm text-emerald-400 transition hover:text-emerald-300"
            >
              Ver leaderboard
            </Link>
          </div>

          <div className="space-y-3">
            {matches.map((match) => {
              const prediction = match.predictions[0];
              const closedByTime = isMatchPredictionClosed(match);
              const canPredict = canUserPredict({
                user,
                match,
                phaseLocks,
              });
              const hasFinalScore = match.home_score !== null && match.away_score !== null;

              const statusLabel =
                hasFinalScore
                  ? "finalizado"
                  : closedByTime
                    ? "cerrado"
                    : "abierto";

              return (
                <article
                  key={match.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-100">
                        <Flag
                          emoji={match.home_team?.flag_emoji}
                          teamName={match.home_team?.name ?? "Equipo local"}
                          className="mr-1"
                        />
                        {match.home_team?.name ?? "Por definir"} vs{" "}
                        <Flag
                          emoji={match.away_team?.flag_emoji}
                          teamName={match.away_team?.name ?? "Equipo visitante"}
                          className="mr-1"
                        />
                        {match.away_team?.name ?? "Por definir"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {PHASE_LABELS_ES[match.phase]}
                        {match.group_letter ? ` • Grupo ${match.group_letter}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs uppercase text-zinc-300">
                      {statusLabel}
                    </span>
                  </div>

                  {match.home_score !== null && match.away_score !== null ? (
                    <p className="mb-3 text-sm text-zinc-300">
                      Resultado real:{" "}
                      <span className="font-semibold text-emerald-400">
                        {match.home_score} - {match.away_score}
                      </span>
                    </p>
                  ) : null}

                  <PredictionForm
                    matchId={match.id}
                    disabled={!canPredict}
                    defaultHomeScore={prediction?.predicted_home_score}
                    defaultAwayScore={prediction?.predicted_away_score}
                  />

                  {prediction ? (
                    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300">
                      <p>
                        Tu predicción:{" "}
                        <span className="font-semibold text-zinc-100">
                          {prediction.predicted_home_score} - {prediction.predicted_away_score}
                        </span>
                      </p>
                      <p className="mt-1">
                        Puntos: <span className="font-semibold text-emerald-400">{prediction.points}</span>
                        {prediction.is_exact ? " • Exacto" : ""}
                        {!prediction.is_exact && prediction.is_result_correct ? " • Resultado correcto" : ""}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </UserShell>
  );
}
