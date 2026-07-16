-- Fix semi-final kickoff times stored as UTC instead of CDMX
UPDATE "matches"
SET "kickoff_at" = TIMESTAMPTZ '2026-07-14 20:00:00+00'
WHERE "match_number" = 101;

UPDATE "matches"
SET "kickoff_at" = TIMESTAMPTZ '2026-07-15 19:00:00+00'
WHERE "match_number" = 102;
