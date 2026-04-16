import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pins = await prisma.voicePin.findMany({
    take: 10,
    where: { deletedAt: null }
  });
  
  const results = pins.map(pin => {
      // Manual parse for debug
      return {
          id: pin.id,
          visibility: pin.visibility,
          // We can't easily parse geometry here without the helper, 
          // but I'll use the prisma extension indirectly by just reading the location buffer if possible
          location: (pin as any).location
      };
  });
  
  console.log('Pins summary:', JSON.stringify(results, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
