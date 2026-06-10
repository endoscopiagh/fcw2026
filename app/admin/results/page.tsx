import { MatchPhase } from "@prisma/client";
import Link from "next/link";

import { updatePhaseLockAction } from "@/app/actions/admin";
import { AdminResultEditor } from "@/components/admin/admin-result-editor";
import { PHASE_LABELS_ES, TOURNAMENT_PHASE_ORDER } from "@/lib/constants/tournament";
import { prisma } from "@/lib/db/prisma";

type AdminResultsPageProps = {
  searchParams: Promise<{
    phase?: string;
  }>;
};

export default async function AdminResultsPage({ searchParams }: AdminResultsPageProps) {
  const { phase } = await searchParams;
  const selectedPhase = Object.values(MatchPhase).includes(phase as MatchPhase)
    ? (phase as MatchPhase)
    : undefined;

  const [matches, phaseLocks] = await Promise.all([
    prisma.matches.findMany({
      where: selectedPhase ? { phase: selectedPhase } : undefined,
      orderBy: [{ match_number: "asc" }],
      include: {
        home_team: {
          select: { name: true, flag_emoji: true },
        },
        away_team: {
          select: { name: true, flag_emoji: true },
        },
        predictions: {
          select: {
            id: true,
            predicted_home_score: true,
            predicted_away_score: true,
            points: true,
            is_exact: true,
            is_result_correct: true,
            created_at: true,
            user: {
              select: {
                display_name: true,
                username: true,
              },
            },
          },
          orderBy: [{ created_at: "desc" }],
        },
      },
    }),
    prisma.phase_locks.findMany({
      orderBy: { created_at: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-lg font-semibold">Bloqueo / desbloqueo de fases</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Control manual de fases activas para habilitar predicciones.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {TOURNAMENT_PHASE_ORDER.map((phaseName) => {
            const lock = phaseLocks.find((item) => item.phase === phaseName);
            return (
              <form
                key={phaseName}
                action={updatePhaseLockAction}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3"
              >
                <input type="hidden" name="phase" value={phaseName} />
                <p className="font-medium text-zinc-100">{PHASE_LABELS_ES[phaseName]}</p>
                <p className="text-xs text-zinc-500">Clave: {phaseName}</p>
                <label className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    name="is_enabled"
                    defaultChecked={lock?.is_enabled ?? false}
                  />
                  Habilitada
                </label>
                <button
                  type="submit"
                  className="mt-3 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-emerald-500 hover:text-emerald-300"
                >
                  Guardar fase
                </button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-lg font-semibold">Captura de resultados</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Edita marcador real, cambia estado y finaliza partidos para recalcular puntos. Incluye placeholders de eliminatorias.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/results"
            className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
          >
            Todas
          </Link>
          {TOURNAMENT_PHASE_ORDER.map((phaseName) => (
            <Link
              key={phaseName}
              href={`/admin/results?phase=${phaseName}`}
              className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
            >
              {PHASE_LABELS_ES[phaseName]}
            </Link>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {matches.length === 0 ? (
            <p className="text-zinc-400">No hay partidos para el filtro actual.</p>
          ) : (
            matches.map((match) => <AdminResultEditor key={match.id} match={match} />)
          )}
        </div>
      </section>
    </div>
  );
}
