-- Third-place match fixture and kickoff time (15:00 CDMX / 17:00 ET)
UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Francia' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Inglaterra' LIMIT 1),
  "kickoff_at" = TIMESTAMPTZ '2026-07-18 21:00:00+00',
  "venue" = 'Hard Rock Stadium',
  "city" = 'Miami',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 103;

UPDATE "phase_locks"
SET "is_enabled" = true
WHERE "phase" = 'THIRD_PLACE';
