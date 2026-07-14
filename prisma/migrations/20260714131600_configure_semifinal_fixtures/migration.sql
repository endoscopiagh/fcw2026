-- Semi-final fixtures and kickoff times (CDMX)
UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Francia' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'España' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-14 14:00:00-06',
  "venue" = 'AT&T Stadium',
  "city" = 'Dallas',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 101;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Inglaterra' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Argentina' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-15 13:00:00-06',
  "venue" = 'Mercedes-Benz Stadium',
  "city" = 'Atlanta',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 102;

UPDATE "phase_locks"
SET "is_enabled" = true
WHERE "phase" = 'SEMI_FINAL';
