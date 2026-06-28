CREATE TYPE "AdvancingSide" AS ENUM ('HOME', 'AWAY');

ALTER TABLE "matches"
ADD COLUMN "advancing_side" "AdvancingSide";

ALTER TABLE "predictions"
ADD COLUMN "predicted_advancing_side" "AdvancingSide";

-- Round of 32 fixtures and kickoff times
UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Sudáfrica' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Canadá' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-06-28 15:00:00-04',
  "venue" = 'Los Angeles Stadium',
  "city" = 'Los Ángeles'
WHERE "match_number" = 73;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Alemania' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Paraguay' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-06-29 16:30:00-04',
  "venue" = 'Boston Stadium',
  "city" = 'Boston'
WHERE "match_number" = 74;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Países Bajos' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Marruecos' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-06-29 21:00:00-04',
  "venue" = 'Estadio Monterrey',
  "city" = 'Monterrey'
WHERE "match_number" = 75;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Brasil' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Japón' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-06-29 13:00:00-04',
  "venue" = 'Houston Stadium',
  "city" = 'Houston'
WHERE "match_number" = 76;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Francia' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Suecia' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-06-30 17:00:00-04',
  "venue" = 'New York New Jersey Stadium',
  "city" = 'Nueva York / Nueva Jersey'
WHERE "match_number" = 77;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Costa de Marfil' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Noruega' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-06-30 13:00:00-04',
  "venue" = 'Dallas Stadium',
  "city" = 'Dallas'
WHERE "match_number" = 78;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'México' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Ecuador' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-06-30 21:00:00-04',
  "venue" = 'Estadio Ciudad de México',
  "city" = 'Ciudad de México'
WHERE "match_number" = 79;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Inglaterra' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'República Democrática del Congo' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-01 12:00:00-04',
  "venue" = 'Atlanta Stadium',
  "city" = 'Atlanta'
WHERE "match_number" = 80;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Estados Unidos' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Bosnia y Herzegovina' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-01 20:00:00-04',
  "venue" = 'San Francisco Bay Area Stadium',
  "city" = 'San Francisco Bay Area'
WHERE "match_number" = 81;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Bélgica' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Senegal' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-01 16:00:00-04',
  "venue" = 'Seattle Stadium',
  "city" = 'Seattle'
WHERE "match_number" = 82;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Portugal' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Croacia' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-02 19:00:00-04',
  "venue" = 'Toronto Stadium',
  "city" = 'Toronto'
WHERE "match_number" = 83;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'España' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Austria' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-02 15:00:00-04',
  "venue" = 'Los Angeles Stadium',
  "city" = 'Los Ángeles'
WHERE "match_number" = 84;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Suiza' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Argelia' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-02 23:00:00-04',
  "venue" = 'BC Place Vancouver',
  "city" = 'Vancouver'
WHERE "match_number" = 85;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Argentina' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Cabo Verde' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-03 18:00:00-04',
  "venue" = 'Miami Stadium',
  "city" = 'Miami'
WHERE "match_number" = 86;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Colombia' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Ghana' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-03 21:30:00-04',
  "venue" = 'Kansas City Stadium',
  "city" = 'Kansas City'
WHERE "match_number" = 87;

UPDATE "matches"
SET
  "home_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Australia' LIMIT 1),
  "away_team_id" = (SELECT "id" FROM "teams" WHERE "name" = 'Egipto' LIMIT 1),
  "kickoff_at" = TIMESTAMP '2026-07-03 14:00:00-04',
  "venue" = 'Dallas Stadium',
  "city" = 'Dallas'
WHERE "match_number" = 88;

UPDATE "phase_locks"
SET "is_enabled" = true
WHERE "phase" = 'ROUND_OF_32';
