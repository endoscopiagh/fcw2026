type LeaderboardRow = {
  posicion: number;
  userId: string;
  displayName: string;
  puntos: number;
  exactos: number;
  resultadosCorrectos: number;
};

type LeaderboardTableProps = {
  rows: LeaderboardRow[];
};

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
  if (rows.length === 0) {
    return <p className="text-zinc-400">Aún no hay datos para mostrar en el leaderboard.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0">
          <tr className="text-left text-zinc-400">
            <th className="pb-2 pr-3">Posición</th>
            <th className="pb-2 pr-3">Usuario</th>
            <th className="pb-2 pr-3 text-center">Marcadores exactos</th>
            <th className="pb-2 pr-3 text-center">Resultados correctos</th>
            <th className="pb-2 pr-3 text-center">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.userId} className="border-t border-zinc-800 text-zinc-200">
              <td className="py-2 pr-3 font-semibold text-emerald-400">#{row.posicion}</td>
              <td className="py-2 pr-3">{row.displayName}</td>
              <td className="py-2 pr-3 text-center">{row.exactos}</td>
              <td className="py-2 pr-3 text-center">{row.resultadosCorrectos}</td>
              <td className={`py-2 pr-3 text-center ${index < 3 ? "font-semibold text-amber-300" : ""}`}>
                {row.puntos}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
