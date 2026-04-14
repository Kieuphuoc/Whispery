import prisma from './src/prismaClient.js';

async function inspectWKB() {
    try {
        const pin: any = await prisma.$queryRaw`SELECT id, location FROM "VoicePin" LIMIT 1`;
        if (pin.length > 0) {
            const loc = pin[0].location;
            console.log('Location ID:', pin[0].id);
            console.log('Location Type:', typeof loc);
            if (Buffer.isBuffer(loc)) {
                console.log('Location Hex:', loc.toString('hex'));
                console.log('Length:', loc.length);
            } else {
                console.log('Location Value:', loc);
            }
        } else {
            console.log('No pins found');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

inspectWKB();
