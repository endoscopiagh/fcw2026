-- Quarter-final fixtures and kickoff times (CDMX)
UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Francia' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Marruecos' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-09 14:00:00-06',
  "venue" = 'Gillette Stadium',
  "city" = 'Boston',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 97;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'España' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Bélgica' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-10 13:00:00-06',
  "venue" = 'SoFi Stadium',
  "city" = 'Los Ángeles',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 98;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Noruega' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Inglaterra' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-11 15:00:00-06',
  "venue" = 'Hard Rock Stadium',
  "city" = 'Miami',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 99;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Argentina' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Suiza' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-11 19:00:00-06',
  "venue" = 'Arrowhead Stadium',
  "city" = 'Kansas City',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 100;

UPDATE "phase_locks"
SET "is_enabled" = true
WHERE "phase" = 'QUARTER_FINAL';
