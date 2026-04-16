import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Dropping NOT NULL constraint on location column...');
    await prisma.$executeRaw`ALTER TABLE "VoicePin" ALTER COLUMN "location" DROP NOT NULL`;
    console.log('✅ Done! location column is now nullable.');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
