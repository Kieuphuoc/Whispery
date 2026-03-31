import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Syncing cover images from avatars...');
    
    // Get all users who have an avatar but no cover
    const users = await prisma.user.findMany({
        where: {
            avatar: { not: null },
            cover: null
        }
    });

    console.log(`Found ${users.length} users to update.`);

    for (const user of users) {
        if (user.avatar) {
            await prisma.user.update({
                where: { id: user.id },
                data: { cover: user.avatar }
            });
            console.log(`✅ Updated user ${user.username}`);
        }
    }

    console.log('✨ Sync completed!');
}

main()
    .catch((e) => {
        console.error('❌ Sync failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
