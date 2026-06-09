import { MatchPhase } from "@prisma/client";

export const GROUP_STAGE_DEADLINE_CDMX_ISO = "2026-06-11T00:00:00-06:00";

export const TOURNAMENT_PHASE_ORDER: MatchPhase[] = [
  MatchPhase.GROUP_STAGE,
  MatchPhase.ROUND_OF_32,
  MatchPhase.ROUND_OF_16,
  MatchPhase.QUARTER_FINAL,
  MatchPhase.SEMI_FINAL,
  MatchPhase.THIRD_PLACE,
  MatchPhase.FINAL,
];

export const PHASE_LABELS_ES: Record<MatchPhase, string> = {
  GROUP_STAGE: "Fase de grupos",
  ROUND_OF_32: "Dieciseisavos",
  ROUND_OF_16: "Octavos",
  QUARTER_FINAL: "Cuartos",
  SEMI_FINAL: "Semifinales",
  THIRD_PLACE: "Tercer lugar",
  FINAL: "Final",
};

export const PRIVATE_ROUTE_PREFIXES = [
  "/dashboard",
  "/cuenta",
  "/predicciones",
  "/partidos",
  "/grupos",
  "/leaderboard",
  "/admin",
];

export const ADMIN_ROUTE_PREFIX = "/admin";
export const LOGIN_ROUTE = "/login";
export const DEFAULT_LOGGED_ROUTE = "/dashboard";

export const AUTH_COOKIE_NAME = "fcw2026_session";
