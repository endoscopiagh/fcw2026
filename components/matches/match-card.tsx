import type { MatchPhase, MatchStatus } from "@prisma/client";

import { PhaseBadge } from "@/components/matches/phase-badge";
import { Flag } from "@/components/ui/flag";

type MatchCardProps = {
  match: {
    id: string;
    kickoff_at: Date;
    venue: string;
    city: string;
    phase: MatchPhase;
    group_letter: string | null;
    status: MatchStatus;
    home_score: number | null;
    away_score: number | null;
    home_team: { name: string; flag_emoji: string } | null;
    away_team: { name: string; flag_emoji: string } | null;
  };
  prediction?: {
    predicted_home_score: number;
    predicted_away_score: number;
    points: number;
  };
  predictionStateLabel: string;
};

export function MatchCard({ match, prediction, predictionStateLabel }: MatchCardProps) {
  return (
    <article className="glass-panel rounded-xl p-4">
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
          <p className="text-xs text-zinc-500">{match.venue}, {match.city}</p>
        </div>

        <PhaseBadge phase={match.phase} groupLetter={match.group_letter} />
      </div>

      <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/55 px-3 py-2">
          <p className="text-xs text-zinc-500">Resultado real</p>
          <p className="font-semibold text-emerald-400">
            {match.home_score !== null && match.away_score !== null
              ? `${match.home_score} - ${match.away_score}`
              : "Pendiente"}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/55 px-3 py-2">
          <p className="text-xs text-zinc-500">Tu predicción</p>
          <p className="font-semibold text-zinc-100">
            {prediction
              ? `${prediction.predicted_home_score} - ${prediction.predicted_away_score}`
              : "Sin registrar"}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/55 px-3 py-2">
          <p className="text-xs text-zinc-500">Estado</p>
          <p className="font-semibold uppercase text-zinc-100">{predictionStateLabel}</p>
        </div>
      </div>

      {prediction ? (
        <p className="mt-2 text-xs text-zinc-400">Puntos obtenidos en este partido: {prediction.points}</p>
      ) : null}
    </article>
  );
}
