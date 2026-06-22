ALTER TABLE "predictions"
ADD COLUMN "user_updated_at" TIMESTAMP(3);

UPDATE "predictions"
SET "user_updated_at" = "created_at"
WHERE "user_updated_at" IS NULL;

ALTER TABLE "predictions"
ALTER COLUMN "user_updated_at" SET NOT NULL;

ALTER TABLE "predictions"
ALTER COLUMN "user_updated_at" SET DEFAULT CURRENT_TIMESTAMP;
