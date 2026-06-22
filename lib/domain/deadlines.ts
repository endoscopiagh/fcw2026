import { MatchPhase, MatchStatus, phase_locks } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { TOURNAMENT_PHASE_ORDER } from "@/lib/constants/tournament";

type MatchForLockCheck = {
  phase: MatchPhase;
  status: MatchStatus;
  kickoff_at: Date;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string | null;
  away_team_id: string | null;
};

type UserForPredictionCheck = {
  role: "admin" | "user";
  is_active: boolean;
  has_paid: boolean;
};

export function isMatchPredictionClosed(match: MatchForLockCheck): boolean {
  if (match.home_score !== null && match.away_score !== null) {
    return true;
  }
  return new Date() >= match.kickoff_at;
}

export function getCurrentTournamentPhase(locks: phase_locks[]): MatchPhase {
  const activeLock = TOURNAMENT_PHASE_ORDER.find((phase) =>
    locks.some((lock) => lock.phase === phase && lock.is_enabled),
  );

  return activeLock ?? MatchPhase.GROUP_STAGE;
}

export function canUserPredict(params: {
  user: UserForPredictionCheck;
  match: MatchForLockCheck;
  phaseLocks: phase_locks[];
}): boolean {
  const { user, match, phaseLocks } = params;

  if (!user.is_active || !user.has_paid) {
    return false;
  }

  if (isMatchPredictionClosed(match)) {
    return false;
  }

  // Playoffs stay closed until the bracket is actually defined.
  if (match.phase !== "GROUP_STAGE" && (!match.home_team_id || !match.away_team_id)) {
    return false;
  }

  const lockForMatchPhase = phaseLocks.find((lock) => lock.phase === match.phase);
  return Boolean(lockForMatchPhase?.is_enabled);
}

export async function enableNextPhaseIfPreviousFinished(): Promise<MatchPhase | null> {
  const locks = await prisma.phase_locks.findMany({
    orderBy: { created_at: "asc" },
  });
  const currentPhase = getCurrentTournamentPhase(locks);
  const currentIndex = TOURNAMENT_PHASE_ORDER.indexOf(currentPhase);

  if (currentIndex === -1 || currentIndex === TOURNAMENT_PHASE_ORDER.length - 1) {
    return null;
  }

  const currentPhaseMatches = await prisma.matches.findMany({
    where: { phase: currentPhase },
    select: { home_score: true, away_score: true },
  });

  if (currentPhaseMatches.length === 0) {
    return null;
  }

  const allFinished = currentPhaseMatches.every(
    (match) => match.home_score !== null && match.away_score !== null,
  );
  if (!allFinished) {
    return null;
  }

  const nextPhase = TOURNAMENT_PHASE_ORDER[currentIndex + 1];
  await prisma.phase_locks.upsert({
    where: { phase: nextPhase },
    update: { is_enabled: true },
    create: { phase: nextPhase, is_enabled: true },
  });

  return nextPhase;
}
