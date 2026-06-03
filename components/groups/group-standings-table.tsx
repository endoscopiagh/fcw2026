import { Flag } from "@/components/ui/flag";

type StandingRow = {
  teamId: string;
  teamName: string;
  flagEmoji: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

type GroupStandingsTableProps = {
  rows: StandingRow[];
};

export function GroupStandingsTable({ rows }: GroupStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-400">
            <th className="pb-2 pr-3">Pos</th>
            <th className="pb-2 pr-3">Equipo</th>
            <th className="pb-2 pr-3">PJ</th>
            <th className="pb-2 pr-3">PG</th>
            <th className="pb-2 pr-3">PE</th>
            <th className="pb-2 pr-3">PP</th>
            <th className="pb-2 pr-3">GF</th>
            <th className="pb-2 pr-3">GC</th>
            <th className="pb-2 pr-3">DG</th>
            <th className="pb-2 pr-3">PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.teamId} className="border-t border-zinc-800 text-zinc-200">
              <td className="py-2 pr-3 font-semibold text-emerald-400">#{index + 1}</td>
              <td className="py-2 pr-3">
                <Flag emoji={row.flagEmoji} teamName={row.teamName} className="mr-1" />
                {row.teamName}
              </td>
              <td className="py-2 pr-3">{row.pj}</td>
              <td className="py-2 pr-3">{row.pg}</td>
              <td className="py-2 pr-3">{row.pe}</td>
              <td className="py-2 pr-3">{row.pp}</td>
              <td className="py-2 pr-3">{row.gf}</td>
              <td className="py-2 pr-3">{row.gc}</td>
              <td className="py-2 pr-3">{row.dg}</td>
              <td className="py-2 pr-3 font-semibold">{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
