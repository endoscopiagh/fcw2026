import { savePredictionAction } from "@/app/actions/predictions";

type PredictionFormProps = {
  matchId: string;
  disabled: boolean;
  defaultHomeScore?: number;
  defaultAwayScore?: number;
};

export function PredictionForm({
  matchId,
  disabled,
  defaultHomeScore,
  defaultAwayScore,
}: PredictionFormProps) {
  return (
    <form action={savePredictionAction} className="grid gap-2 sm:grid-cols-3">
      <input type="hidden" name="match_id" value={matchId} />

      <label className="text-sm text-zinc-300">
        Local
        <input
          type="number"
          name="predicted_home_score"
          min={0}
          max={30}
          required
          defaultValue={defaultHomeScore ?? ""}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 disabled:opacity-50"
        />
      </label>

      <label className="text-sm text-zinc-300">
        Visitante
        <input
          type="number"
          name="predicted_away_score"
          min={0}
          max={30}
          required
          defaultValue={defaultAwayScore ?? ""}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 disabled:opacity-50"
        />
      </label>

      <button
        type="submit"
        disabled={disabled}
        className="self-end rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Guardar predicción
      </button>
    </form>
  );
}
