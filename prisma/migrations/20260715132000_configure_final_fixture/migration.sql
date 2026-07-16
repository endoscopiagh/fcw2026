-- Final fixture and kickoff time (13:00 CDMX / 15:00 ET)
UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'España' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Argentina' LIMIT 1),
  "kickoff_at" = TIMESTAMPTZ '2026-07-19 19:00:00+00',
  "venue" = 'MetLife Stadium',
  "city" = 'Nueva York / Nueva Jersey',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 104;

UPDATE "phase_locks"
SET "is_enabled" = true
WHERE "phase" = 'FINAL';
