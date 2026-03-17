import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const extensions: any[] = await prisma.$queryRaw`SELECT * FROM pg_extension`;
    console.log('Installed extensions:', extensions.map(e => e.extname));

    try {
        const pins: any[] = await prisma.$queryRaw`
            SELECT id, ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude, content
            FROM "VoicePin"
            LIMIT 1
        `;
        console.log('VoicePin with location:', pins[0]);
    } catch (e) {
        console.error('Failed to query location:', e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
