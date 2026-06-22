import { updateMatchResultAction } from "@/app/actions/admin";
import { Flag } from "@/components/ui/flag";

type AdminResultEditorProps = {
  match: {
    id: string;
    match_number: number;
    kickoff_at: Date;
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
      user_updated_at: Date;
      user: {
        display_name: string;
        username: string;
      };
    }>;
  };
};

const ADMIN_AUDIT_TIME_ZONE = "America/Mexico_City";

export function AdminResultEditor({ match }: AdminResultEditorProps) {
  const hasFinalScore = match.home_score !== null && match.away_score !== null;
  const kickoffLabel = match.kickoff_at.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ADMIN_AUDIT_TIME_ZONE,
    timeZoneName: "short",
  });

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
          <p className="text-xs text-zinc-500">Kickoff: {kickoffLabel}</p>
        </div>
        <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs uppercase text-zinc-300">
          {hasFinalScore ? "finalizado" : "pendiente"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-zinc-300">
          Local
          <input
            type="number"
            min={0}
            required
            name="home_score"
            defaultValue={match.home_score ?? 0}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="text-sm text-zinc-300">
          Visitante
          <input
            type="number"
            min={0}
            required
            name="away_score"
            defaultValue={match.away_score ?? 0}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
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
              (() => {
                const isLateSubmission = prediction.user_updated_at > match.kickoff_at;
                const userUpdatedAtLabel = prediction.user_updated_at.toLocaleString("es-MX", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: ADMIN_AUDIT_TIME_ZONE,
                  timeZoneName: "short",
                });

                return (
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
                {isLateSubmission ? (
                  <p className="rounded border border-rose-500/50 bg-rose-950/40 px-2 py-1 text-[11px] font-semibold text-rose-300">
                    Tarde (después del kickoff)
                  </p>
                ) : null}
                {hasFinalScore ? (
                  <p>
                    Puntos: <span className="font-semibold text-emerald-300">{prediction.points}</span>
                    {prediction.is_exact ? " • Exacto" : ""}
                    {!prediction.is_exact && prediction.is_result_correct ? " • Resultado correcto" : ""}
                  </p>
                ) : (
                  <p className="text-zinc-400">Puntos: Pendiente</p>
                )}
                <p className="w-full text-zinc-400">
                  Ult. cambio: {userUpdatedAtLabel}
                </p>
              </div>
                );
              })()
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
