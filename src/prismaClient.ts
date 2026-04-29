import { PrismaClient, Prisma } from '@prisma/client';

const prismaBase = new PrismaClient();

const prisma = prismaBase.$extends({
  model: {
    voicePin: {
      async createWithLocation(data: any) {
        const { latitude, longitude, ...rest } = data;

        return prismaBase.$transaction(async (tx) => {
          // Prisma omits write methods from VoicePinDelegate when `location` is Unsupported+non-nullable;
          // cast to any to bypass the type gap — runtime behaviour is unaffected.
          const pin = await (tx.voicePin as any).create({ data: rest }) as { id: number };
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
          const pin = await (tx.voicePin as any).update({ where, data: rest }) as { id: number };
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

      async findManyInBBox(params: { minLat: number; maxLat: number; minLng: number; maxLng: number; visibility?: string; userId?: number; limit?: number }) {
        const { minLat, maxLat, minLng, maxLng, visibility = 'PUBLIC', userId, limit = 100 } = params;
        const uid = userId || -1;

        const pins = await prismaBase.$queryRaw<any[]>`
            SELECT
                v.id, v."audioUrl", v.content, v."audioDuration", v."audioSize", v.address,
                v.visibility, v."isAnonymous", v.type, v."unlockRadius",
                v."emotionLabel", v."emotionScore", v."stickerUrl", v.transcription,
                v."deviceModel", v."osVersion", v."listensCount", v."reactionsCount", v."commentsCount",
                v.status, v."deletedAt", v."createdAt", v."updatedAt", v."userId",
                ST_Y(v.location::geometry) AS latitude,
                ST_X(v.location::geometry) AS longitude,
                u.username, u."displayName", u.avatar,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', i.id,
                            'imageUrl', i."imageUrl",
                            'voicePinId', i."voicePinId",
                            'createdAt', i."createdAt"
                        )
                    ) FILTER (WHERE i.id IS NOT NULL),
                    '[]'::json
                ) AS images
            FROM "VoicePin" v
            LEFT JOIN "User" u ON v."userId" = u.id
            LEFT JOIN "Image" i ON i."voicePinId" = v.id
            WHERE v.location IS NOT NULL
            AND v.location && ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
            AND v."deletedAt" IS NULL
            AND (v.status::text = 'APPROVED' OR v."userId" = ${uid})
            AND (
                (${visibility} = 'PUBLIC' AND v.visibility::text = 'PUBLIC')
                OR
                (${visibility} = 'PRIVATE' AND v."userId" = ${uid})
                OR
                (${visibility} = 'FRIENDS' AND (
                    (v.visibility::text = 'FRIENDS' AND (
                        v."userId" = ${uid} 
                        OR v."userId" IN (
                            SELECT "receiverId" FROM "Friendship" WHERE "senderId" = ${uid} AND status::text = 'ACCEPTED'
                            UNION
                            SELECT "senderId" FROM "Friendship" WHERE "receiverId" = ${uid} AND status::text = 'ACCEPTED'
                        )
                    ))
                    OR
                    (v.visibility::text = 'PUBLIC')
                ))
            )
            GROUP BY v.id, u.username, u."displayName", u.avatar
            ORDER BY v."createdAt" DESC
            LIMIT ${limit}
        `;

        return pins;
      },

      async findRandomNearby(params: { lat: number; lng: number; radiusKm: number; userId?: number; limit?: number }) {
        const { lat, lng, radiusKm, userId, limit = 100 } = params;
        const uid = userId || -1;

        const SELECT_COLS = `
            v.id, v."audioUrl", v.content, v."audioDuration", v."audioSize", v.address,
            v.visibility, v."isAnonymous", v.type, v."unlockRadius",
            v."emotionLabel", v."emotionScore", v."stickerUrl", v.transcription,
            v."deviceModel", v."osVersion", v."listensCount", v."reactionsCount", v."commentsCount",
            v.status, v."deletedAt", v."createdAt", v."updatedAt", v."userId",
            ST_Y(v.location::geometry) AS latitude,
            ST_X(v.location::geometry) AS longitude,
            u.username, u."displayName", u.avatar`;

        let pins = await prismaBase.$queryRaw<any[]>`
            SELECT ${Prisma.raw(SELECT_COLS)}
            FROM "VoicePin" v
            LEFT JOIN "User" u ON v."userId" = u.id
            WHERE v.location IS NOT NULL
            AND v.visibility = 'PUBLIC'
            AND v.status::text = 'APPROVED'
            AND v."deletedAt" IS NULL
            AND ${uid} != v."userId"
            AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusKm * 1000})
            LIMIT ${limit}
        `;

        if (pins.length === 0) {
          pins = await prismaBase.$queryRaw<any[]>`
                SELECT ${Prisma.raw(SELECT_COLS)}
                FROM "VoicePin" v
                LEFT JOIN "User" u ON v."userId" = u.id
                WHERE v.location IS NOT NULL
                AND v.visibility = 'PUBLIC'
                AND v.status::text = 'APPROVED'
                AND v."deletedAt" IS NULL
                AND ${uid} != v."userId"
                LIMIT 50
            `;
        }

        return pins;
      }
    }
  }
});

export function parseEWKBPoint(buffer: Buffer) {
  if (!buffer || buffer.length < 21) return null;
  // PostGIS point: [1 byte order] [4 bytes type] [4 bytes SRID if present] [8 bytes X] [8 bytes Y]
  // The query SELECT location::bytea returns the EWKB.

  const isLittleEndian = buffer.readUInt8(0) === 1;
  const readDouble = isLittleEndian ? buffer.readDoubleLE.bind(buffer) : buffer.readDoubleBE.bind(buffer);
  const type = isLittleEndian ? buffer.readUInt32LE(1) : buffer.readUInt32BE(1);

  const hasSRID = (type & 0x20000000) !== 0;
  const offset = hasSRID ? 9 : 5;

  if (buffer.length < offset + 16) return null;

  return {
    longitude: readDouble(offset),
    latitude: readDouble(offset + 8)
  };
}

export default prisma;
