-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- DropIndex
DROP INDEX IF EXISTS "VoicePin_latitude_longitude_idx";

-- AddColumn (Start as nullable to allow migration)
ALTER TABLE "VoicePin" ADD COLUMN "location" geometry(Point, 4326);

-- Data Migration: Sync longitude/latitude to geometry location
UPDATE "VoicePin" SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326);

-- AlterTable: Make NOT NULL and DROP legacy columns
ALTER TABLE "VoicePin" ALTER COLUMN "location" SET NOT NULL;
ALTER TABLE "VoicePin" DROP COLUMN "latitude", DROP COLUMN "longitude";

-- CreateIndex
CREATE INDEX "VoicePin_location_idx" ON "VoicePin" USING GIST ("location");

