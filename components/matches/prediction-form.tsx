"use client";

import { useMemo, useState } from "react";

import { savePredictionAction } from "@/app/actions/predictions";

type PredictionFormProps = {
  matchId: string;
  disabled: boolean;
  isKnockout: boolean;
  homeTeamName: string;
  awayTeamName: string;
  defaultHomeScore?: number;
  defaultAwayScore?: number;
  defaultAdvancingSide?: "HOME" | "AWAY" | null;
};

export function PredictionForm({
  matchId,
  disabled,
  isKnockout,
  homeTeamName,
  awayTeamName,
  defaultHomeScore,
  defaultAwayScore,
  defaultAdvancingSide,
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(defaultHomeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(defaultAwayScore?.toString() ?? "");
  const [manualAdvancingSide, setManualAdvancingSide] = useState<"HOME" | "AWAY" | "">(
    defaultAdvancingSide ?? "",
  );

  const autoAdvancingSide = useMemo(() => {
    if (!isKnockout || homeScore === "" || awayScore === "") {
      return null;
    }

    const home = Number(homeScore);
    const away = Number(awayScore);
    if (Number.isNaN(home) || Number.isNaN(away) || home === away) {
      return null;
    }

    return home > away ? "HOME" : "AWAY";
  }, [awayScore, homeScore, isKnockout]);

  const isTie = isKnockout && autoAdvancingSide === null;

  return (
    <form action={savePredictionAction} className="grid gap-2 sm:grid-cols-4">
      <input type="hidden" name="match_id" value={matchId} />

      <label className="text-sm text-zinc-300">
        Local
        <input
          type="number"
          name="predicted_home_score"
          min={0}
          max={30}
          required
          value={homeScore}
          onChange={(event) => setHomeScore(event.target.value)}
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
          value={awayScore}
          onChange={(event) => setAwayScore(event.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 disabled:opacity-50"
        />
      </label>

      {isKnockout ? (
        <>
          {autoAdvancingSide ? (
            <input type="hidden" name="predicted_advancing_side" value={autoAdvancingSide} />
          ) : null}
          <label className="text-sm text-zinc-300">
            Avanza
            <select
              name={isTie ? "predicted_advancing_side" : undefined}
              required={isTie}
              value={autoAdvancingSide ?? manualAdvancingSide}
              onChange={(event) =>
                setManualAdvancingSide(event.target.value as "HOME" | "AWAY" | "")
              }
              disabled={disabled || !isTie}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 disabled:opacity-50"
            >
              <option value="" disabled>
                Selecciona
              </option>
              <option value="HOME">{homeTeamName}</option>
              <option value="AWAY">{awayTeamName}</option>
            </select>
            {!isTie ? (
              <span className="mt-1 block text-xs text-zinc-500">
                Se asigna automáticamente por el marcador (solo editable en empate).
              </span>
            ) : null}
          </label>
        </>
      ) : null}

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
