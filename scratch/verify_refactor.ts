import prisma from './src/prismaClient.js';

async function verify() {
  try {
    console.log('--- Verifying findMany (Result Extension) ---');
    const pins = await prisma.voicePin.findMany({
      take: 2,
      where: { deletedAt: null },
    });
    
    pins.forEach(p => {
      console.log(`Pin ID: ${p.id}, Lat: ${p.latitude}, Lng: ${p.longitude}`);
    });

    if (pins.length > 0) {
      if (pins[0].latitude === null || pins[0].longitude === null) {
        console.error('FAILED: latitude or longitude is null');
      } else {
        console.log('SUCCESS: findMany returns coordinates');
      }
    }

    console.log('\n--- Verifying findManyInBBox (Model Extension) ---');
    // San Francisco-ish area for testing if data exists, or just very wide box
    const bboxPins = await (prisma.voicePin as any).findManyInBBox({
      minLat: -90, maxLat: 90, minLng: -180, maxLng: 180, limit: 1
    });
    console.log(`Found ${bboxPins.length} pins in BBox`);
    if (bboxPins.length > 0) {
        console.log(`BBox Pin 0 Coordinates: ${bboxPins[0].latitude}, ${bboxPins[0].longitude}`);
    }

    process.exit(0);
  } catch (e) {
    console.error('Verification failed:', e);
    process.exit(1);
  }
}

verify();
