import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Parses PostGIS EWKB geometry Point into latitude and longitude.
 * PostGIS EWKB format for Point: [byteOrder(1), type(4), SRID(4), X(8), Y(8)]
 * Note: X is Longitude, Y is Latitude.
 */
function parseEWKBPoint(buffer: Buffer | string | any): { latitude: number; longitude: number } | null {
  if (!buffer) return null;
  
  // Handle various formats Prisma might return (Buffer, Hex string, or even object)
  let b: Buffer;
  if (Buffer.isBuffer(buffer)) {
    b = buffer;
  } else if (typeof buffer === 'string') {
    b = Buffer.from(buffer, 'hex');
  } else if (buffer && typeof buffer === 'object' && buffer.type === 'Buffer') {
    b = Buffer.from(buffer.data);
  } else {
    return null;
  }

  try {
    if (b.length < 21) return null; // [1+4+4+8+8 = 25 bytes for EWKB Point]

    const byteOrder = b.readUInt8(0); // 1 = Little Endian, 0 = Big Endian
    const isLittleEndian = byteOrder === 1;
    
    // Type is at offset 1, takes 4 bytes
    const type = isLittleEndian ? b.readUInt32LE(1) : b.readUInt32BE(1);
    
    let offset = 5;
    // Check for SRID flag (0x20000000)
    if (type & 0x20000000) {
      offset += 4; // Skip SRID (4 bytes)
    }
    
    if (b.length < offset + 16) return null;

    const x = isLittleEndian ? b.readDoubleLE(offset) : b.readDoubleBE(offset);
    const y = isLittleEndian ? b.readDoubleLE(offset + 8) : b.readDoubleBE(offset + 8);
    
    return { longitude: x, latitude: y };
  } catch (e) {
    console.error('Error parsing EWKB Point:', e);
    return null;
  }
}

const prismaBase = new PrismaClient();

const prisma = prismaBase.$extends({
  result: {
    VoicePin: {
      latitude: {
        needs: { location: true },
        compute(voicePin) {
          const coords = parseEWKBPoint(voicePin.location);
          return coords ? coords.latitude : null;
        },
      },
      longitude: {
        needs: { location: true },
        compute(voicePin) {
          const coords = parseEWKBPoint(voicePin.location);
          return coords ? coords.longitude : null;
        },
      },
    },
  },
  model: {
    voicePin: {
      async createWithLocation(data: any) {
        const { latitude, longitude, ...rest } = data;
        
        return prismaBase.$transaction(async (tx) => {
          const pin = await tx.voicePin.create({ data: rest });
          if (latitude !== undefined && longitude !== undefined) {
            await tx.$executeRaw`
              UPDATE "VoicePin" 
              SET "location" = ST_SetSRID(ST_MakePoint(${parseFloat(longitude)}, ${parseFloat(latitude)}), 4326)
              WHERE id = ${pin.id}
            `;
          }
          return (tx.voicePin as any).findUnique({ 
            where: { id: pin.id }, 
            include: { images: true, user: { select: { id: true, username: true, displayName: true, avatar: true } } } 
          });
        });
      },
      
      async updateWithLocation(params: { where: Prisma.VoicePinWhereUniqueInput; data: any }) {
        const { where, data } = params;
        const { latitude, longitude, ...rest } = data;
        
        return prismaBase.$transaction(async (tx) => {
          const pin = await tx.voicePin.update({ where, data: rest });
          if (latitude !== undefined && longitude !== undefined) {
             await tx.$executeRaw`
              UPDATE "VoicePin" 
              SET "location" = ST_SetSRID(ST_MakePoint(${parseFloat(longitude)}, ${parseFloat(latitude)}), 4326)
              WHERE id = ${pin.id}
            `;
          }
           return (tx.voicePin as any).findUnique({ where: { id: pin.id }, include: { images: true } });
        });
      },

      async findManyInBBox(params: { minLat: number; maxLat: number; minLng: number; maxLng: number; visibility?: string; limit?: number }) {
        const { minLat, maxLat, minLng, maxLng, visibility = 'PUBLIC', limit = 100 } = params;
        
        const pins = await prismaBase.$queryRaw<any[]>`
            SELECT 
                v.id, v."audioUrl", v.content, v."audioDuration", v."audioSize", v.address,
                v.visibility, v."isAnonymous", v.type, v."unlockRadius", 
                v."emotionLabel", v."emotionScore", v."stickerUrl", v.transcription,
                v."deviceModel", v."osVersion", v."listensCount", v."reactionsCount", v."commentsCount",
                v.status, v."deletedAt", v."createdAt", v."updatedAt", v."userId",
                v.location::bytea as location,
                u.username, u."displayName", u.avatar
            FROM "VoicePin" v
            LEFT JOIN "User" u ON v."userId" = u.id
            WHERE v.location && ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
            AND v.visibility::text = ${visibility}
            AND v."deletedAt" IS NULL
            ORDER BY v."createdAt" DESC
            LIMIT ${limit}
        `;
        
        return pins.map(p => {
          const coords = parseEWKBPoint(p.location);
          return {
            ...p,
            latitude: coords ? coords.latitude : null,
            longitude: coords ? coords.longitude : null
          };
        });
      },

      async findRandomNearby(params: { lat: number; lng: number; radiusKm: number; userId?: number; limit?: number }) {
        const { lat, lng, radiusKm, userId, limit = 100 } = params;
        const uid = userId || -1;
        
        let pins = await prismaBase.$queryRaw<any[]>`
            SELECT 
                v.id, v."audioUrl", v.content, v."audioDuration", v."audioSize", v.address,
                v.visibility, v."isAnonymous", v.type, v."unlockRadius", 
                v."emotionLabel", v."emotionScore", v."stickerUrl", v.transcription,
                v."deviceModel", v."osVersion", v."listensCount", v."reactionsCount", v."commentsCount",
                v.status, v."deletedAt", v."createdAt", v."updatedAt", v."userId",
                v.location::bytea as location,
                u.username, u."displayName", u.avatar
            FROM "VoicePin" v
            LEFT JOIN "User" u ON v."userId" = u.id
            WHERE v.visibility = 'PUBLIC'
            AND v."deletedAt" IS NULL
            AND ${uid} != v."userId"
            AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusKm * 1000})
            LIMIT ${limit}
        `;
        
        if (pins.length === 0) {
           pins = await prismaBase.$queryRaw<any[]>`
                SELECT 
                    v.id, v."audioUrl", v.content, v."audioDuration", v."audioSize", v.address,
                    v.visibility, v."isAnonymous", v.type, v."unlockRadius", 
                    v."emotionLabel", v."emotionScore", v."stickerUrl", v.transcription,
                    v."deviceModel", v."osVersion", v."listensCount", v."reactionsCount", v."commentsCount",
                    v.status, v."deletedAt", v."createdAt", v."updatedAt", v."userId",
                    v.location::bytea as location,
                    u.username, u."displayName", u.avatar
                FROM "VoicePin" v
                LEFT JOIN "User" u ON v."userId" = u.id
                WHERE v.visibility = 'PUBLIC'
                AND v."deletedAt" IS NULL
                AND ${uid} != v."userId"
                LIMIT 50
            `;
        }
        
        return pins.map(p => {
          const coords = parseEWKBPoint(p.location);
          return {
            ...p,
            latitude: coords ? coords.latitude : null,
            longitude: coords ? coords.longitude : null
          };
        });
      }
    }
  }
});

export default prisma;
