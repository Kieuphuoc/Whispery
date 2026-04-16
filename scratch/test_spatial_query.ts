import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const minLat = 10.65;
  const maxLat = 10.85;
  const minLng = 106.52;
  const maxLng = 106.72;
  const visibility = 'PUBLIC';

  try {
      // Use ST_AsBinary to get the geometry data in a format we can parse
      const results: any[] = await prisma.$queryRawUnsafe(`
        SELECT p.id, p."location"::text, u.username
        FROM "VoicePin" p
        JOIN "User" u ON p."userId" = u.id
        WHERE p.location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
        AND p.visibility = $5::"Visibility"
        AND p."deletedAt" IS NULL
        LIMIT 10
      `, minLng, minLat, maxLng, maxLat, visibility);
      
      console.log('Results:', results.length);
      if (results.length > 0) {
          console.log('Sample:', results[0]);
      }
  } catch (e: any) {
      console.error('Query failed:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
