import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { UserShell } from "@/components/layout/user-shell";
import { requireAuth } from "@/lib/auth/guards";
import { getLeaderboardRows } from "@/lib/domain/predictions";

export default async function LeaderboardPage() {
  const user = await requireAuth();
  const rows = await getLeaderboardRows();

  return (
    <UserShell
      title="Tabla de Posiciones"
      userDisplayName={user.display_name}
      showAdminLink={user.role === "admin"}
    >
      <LeaderboardTable rows={rows} />
    </UserShell>
  );
}
