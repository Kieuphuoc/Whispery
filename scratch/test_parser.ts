import { Buffer } from 'buffer';

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
    
    // Point EWKB: 01 01 00 00 20 E6 10 00 00 ...
    // byte 0: order
    // byte 1-4: type (0x20000001 for Point with SRID)
    
    const type = isLittleEndian ? b.readUInt32LE(1) : b.readUInt32BE(1);
    console.log('Type:', type.toString(16));
    
    let offset = 5;
    if (type & 0x20000000) {
      const srid = isLittleEndian ? b.readUInt32LE(5) : b.readUInt32BE(5);
      console.log('SRID:', srid);
      offset += 4;
    }
    
    const x = isLittleEndian ? b.readDoubleLE(offset) : b.readDoubleBE(offset);
    const y = isLittleEndian ? b.readDoubleLE(offset + 8) : b.readDoubleBE(offset + 8);
    
    return { longitude: x, latitude: y };
  } catch (e) { 
    console.error(e);
    return null; 
  }
}

const hex = "0101000020E61000003F355EBA49AC5A4025068195438B2540";
console.log('Result:', parseEWKBPoint(hex));
