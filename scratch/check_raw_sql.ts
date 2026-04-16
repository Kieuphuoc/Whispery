import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result: any[] = await prisma.$queryRawUnsafe(`SELECT id, "location"::text FROM "VoicePin" LIMIT 10`);
  console.log('Raw results (with text cast):', JSON.stringify(result, null, 2));
}

main().finally(() => prisma.$disconnect());
