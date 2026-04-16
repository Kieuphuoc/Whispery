import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pin = await prisma.voicePin.findFirst({
    where: { visibility: 'PUBLIC' as any, deletedAt: null }
  });

  console.log('Location field type:', typeof (pin as any).location);
  console.log('Location field value:', (pin as any).location);
}

main().finally(() => prisma.$disconnect());
