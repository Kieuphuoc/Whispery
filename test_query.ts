import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const userId = 4; // Based on logs my_ngan_2k
  console.log('Testing useMyPins query for userId:', userId);
  try {
    const voicePins: any[] = await prisma.$queryRaw`
            SELECT 
                v.id, v."audioUrl", v.content, v."audioDuration", v."audioSize", v.address,
                v.visibility, v."isAnonymous", v.type, v."unlockRadius", 
                v."emotionLabel", v."emotionScore", v."stickerUrl", v.transcription,
                v."deviceModel", v."osVersion", v."listensCount", v."reactionsCount", v."commentsCount",
                v.status, v."deletedAt", v."createdAt", v."updatedAt", v."userId",
                ST_Y(v.location) as latitude, 
                ST_X(v.location) as longitude,
                u.id as "userId",
                u.username,
                u."displayName",
                u.avatar
            FROM "VoicePin" v
            LEFT JOIN "User" u ON v."userId" = u.id
            WHERE v."userId" = ${userId} AND v."deletedAt" IS NULL
            ORDER BY v."createdAt" DESC
        `;
    console.log('Success! Found pins:', voicePins.length);
  } catch (err) {
    console.error('FAILED SQL QUERY:', err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
