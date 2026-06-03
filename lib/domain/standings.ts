type TeamStandingRow = {
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

type FinishedGroupMatch = {
  home_score: number | null;
  away_score: number | null;
  home_team: { id: string; name: string; flag_emoji: string } | null;
  away_team: { id: string; name: string; flag_emoji: string } | null;
};

export function calculateGroupStandings(
  teams: { id: string; name: string; flag_emoji: string }[],
  matches: FinishedGroupMatch[],
): TeamStandingRow[] {
  const table = new Map<string, TeamStandingRow>();

  for (const team of teams) {
    table.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      flagEmoji: team.flag_emoji,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
    });
  }

  for (const match of matches) {
    if (
      !match.home_team ||
      !match.away_team ||
      match.home_score === null ||
      match.away_score === null
    ) {
      continue;
    }

    const home = table.get(match.home_team.id);
    const away = table.get(match.away_team.id);

    if (!home || !away) continue;

    home.pj += 1;
    away.pj += 1;
    home.gf += match.home_score;
    home.gc += match.away_score;
    away.gf += match.away_score;
    away.gc += match.home_score;

    if (match.home_score > match.away_score) {
      home.pg += 1;
      away.pp += 1;
      home.pts += 3;
    } else if (match.home_score < match.away_score) {
      away.pg += 1;
      home.pp += 1;
      away.pts += 3;
    } else {
      home.pe += 1;
      away.pe += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  return Array.from(table.values())
    .map((row) => ({ ...row, dg: row.gf - row.gc }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.teamName.localeCompare(b.teamName));
}
