-- Round of 16 fixtures and kickoff times (CDMX)
UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Paraguay' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Francia' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-04 15:00:00-06',
  "venue" = 'Philadelphia Stadium',
  "city" = 'Philadelphia',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 89;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Canadá' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Marruecos' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-04 11:00:00-06',
  "venue" = 'Houston Stadium',
  "city" = 'Houston',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 90;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Brasil' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Noruega' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-05 14:00:00-06',
  "venue" = 'New York New Jersey Stadium',
  "city" = 'Nueva York / Nueva Jersey',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 91;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'México' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Inglaterra' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-05 18:00:00-06',
  "venue" = 'Estadio Ciudad de México',
  "city" = 'Ciudad de México',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 92;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Portugal' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'España' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-06 13:00:00-06',
  "venue" = 'Dallas Stadium',
  "city" = 'Dallas',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 93;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Estados Unidos' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Bélgica' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-06 18:00:00-06',
  "venue" = 'Seattle Stadium',
  "city" = 'Seattle',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 94;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Argentina' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Egipto' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-07 10:00:00-06',
  "venue" = 'Atlanta Stadium',
  "city" = 'Atlanta',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 95;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Suiza' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Colombia' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-07 14:00:00-06',
  "venue" = 'BC Place Vancouver',
  "city" = 'Vancouver',
  "home_score" = NULL,
  "away_score" = NULL,
  "advancing_side" = NULL,
  "status" = 'scheduled'
WHERE "match_number" = 96;

UPDATE "phase_locks"
SET "is_enabled" = true
WHERE "phase" = 'ROUND_OF_16';
