import { Buffer } from 'buffer';
import { PrismaClient } from '@prisma/client';

function parseEWKBPoint(buffer: any): { latitude: number; longitude: number } | null {
  if (!buffer) return null;
  let b: Buffer;
  if (Buffer.isBuffer(buffer)) b = buffer;
  else if (typeof buffer === 'string') b = Buffer.from(buffer, 'hex');
  else if (buffer && typeof buffer === 'object' && buffer.type === 'Buffer') b = Buffer.from(buffer.data);
  else return null;

  try {
    const byteOrder = b.readUInt8(0);
    const isLittleEndian = byteOrder === 1;
    const type = isLittleEndian ? b.readUInt32LE(1) : b.readUInt32BE(1);
    let offset = 5;
    if (type & 0x20000000) offset += 4;
    const x = isLittleEndian ? b.readDoubleLE(offset) : b.readDoubleBE(offset);
    const y = isLittleEndian ? b.readDoubleLE(offset + 8) : b.readDoubleBE(offset + 8);
    return { longitude: x, latitude: y };
  } catch (e) { return null; }
}

const prisma = new PrismaClient();

async function main() {
  const pins = await prisma.voicePin.findMany({
    take: 100,
    where: { deletedAt: null }
  });
  
  const results = pins.map(pin => {
      const coords = parseEWKBPoint((pin as any).location);
      return {
          id: pin.id,
          visibility: pin.visibility,
          coords
      };
  });
  
  console.log('Pins locations:', JSON.stringify(results, null, 2));
}

main().finally(() => prisma.$disconnect());
