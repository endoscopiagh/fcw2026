import { MatchPhase, MatchStatus, phase_locks } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { GROUP_STAGE_DEADLINE_CDMX_ISO, TOURNAMENT_PHASE_ORDER } from "@/lib/constants/tournament";

type MatchForLockCheck = {
  phase: MatchPhase;
  kickoff_at: Date;
  status: MatchStatus;
};

type UserForPredictionCheck = {
  role: "admin" | "user";
  is_active: boolean;
  has_paid: boolean;
};

export function isGroupStageLocked(referenceDate = new Date()): boolean {
  const lockDate = new Date(GROUP_STAGE_DEADLINE_CDMX_ISO);
  return referenceDate >= lockDate;
}

export function isMatchPredictionClosed(match: MatchForLockCheck, referenceDate = new Date()): boolean {
  if (match.status === "finished" || match.status === "closed") {
    return true;
  }

  if (match.phase === "GROUP_STAGE") {
    return isGroupStageLocked(referenceDate);
  }

  return referenceDate >= match.kickoff_at;
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
  referenceDate?: Date;
}): boolean {
  const { user, match, phaseLocks, referenceDate = new Date() } = params;

  if (user.role === "admin") {
    return true;
  }

  if (!user.is_active || !user.has_paid) {
    return false;
  }

  if (isMatchPredictionClosed(match, referenceDate)) {
    return false;
  }

  const currentPhase = getCurrentTournamentPhase(phaseLocks);
  const currentPhaseIndex = TOURNAMENT_PHASE_ORDER.indexOf(currentPhase);
  const matchPhaseIndex = TOURNAMENT_PHASE_ORDER.indexOf(match.phase);

  return matchPhaseIndex <= currentPhaseIndex;
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
    select: { status: true },
  });

  if (currentPhaseMatches.length === 0) {
    return null;
  }

  const allFinished = currentPhaseMatches.every((match) => match.status === "finished");
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
