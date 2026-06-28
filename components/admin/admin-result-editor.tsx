"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
    advancing_side: "HOME" | "AWAY" | null;
    home_team: { name: string; flag_emoji: string } | null;
    away_team: { name: string; flag_emoji: string } | null;
    _count: {
      predictions: number;
    };
  };
  selectedDate: string;
};

const ADMIN_AUDIT_TIME_ZONE = "America/Mexico_City";

export function AdminResultEditor({ match, selectedDate }: AdminResultEditorProps) {
  const hasFinalScore = match.home_score !== null && match.away_score !== null;
  const isKnockout = match.phase !== "GROUP_STAGE";
  const [homeScore, setHomeScore] = useState((match.home_score ?? 0).toString());
  const [awayScore, setAwayScore] = useState((match.away_score ?? 0).toString());
  const [manualAdvancingSide, setManualAdvancingSide] = useState<"HOME" | "AWAY" | "">(
    match.advancing_side ?? "",
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
            value={homeScore}
            onChange={(event) => setHomeScore(event.target.value)}
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
            value={awayScore}
            onChange={(event) => setAwayScore(event.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
      </div>

      {isKnockout ? (
        <>
          {autoAdvancingSide ? <input type="hidden" name="advancing_side" value={autoAdvancingSide} /> : null}
          <label className="mt-3 block text-sm text-zinc-300">
            Equipo que avanza
            <select
              name={isTie ? "advancing_side" : undefined}
              required={isTie}
              value={autoAdvancingSide ?? manualAdvancingSide}
              onChange={(event) => setManualAdvancingSide(event.target.value as "HOME" | "AWAY" | "")}
              disabled={!isTie}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 disabled:opacity-50"
            >
              <option value="" disabled>
                Selecciona quién avanza
              </option>
              <option value="HOME">{match.home_team?.name ?? "Equipo local"}</option>
              <option value="AWAY">{match.away_team?.name ?? "Equipo visitante"}</option>
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
        className="mt-3 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
      >
        Guardar resultado
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
        <p className="text-sm text-zinc-300">
          Predicciones registradas:{" "}
          <span className="font-semibold text-zinc-100">{match._count.predictions}</span>
        </p>
        <Link
          href={`/admin/results/${match.id}?date=${selectedDate}`}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-emerald-500 hover:text-emerald-300"
        >
          Ver predicciones
        </Link>
      </div>
    </form>
  );
}
