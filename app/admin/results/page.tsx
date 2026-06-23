import Link from "next/link";

import { updatePhaseLockAction } from "@/app/actions/admin";
import { AdminResultEditor } from "@/components/admin/admin-result-editor";
import { PHASE_LABELS_ES, TOURNAMENT_PHASE_ORDER } from "@/lib/constants/tournament";
import { prisma } from "@/lib/db/prisma";

type AdminResultsPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

const ADMIN_TIME_ZONE = "America/Mexico_City";

function getMexicoDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function normalizeDateKey(input?: string): string {
  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return getMexicoDateKey(new Date());
  }
  return input;
}

function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day + days));
  return utcDate.toISOString().slice(0, 10);
}

function getMexicoDayRange(dateKey: string): { start: Date; end: Date } {
  const start = new Date(`${dateKey}T00:00:00-06:00`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export default async function AdminResultsPage({ searchParams }: AdminResultsPageProps) {
  const { date } = await searchParams;
  const selectedDate = normalizeDateKey(date);
  const previousDate = addDays(selectedDate, -1);
  const nextDate = addDays(selectedDate, 1);
  const { start, end } = getMexicoDayRange(selectedDate);

  const [matches, phaseLocks] = await Promise.all([
    prisma.matches.findMany({
      where: {
        kickoff_at: {
          gte: start,
          lt: end,
        },
      },
      orderBy: [{ kickoff_at: "asc" }, { match_number: "asc" }],
      include: {
        home_team: {
          select: { name: true, flag_emoji: true },
        },
        away_team: {
          select: { name: true, flag_emoji: true },
        },
        _count: {
          select: {
            predictions: true,
          },
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
          Captura o corrige marcador final. Al guardar se recalculan los puntos automáticamente.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/results?date=${previousDate}`}
            className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
          >
            ← Día anterior
          </Link>
          <p className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-sm text-zinc-200">
            Fecha: {selectedDate}
          </p>
          <Link
            href={`/admin/results?date=${nextDate}`}
            className="rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
          >
            Día siguiente →
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {matches.length === 0 ? (
            <p className="text-zinc-400">No hay partidos para el filtro actual.</p>
          ) : (
            matches.map((match) => (
              <AdminResultEditor key={match.id} match={match} selectedDate={selectedDate} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
