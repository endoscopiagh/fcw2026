import Link from "next/link";
import { Flag } from "@/components/ui/flag";

type GroupCardProps = {
  groupLetter: string;
  teams: Array<{ name: string; flag_emoji: string }>;
  playedMatches: number;
  totalMatches: number;
};

export function GroupCard({ groupLetter, teams, playedMatches, totalMatches }: GroupCardProps) {
  return (
    <Link
      href={`/grupos/${groupLetter}`}
      className="glass-panel block rounded-xl p-4 hover:-translate-y-[1px] hover:border-emerald-500"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="fifa-title-glow text-lg font-bold text-zinc-100">Grupo {groupLetter}</h3>
        <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-300">
          {playedMatches}/{totalMatches} jugados
        </span>
      </div>

      <ul className="space-y-1 text-sm text-zinc-300">
        {teams.map((team) => (
          <li key={team.name}>
            <Flag emoji={team.flag_emoji} teamName={team.name} className="mr-1" />
            {team.name}
          </li>
        ))}
      </ul>
    </Link>
  );
}
