"use client";

import { useState } from "react";

type RankDisplayProps = {
  username: string;
  realRankLabel: string;
};

export function RankDisplay({ username, realRankLabel }: RankDisplayProps) {
  const isJulio = username === "juliogzz";
  const [showRealRank, setShowRealRank] = useState(false);

  if (!isJulio) {
    return <span>{realRankLabel}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setShowRealRank((current) => !current)}
      className="group relative inline-flex items-center justify-center"
    >
      <span>{showRealRank ? realRankLabel : "1"}</span>
      {!showRealRank ? (
        <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-950/95 px-2 py-1 text-xs font-medium text-zinc-200 opacity-0 transition-opacity group-hover:opacity-100">
          Ver real
        </span>
      ) : null}
    </button>
  );
}
