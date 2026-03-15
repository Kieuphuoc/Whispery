-- CreateEnum
CREATE TYPE "public"."VoicePinStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."VoicePin" ADD COLUMN     "status" "public"."VoicePinStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transcription" TEXT;
