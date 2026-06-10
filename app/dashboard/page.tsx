import Link from "next/link";

import { RankDisplay } from "@/components/dashboard/rank-display";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Flag } from "@/components/ui/flag";
import { UserShell } from "@/components/layout/user-shell";
import { requireAuth } from "@/lib/auth/guards";
import { PHASE_LABELS_ES } from "@/lib/constants/tournament";
import { prisma } from "@/lib/db/prisma";
import { canUserPredict, getCurrentTournamentPhase } from "@/lib/domain/deadlines";
import { getLeaderboardRows } from "@/lib/domain/predictions";

export default async function DashboardPage() {
  const user = await requireAuth();

  const [phaseLocks, openMatches, userPredictions, leaderboard, firstMatch, activeUsersCount, scoredPredictionsCount] =
    await Promise.all([
    prisma.phase_locks.findMany(),
    prisma.matches.findMany({
      where: {
        status: {
          in: ["scheduled", "open"],
        },
      },
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
            id: true,
          },
        },
      },
      orderBy: {
        match_number: "asc",
      },
      take: 8,
    }),
    prisma.predictions.findMany({
      where: { user_id: user.id },
      select: { points: true },
    }),
    getLeaderboardRows(),
      prisma.matches.findFirst({
        orderBy: { kickoff_at: "asc" },
        select: { kickoff_at: true },
      }),
      prisma.users.count({
        where: {
          role: "user",
          is_active: true,
        },
      }),
      prisma.predictions.count({
        where: {
          points: {
            gt: 0,
          },
        },
      }),
    ]);

  const activePhase = getCurrentTournamentPhase(phaseLocks);

  const currentPoints = userPredictions.reduce((acc, item) => acc + item.points, 0);

  const tournamentStartIso = firstMatch?.kickoff_at.toISOString() ?? null;
  const topLeaderboard = leaderboard.slice(0, 5);
  const currentLeaderboardPosition = leaderboard.find((row) => row.userId === user.id)?.posicion ?? null;
  const hasRealRanking = scoredPredictionsCount > 0;
  const rankLabel = hasRealRanking && currentLeaderboardPosition ? `#${currentLeaderboardPosition}` : "-";
  const prizeAmount = activeUsersCount * 500;
  const prizeLabel = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(prizeAmount);

  return (
    <UserShell
      title="Dashboard"
      subtitle="Resumen general de tu quiniela y estado del torneo."
      userDisplayName={user.display_name}
      showAdminLink={user.role === "admin"}
    >
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="glass-panel animate-fade-in-up rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400">Puntos actuales</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{currentPoints}</p>
          </article>
          <article className="glass-panel animate-fade-in-up rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400">Fase activa</p>
            <p className="mt-2 text-xl font-bold text-zinc-100">{PHASE_LABELS_ES[activePhase]}</p>
          </article>
          <article className="glass-panel animate-fade-in-up rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400">Inicia en...</p>
            <p className="mt-2 text-lg font-bold text-zinc-100">
              <CountdownTimer targetDateIso={tournamentStartIso} />
            </p>
          </article>
          <article className="glass-panel animate-fade-in-up rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400">Posición en tabla</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">
              <RankDisplay username={user.username} realRankLabel={rankLabel} />
            </p>
          </article>
          <article className="glass-panel animate-fade-in-up rounded-xl p-4 text-center">
            <p className="text-sm text-zinc-400">PREMIO</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{prizeLabel}</p>
            <p className="mt-1 text-xs text-zinc-500">500.00 MXN x {activeUsersCount} usuarios activos</p>
          </article>
        </section>

        <section className="glass-panel rounded-xl p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Próximos partidos</h2>
            <Link href="/predicciones" className="text-sm text-emerald-400 hover:text-emerald-300">
              Ir a predicciones
            </Link>
          </div>

          {openMatches.length === 0 ? (
            <p className="text-zinc-400">No hay partidos próximos cargados.</p>
          ) : (
            <div className="space-y-3">
              {openMatches.slice(0, 5).map((match) => {
                const alreadyPredicted = match.predictions.length > 0;
                const canPredict = canUserPredict({
                  user,
                  match,
                  phaseLocks,
                });

                return (
                  <article
                    key={match.id}
                    className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/55 px-3 py-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-100">
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

                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">
                      {alreadyPredicted
                        ? "predicción guardada"
                        : canPredict
                          ? "pendiente"
                          : "cerrado"}
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="glass-panel rounded-xl p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Leaderboard resumido</h2>
            <Link href="/leaderboard" className="text-sm text-emerald-400 hover:text-emerald-300">
              Ver completo
            </Link>
          </div>

          {topLeaderboard.length === 0 ? (
            <p className="text-zinc-400">Todavía no hay datos de leaderboard.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-400">
                    <th className="pb-2 pr-3">Pos</th>
                    <th className="pb-2 pr-3">Usuario</th>
                    <th className="pb-2 pr-3 text-center">Resultados</th>
                    <th className="pb-2 pr-3 text-center">Exactos</th>
                    <th className="pb-2 pr-3 text-center">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {topLeaderboard.map((row) => (
                    <tr key={row.userId} className="border-t border-zinc-800 text-zinc-200">
                      <td className="py-2 pr-3">{row.posicion}</td>
                      <td className="py-2 pr-3">{row.displayName}</td>
                      <td className="py-2 pr-3 text-center">{row.resultadosCorrectos}</td>
                      <td className="py-2 pr-3 text-center">{row.exactos}</td>
                      <td className="py-2 pr-3 text-center font-semibold text-emerald-400">{row.puntos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </UserShell>
  );
}
