import prisma from './src/prismaClient.js';

async function testLoc() {
    try {
        const pin = await prisma.voicePin.findFirst({
            where: { deletedAt: null },
            select: { id: true, location: true }
        });
        console.log('Pin location type:', typeof pin?.location);
        console.log('Pin location value:', pin?.location);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testLoc();
