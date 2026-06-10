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
    home_score: number | null;
    away_score: number | null;
    home_team: { name: string; flag_emoji: string } | null;
    away_team: { name: string; flag_emoji: string } | null;
    predictions: Array<{
      id: string;
      predicted_home_score: number;
      predicted_away_score: number;
      points: number;
      is_exact: boolean;
      is_result_correct: boolean;
      created_at: Date;
      user: {
        display_name: string;
        username: string;
      };
    }>;
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
            {match.group_letter ? ` • Grupo ${match.group_letter}` : ""}
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

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
        <p className="text-sm font-semibold text-zinc-100">Predicciones registradas</p>
        {match.predictions.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-500">Aún no hay predicciones para este partido.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {match.predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300"
              >
                <p className="font-medium text-zinc-200">
                  {prediction.user.display_name} ({prediction.user.username})
                </p>
                <p>
                  Predicción:{" "}
                  <span className="font-semibold text-zinc-100">
                    {prediction.predicted_home_score} - {prediction.predicted_away_score}
                  </span>
                </p>
                {match.status === "finished" ? (
                  <p>
                    Puntos: <span className="font-semibold text-emerald-300">{prediction.points}</span>
                    {prediction.is_exact ? " • Exacto" : ""}
                    {!prediction.is_exact && prediction.is_result_correct ? " • Resultado correcto" : ""}
                  </p>
                ) : (
                  <p className="text-zinc-400">Puntos: Pendiente</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
