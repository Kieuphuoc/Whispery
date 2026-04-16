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
  const minLat = 10.65;
  const maxLat = 10.85;
  const minLng = 106.52;
  const maxLng = 106.72;
  const visibility = 'PUBLIC';

  console.log('Querying candidates...');
  const candidates = await prisma.voicePin.findMany({
    where: {
        visibility: visibility as any,
        deletedAt: null
    }
  });
  console.log('Candidates found:', candidates.length);

  const filtered = candidates.map(pin => {
      const coords = parseEWKBPoint((pin as any).location);
      return { ...pin, latitude: coords?.latitude ?? null, longitude: coords?.longitude ?? null };
  }).filter(pin => {
      if (pin.latitude === null || pin.longitude === null) return false;
      const match = (
          pin.latitude >= minLat &&
          pin.latitude <= maxLat &&
          pin.longitude >= minLng &&
          pin.longitude <= maxLng
      );
      return match;
  });

  console.log('Filtered pins:', filtered.length);
  if (filtered.length > 0) {
      console.log('Sample:', JSON.stringify(filtered[0], null, 2));
  }
}

main().finally(() => prisma.$disconnect());
