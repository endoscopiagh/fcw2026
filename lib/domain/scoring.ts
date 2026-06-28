type ScoreInput = {
  homeScore: number;
  awayScore: number;
};

export type AdvancingSide = "HOME" | "AWAY";

export type PredictionScoreResult = {
  points: number;
  isExact: boolean;
  isResultCorrect: boolean;
};

function getMatchOutcome({ homeScore, awayScore }: ScoreInput): "HOME" | "DRAW" | "AWAY" {
  if (homeScore > awayScore) return "HOME";
  if (homeScore < awayScore) return "AWAY";
  return "DRAW";
}

export function calculatePredictionPoints(
  predicted: ScoreInput,
  actual: ScoreInput,
  options?: {
    isKnockout: boolean;
    predictedAdvancingSide?: AdvancingSide | null;
    actualAdvancingSide?: AdvancingSide | null;
  },
): PredictionScoreResult {
  const isExact = predicted.homeScore === actual.homeScore && predicted.awayScore === actual.awayScore;

  if (options?.isKnockout) {
    const isAdvanceCorrect =
      Boolean(options.actualAdvancingSide) &&
      options.predictedAdvancingSide === options.actualAdvancingSide;

    return {
      points: (isAdvanceCorrect ? 3 : 0) + (isExact ? 2 : 0),
      isExact,
      isResultCorrect: isAdvanceCorrect,
    };
  }

  if (isExact) {
    return {
      points: 5,
      isExact: true,
      isResultCorrect: true,
    };
  }

  const predictedOutcome = getMatchOutcome(predicted);
  const actualOutcome = getMatchOutcome(actual);
  const isResultCorrect = predictedOutcome === actualOutcome;

  return {
    points: isResultCorrect ? 3 : 0,
    isExact: false,
    isResultCorrect,
  };
}
