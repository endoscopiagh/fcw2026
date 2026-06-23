import Link from "next/link";
import { notFound } from "next/navigation";

import { Flag } from "@/components/ui/flag";
import { prisma } from "@/lib/db/prisma";

type AdminMatchPredictionsPageProps = {
  params: Promise<{
    matchId: string;
  }>;
  searchParams: Promise<{
    date?: string;
  }>;
};

const ADMIN_AUDIT_TIME_ZONE = "America/Mexico_City";

function formatDateTime(date: Date): string {
  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ADMIN_AUDIT_TIME_ZONE,
    timeZoneName: "short",
  });
}

export default async function AdminMatchPredictionsPage({
  params,
  searchParams,
}: AdminMatchPredictionsPageProps) {
  const { matchId } = await params;
  const { date } = await searchParams;

  const match = await prisma.matches.findUnique({
    where: { id: matchId },
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
          user_updated_at: true,
          user: {
            select: {
              display_name: true,
              username: true,
            },
          },
        },
        orderBy: [{ user_updated_at: "desc" }],
      },
    },
  });

  if (!match) {
    notFound();
  }

  const hasFinalScore = match.home_score !== null && match.away_score !== null;
  const kickoffLabel = formatDateTime(match.kickoff_at);
  const backHref = date ? `/admin/results?date=${date}` : "/admin/results";

  return (
    <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Predicciones del partido #{match.match_number}</h2>
          <p className="text-sm text-zinc-300">
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
          <p className="text-xs text-zinc-500">Kickoff: {kickoffLabel}</p>
        </div>
        <Link
          href={backHref}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-emerald-500 hover:text-emerald-300"
        >
          ← Volver a resultados
        </Link>
      </div>

      {match.predictions.length === 0 ? (
        <p className="text-sm text-zinc-400">Aún no hay predicciones para este partido.</p>
      ) : (
        <div className="space-y-2">
          {match.predictions.map((prediction) => {
            const isLateSubmission = prediction.user_updated_at > match.kickoff_at;
            const userUpdatedAtLabel = formatDateTime(prediction.user_updated_at);

            return (
              <div
                key={prediction.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-300"
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
                <p className="w-full text-zinc-400">Ult. cambio: {userUpdatedAtLabel}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
