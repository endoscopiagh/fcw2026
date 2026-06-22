import Link from "next/link";
import { MatchPhase } from "@prisma/client";

import { MatchCard } from "@/components/matches/match-card";
import { UserShell } from "@/components/layout/user-shell";
import { requireAuth } from "@/lib/auth/guards";
import { PHASE_LABELS_ES } from "@/lib/constants/tournament";
import { prisma } from "@/lib/db/prisma";
import { canUserPredict, isMatchPredictionClosed } from "@/lib/domain/deadlines";

type PartidosPageProps = {
  searchParams: Promise<{
    view?: "todos" | "pendientes" | "finalizados";
    group?: string;
    phase?: MatchPhase;
  }>;
};

function normalizeGroup(group?: string): string | undefined {
  if (!group) return undefined;
  const upper = group.toUpperCase();
  return /^[A-L]$/.test(upper) ? upper : undefined;
}

function normalizePhase(phase?: MatchPhase): MatchPhase | undefined {
  if (!phase) return undefined;
  return Object.values(MatchPhase).includes(phase) ? phase : undefined;
}

export default async function PartidosPage({ searchParams }: PartidosPageProps) {
  const user = await requireAuth();
  const { view = "todos", group, phase } = await searchParams;
  const selectedGroup = normalizeGroup(group);
  const selectedPhase = normalizePhase(phase);

  const [phaseLocks, matches] = await Promise.all([
    prisma.phase_locks.findMany(),
    prisma.matches.findMany({
      where: {
        ...(selectedGroup ? { group_letter: selectedGroup } : {}),
        ...(selectedPhase ? { phase: selectedPhase } : {}),
      },
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
            user: {
              select: {
                display_name: true,
              },
            },
            predicted_home_score: true,
            predicted_away_score: true,
            points: true,
            is_exact: true,
            is_result_correct: true,
          },
        },
      },
      orderBy: [{ match_number: "asc" }],
    }),
  ]);

  const filteredMatches = matches.filter((match) => {
    const isFinished = match.home_score !== null && match.away_score !== null;
    if (view === "finalizados") return isFinished;
    if (view === "pendientes") return !isFinished;
    return true;
  });

  const groupLetters = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));

  return (
    <UserShell
      title="Partidos"
      subtitle="Listado completo con filtros, resultados y tu predicción."
      userDisplayName={user.display_name}
      showAdminLink={user.role === "admin"}
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <h2 className="mb-3 text-lg font-semibold">Filtros</h2>

          <div className="mb-3 flex flex-wrap gap-2">
            {[
              { id: "todos", label: "Todos" },
              { id: "pendientes", label: "Pendientes" },
              { id: "finalizados", label: "Finalizados" },
            ].map((item) => (
              <Link
                key={item.id}
                href={`/partidos?view=${item.id}${selectedGroup ? `&group=${selectedGroup}` : ""}${selectedPhase ? `&phase=${selectedPhase}` : ""}`}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  view === item.id
                    ? "border-emerald-500 text-emerald-300"
                    : "border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <Link
              href={`/partidos?view=${view}${selectedPhase ? `&phase=${selectedPhase}` : ""}`}
              className={`rounded-lg border px-3 py-1 text-xs transition ${
                !selectedGroup
                  ? "border-emerald-500 text-emerald-300"
                  : "border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
              }`}
            >
              Todos los grupos
            </Link>
            {groupLetters.map((letter) => (
              <Link
                key={letter}
                href={`/partidos?view=${view}&group=${letter}${selectedPhase ? `&phase=${selectedPhase}` : ""}`}
                className={`rounded-lg border px-3 py-1 text-xs transition ${
                  selectedGroup === letter
                    ? "border-emerald-500 text-emerald-300"
                    : "border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
                }`}
              >
                Grupo {letter}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/partidos?view=${view}${selectedGroup ? `&group=${selectedGroup}` : ""}`}
              className={`rounded-lg border px-3 py-1 text-xs transition ${
                !selectedPhase
                  ? "border-emerald-500 text-emerald-300"
                  : "border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
              }`}
            >
              Todas las fases
            </Link>
            {Object.values(MatchPhase).map((phaseValue) => (
              <Link
                key={phaseValue}
                href={`/partidos?view=${view}${selectedGroup ? `&group=${selectedGroup}` : ""}&phase=${phaseValue}`}
                className={`rounded-lg border px-3 py-1 text-xs transition ${
                  selectedPhase === phaseValue
                    ? "border-emerald-500 text-emerald-300"
                    : "border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
                }`}
              >
                {PHASE_LABELS_ES[phaseValue]}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {filteredMatches.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-zinc-400">
              No hay partidos para los filtros seleccionados.
            </p>
          ) : (
            filteredMatches.map((match) => {
              const prediction = match.predictions.find((item) => item.user_id === user.id);
              const closed = isMatchPredictionClosed(match);
              const canPredict = canUserPredict({
                user,
                match,
                phaseLocks,
              });
              const hasFinalScore = match.home_score !== null && match.away_score !== null;
              const predictionStateLabel =
                hasFinalScore
                  ? "finalizado"
                  : closed || !canPredict
                    ? "cerrado"
                    : "abierto";

              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={prediction}
                  predictionStateLabel={predictionStateLabel}
                  communityPredictions={match.predictions.map((item) => ({
                    userDisplayName: item.user.display_name,
                    predictedHomeScore: item.predicted_home_score,
                    predictedAwayScore: item.predicted_away_score,
                    points: item.points,
                    isExact: item.is_exact,
                    isResultCorrect: item.is_result_correct,
                  }))}
                />
              );
            })
          )}
        </section>
      </div>
    </UserShell>
  );
}
