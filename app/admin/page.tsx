import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { getLeaderboardRows } from "@/lib/domain/predictions";

export default async function AdminPage() {
  const [usuariosTotales, usuariosActivos, partidosPendientes, prediccionesTotales, leaderboard] =
    await Promise.all([
      prisma.users.count(),
      prisma.users.count({
        where: { is_active: true, has_paid: true },
      }),
      prisma.matches.count({
        where: {
          home_score: null,
          away_score: null,
        },
      }),
      prisma.predictions.count(),
      getLeaderboardRows(),
    ]);

  const topLeaderboard = leaderboard.slice(0, 5);

  const cards = [
    { title: "Usuarios totales", value: usuariosTotales },
    { title: "Usuarios activos", value: usuariosActivos },
    { title: "Partidos pendientes", value: partidosPendientes },
    { title: "Predicciones totales", value: prediccionesTotales },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-sm text-zinc-400">{card.title}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Leaderboard resumido</h2>
          <Link href="/leaderboard" className="text-sm text-emerald-400 hover:text-emerald-300">
            Ver completo
          </Link>
        </div>

        {topLeaderboard.length === 0 ? (
          <p className="text-zinc-400">Aún no hay predicciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-400">
                  <th className="pb-2 pr-3">Pos</th>
                  <th className="pb-2 pr-3">Usuario</th>
                  <th className="pb-2 pr-3">Puntos</th>
                  <th className="pb-2 pr-3">Exactos</th>
                  <th className="pb-2 pr-3">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {topLeaderboard.map((row) => (
                  <tr key={row.userId} className="border-t border-zinc-800 text-zinc-200">
                    <td className="py-2 pr-3">{row.posicion}</td>
                    <td className="py-2 pr-3">{row.displayName}</td>
                    <td className="py-2 pr-3 font-semibold text-emerald-400">{row.puntos}</td>
                    <td className="py-2 pr-3">{row.exactos}</td>
                    <td className="py-2 pr-3">{row.resultadosCorrectos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
        >
          Administrar usuarios
        </Link>
        <Link
          href="/admin/results"
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
        >
          Administrar resultados
        </Link>
      </div>
    </div>
  );
}
