-- Make location nullable to allow 2-step create:
-- Step 1: ORM create() without location
-- Step 2: $executeRaw UPDATE SET location = ST_SetSRID(ST_MakePoint(...), 4326)
ALTER TABLE "VoicePin" ALTER COLUMN "location" DROP NOT NULL;
