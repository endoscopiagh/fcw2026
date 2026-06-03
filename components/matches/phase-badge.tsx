import { PHASE_LABELS_ES } from "@/lib/constants/tournament";
import type { MatchPhase } from "@prisma/client";

type PhaseBadgeProps = {
  phase: MatchPhase;
  groupLetter?: string | null;
};

const PHASE_STYLES: Record<MatchPhase, string> = {
  GROUP_STAGE: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  ROUND_OF_32: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  ROUND_OF_16: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  QUARTER_FINAL: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  SEMI_FINAL: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  THIRD_PLACE: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  FINAL: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300",
};

export function PhaseBadge({ phase, groupLetter }: PhaseBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${PHASE_STYLES[phase]}`}
    >
      {PHASE_LABELS_ES[phase]}
      {groupLetter ? ` • Grupo ${groupLetter}` : ""}
    </span>
  );
}
