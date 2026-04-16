import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.voicePin.count({
    where: {
        deletedAt: null
    }
  });
  console.log('Total active VoicePins:', count);
  
  const sample = await prisma.voicePin.findMany({
    take: 5,
    select: {
        id: true,
        visibility: true,
        type: true
    }
  });
  console.log('Sample pins:', JSON.stringify(sample, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
