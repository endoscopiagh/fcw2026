import { notFound } from "next/navigation";
import Link from "next/link";

import { GroupStandingsTable } from "@/components/groups/group-standings-table";
import { UserShell } from "@/components/layout/user-shell";
import { MatchCard } from "@/components/matches/match-card";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { canUserPredict, isMatchPredictionClosed } from "@/lib/domain/deadlines";
import { calculateGroupStandings } from "@/lib/domain/standings";

type GroupPageProps = {
  params: Promise<{
    groupLetter: string;
  }>;
};

export default async function GroupDetailsPage({ params }: GroupPageProps) {
  const user = await requireAuth();
  const { groupLetter } = await params;
  const normalizedGroup = groupLetter.toUpperCase();

  if (!/^[A-L]$/.test(normalizedGroup)) {
    notFound();
  }

  const [phaseLocks, teams, matches] = await Promise.all([
    prisma.phase_locks.findMany(),
    prisma.teams.findMany({
      where: { group_letter: normalizedGroup },
      orderBy: { name: "asc" },
      select: { id: true, name: true, flag_emoji: true },
    }),
    prisma.matches.findMany({
      where: {
        phase: "GROUP_STAGE",
        group_letter: normalizedGroup,
      },
      include: {
        home_team: { select: { name: true, flag_emoji: true } },
        away_team: { select: { name: true, flag_emoji: true } },
        predictions: {
          where: { user_id: user.id },
          select: {
            predicted_home_score: true,
            predicted_away_score: true,
            points: true,
          },
        },
      },
      orderBy: { kickoff_at: "asc" },
    }),
  ]);

  if (teams.length === 0) {
    notFound();
  }

  const standings = calculateGroupStandings(
    teams,
    matches.map((match) => ({
      home_score: match.home_score,
      away_score: match.away_score,
      home_team: match.home_team
        ? { id: match.home_team_id as string, name: match.home_team.name, flag_emoji: match.home_team.flag_emoji }
        : null,
      away_team: match.away_team
        ? { id: match.away_team_id as string, name: match.away_team.name, flag_emoji: match.away_team.flag_emoji }
        : null,
    })),
  );

  return (
    <UserShell
      title={`Grupo ${normalizedGroup}`}
      subtitle="Standings, resultados y tus predicciones por grupo."
      userDisplayName={user.display_name}
      showAdminLink={user.role === "admin"}
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tabla de posiciones</h2>
            <Link href="/grupos" className="text-sm text-emerald-400 hover:text-emerald-300">
              Volver a grupos
            </Link>
          </div>
          <GroupStandingsTable rows={standings} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Fixtures y resultados</h2>
          {matches.map((match) => {
            const prediction = match.predictions[0];
            const closed = isMatchPredictionClosed(match);
            const canPredict = canUserPredict({
              user,
              match,
              phaseLocks,
            });
            const stateLabel =
              match.status === "finished" ? "finalizado" : closed || !canPredict ? "cerrado" : "abierto";

            return (
              <MatchCard
                key={match.id}
                match={match}
                prediction={prediction}
                predictionStateLabel={stateLabel}
              />
            );
          })}
        </section>
      </div>
    </UserShell>
  );
}
