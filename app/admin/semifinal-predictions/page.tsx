import { adminSaveSemifinalPredictionAction } from "@/app/actions/admin";
import { Flag } from "@/components/ui/flag";
import { PredictionForm } from "@/components/matches/prediction-form";
import { prisma } from "@/lib/db/prisma";

const ADMIN_TIME_ZONE = "America/Mexico_City";

function formatDateTime(date: Date): string {
  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ADMIN_TIME_ZONE,
    timeZoneName: "short",
  });
}

function formatScore(
  homeScore: number | null,
  awayScore: number | null,
  advancingSide: "HOME" | "AWAY" | null,
  homeTeamName: string,
  awayTeamName: string,
): string {
  if (homeScore === null || awayScore === null) {
    return "Sin resultado";
  }

  if (homeScore === awayScore && advancingSide) {
    const winner = advancingSide === "HOME" ? homeTeamName : awayTeamName;
    return `${homeScore}-${awayScore} (${winner} avanza)`;
  }

  return `${homeScore}-${awayScore}`;
}

export default async function AdminSemifinalPredictionsPage() {
  const [matches, users] = await Promise.all([
    prisma.matches.findMany({
      where: { phase: "SEMI_FINAL" },
      orderBy: { match_number: "asc" },
      include: {
        home_team: {
          select: { name: true, flag_emoji: true },
        },
        away_team: {
          select: { name: true, flag_emoji: true },
        },
        predictions: {
          select: {
            user_id: true,
            predicted_home_score: true,
            predicted_away_score: true,
            predicted_advancing_side: true,
            points: true,
          },
        },
      },
    }),
    prisma.users.findMany({
      where: {
        role: "user",
        is_active: true,
      },
      orderBy: [{ display_name: "asc" }],
      select: {
        id: true,
        display_name: true,
        username: true,
        has_paid: true,
      },
    }),
  ]);

  const predictionsByUserAndMatch = new Map<string, (typeof matches)[number]["predictions"][number]>();
  for (const match of matches) {
    for (const prediction of match.predictions) {
      predictionsByUserAndMatch.set(`${prediction.user_id}:${match.id}`, prediction);
    }
  }

  const usersMissingAny = users.filter((user) =>
    matches.some((match) => !predictionsByUserAndMatch.has(`${user.id}:${match.id}`)),
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-lg font-semibold">Predicciones retrospectivas — Semifinales</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Captura manual de predicciones enviadas fuera de la app. Al guardar, se recalcula el
          puntaje si el partido ya tiene resultado final.
        </p>
        <p className="mt-2 text-sm text-amber-300">
          {usersMissingAny.length} usuario(s) sin predicción completa en semifinales.
        </p>
      </section>

      {matches.map((match) => {
        const homeTeamName = match.home_team?.name ?? "Por definir";
        const awayTeamName = match.away_team?.name ?? "Por definir";
        const hasFinalScore = match.home_score !== null && match.away_score !== null;

        return (
          <section
            key={match.id}
            className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Partido #{match.match_number}
              </p>
              <h3 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-semibold">
                <Flag emoji={match.home_team?.flag_emoji} teamName={homeTeamName} />
                <span>{homeTeamName}</span>
                <span className="text-zinc-500">vs</span>
                <Flag emoji={match.away_team?.flag_emoji} teamName={awayTeamName} />
                <span>{awayTeamName}</span>
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Kickoff: {formatDateTime(match.kickoff_at)} · Resultado:{" "}
                {formatScore(
                  match.home_score,
                  match.away_score,
                  match.advancing_side,
                  homeTeamName,
                  awayTeamName,
                )}
              </p>
            </div>

            <div className="space-y-3">
              {users.map((user) => {
                const existing = predictionsByUserAndMatch.get(`${user.id}:${match.id}`);
                const hasPrediction = Boolean(existing);

                return (
                  <article
                    key={`${match.id}-${user.id}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-zinc-100">{user.display_name}</p>
                        <p className="text-xs text-zinc-500">@{user.username}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {!user.has_paid ? (
                          <span className="rounded-full border border-amber-700/60 px-2 py-1 text-amber-300">
                            Sin cuota
                          </span>
                        ) : null}
                        <span
                          className={
                            hasPrediction
                              ? "rounded-full border border-emerald-700/60 px-2 py-1 text-emerald-300"
                              : "rounded-full border border-zinc-700 px-2 py-1 text-zinc-400"
                          }
                        >
                          {hasPrediction
                            ? `Registrada · ${existing?.points ?? 0} pts`
                            : "Sin predicción"}
                        </span>
                      </div>
                    </div>

                    <PredictionForm
                      matchId={match.id}
                      userId={user.id}
                      isKnockout
                      homeTeamName={homeTeamName}
                      awayTeamName={awayTeamName}
                      action={adminSaveSemifinalPredictionAction}
                      submitLabel={hasPrediction ? "Actualizar predicción" : "Guardar predicción"}
                      defaultHomeScore={existing?.predicted_home_score}
                      defaultAwayScore={existing?.predicted_away_score}
                      defaultAdvancingSide={existing?.predicted_advancing_side}
                    />
                  </article>
                );
              })}
            </div>

            {!hasFinalScore ? (
              <p className="text-sm text-amber-300">
                Este partido aún no tiene resultado final. La predicción se guardará, pero el
                puntaje se calculará cuando captures el resultado en Resultados.
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
