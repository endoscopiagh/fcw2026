import { GroupCard } from "@/components/groups/group-card";
import { UserShell } from "@/components/layout/user-shell";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export default async function GruposPage() {
  const user = await requireAuth();
  const [teamsByGroup, groupMatches] = await Promise.all([
    prisma.teams.findMany({
      orderBy: [{ group_letter: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        flag_emoji: true,
        group_letter: true,
      },
    }),
    prisma.matches.findMany({
      where: { phase: "GROUP_STAGE" },
      select: {
        group_letter: true,
        home_score: true,
        away_score: true,
      },
    }),
  ]);

  const groups = Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i));

  return (
    <UserShell
      title="Grupos"
      subtitle="Explora los 12 grupos oficiales A-L del Mundial 2026."
      userDisplayName={user.display_name}
      showAdminLink={user.role === "admin"}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((groupLetter) => {
          const teams = teamsByGroup.filter((team) => team.group_letter === groupLetter);
          const matches = groupMatches.filter((match) => match.group_letter === groupLetter);
          const playedMatches = matches.filter(
            (match) => match.home_score !== null && match.away_score !== null,
          ).length;

          return (
            <GroupCard
              key={groupLetter}
              groupLetter={groupLetter}
              teams={teams}
              playedMatches={playedMatches}
              totalMatches={matches.length}
            />
          );
        })}
      </div>
    </UserShell>
  );
}
