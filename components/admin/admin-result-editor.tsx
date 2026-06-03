import { MatchStatus } from "@prisma/client";

import { updateMatchResultAction } from "@/app/actions/admin";
import { Flag } from "@/components/ui/flag";

type AdminResultEditorProps = {
  match: {
    id: string;
    match_number: number;
    status: MatchStatus;
    phase: string;
    group_letter: string | null;
    kickoff_at: Date;
    home_score: number | null;
    away_score: number | null;
    home_team: { name: string; flag_emoji: string } | null;
    away_team: { name: string; flag_emoji: string } | null;
  };
};

const STATUS_OPTIONS: MatchStatus[] = ["scheduled", "open", "closed", "finished"];

export function AdminResultEditor({ match }: AdminResultEditorProps) {
  return (
    <form action={updateMatchResultAction} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <input type="hidden" name="match_id" value={match.id} />
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">Partido #{match.match_number}</p>
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
            {match.phase}
            {match.group_letter ? ` • Grupo ${match.group_letter}` : ""} •{" "}
            {match.kickoff_at.toLocaleString("es-MX")}
          </p>
        </div>
        <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs uppercase text-zinc-300">
          {match.status}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm text-zinc-300">
          Local
          <input
            type="number"
            min={0}
            name="home_score"
            defaultValue={match.home_score ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="text-sm text-zinc-300">
          Visitante
          <input
            type="number"
            min={0}
            name="away_score"
            defaultValue={match.away_score ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="text-sm text-zinc-300 sm:col-span-2">
          Estado
          <select
            name="status"
            defaultValue={match.status}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
      >
        Guardar resultado
      </button>
    </form>
  );
}
