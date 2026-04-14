import { PrismaClient, UserStatus, UserRole, VoiceType, Visibility, ReactionType, FriendRequestStatus, NotificationType, ReportReason, ReportStatus, VoicePinStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type VoicePinSeedInput = {
    audioUrl: string;
    content?: string | null;
    audioDuration?: number | null;
    audioSize?: number | null;
    lat: number;
    lng: number;
    address?: string | null;
    visibility?: Visibility;
    isAnonymous?: boolean;
    type?: VoiceType;
    unlockRadius?: number;
    emotionLabel?: string | null;
    emotionScore?: number | null;
    stickerUrl?: string | null;
    deviceModel?: string | null;
    osVersion?: string | null;
    listensCount?: number;
    reactionsCount?: number;
    commentsCount?: number;
    status?: VoicePinStatus;
    userId: number;
    createdAt?: Date | string;
};

async function createVoicePinRaw(input: VoicePinSeedInput) {
    const visibility = input.visibility ?? Visibility.PUBLIC;
    const type = input.type ?? VoiceType.STANDARD;
    const status = input.status ?? VoicePinStatus.APPROVED;

    const rows = await prisma.$queryRaw<Array<{ id: number }>>`
        INSERT INTO "VoicePin" (
            "audioUrl",
            "content",
            "audioDuration",
            "audioSize",
            "location",
            "address",
            "visibility",
            "isAnonymous",
            "type",
            "unlockRadius",
            "emotionLabel",
            "emotionScore",
            "stickerUrl",
            "deviceModel",
            "osVersion",
            "listensCount",
            "reactionsCount",
            "commentsCount",
            "status",
            "userId",
            "createdAt",
            "updatedAt"
        ) VALUES (
            ${input.audioUrl},
            ${input.content ?? null},
            ${input.audioDuration ?? null},
            ${input.audioSize ?? null},
            ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326),
            ${input.address ?? null},
            CAST(${visibility} AS "Visibility"),
            ${input.isAnonymous ?? false},
            CAST(${type} AS "VoiceType"),
            ${input.unlockRadius ?? 0},
            ${input.emotionLabel ?? null},
            ${input.emotionScore ?? null},
            ${input.stickerUrl ?? null},
            ${input.deviceModel ?? null},
            ${input.osVersion ?? null},
            ${input.listensCount ?? 0},
            ${input.reactionsCount ?? 0},
            ${input.commentsCount ?? 0},
            CAST(${status} AS "VoicePinStatus"),
            ${input.userId},
            ${input.createdAt ?? new Date()},
            ${input.createdAt ?? new Date()}
        )
        RETURNING "id";
    `;

    return rows[0];
}

async function main() {
    console.log('🌱 Starting Optimized Seeding...');

    // Clean up
    console.log('🧹 Cleaning up existing data...');
    await prisma.$executeRaw`TRUNCATE TABLE "VoiceViewHistory", "Report", "Notification", "UserAchievement", "DiscoveredVoice", "Reaction", "Comment", "Image", "VoicePin", "Friendship", "Session", "Achievement", "LevelThreshold", "User" RESTART IDENTITY CASCADE`;

    const hashedPassword = await bcrypt.hash('123phuoc', 10);

    // 1. Create 10 Users
    console.log('👤 Creating 10 users...');
    const userData = [
        { username: 'nguyen_van_a', displayName: 'Nguyễn Văn A', email: 'a@example.com' },
        { username: 'tran_thi_b', displayName: 'Trần Thị B', email: 'b@example.com' },
        { username: 'le_hoang_c', displayName: 'Lê Hoàng C', email: 'c@example.com' },
        { username: 'pham_minh_d', displayName: 'Phạm Minh D', email: 'd@example.com' },
        { username: 'hoang_anh_e', displayName: 'Hoàng Anh E', email: 'e@example.com' },
        { username: 'vu_ma_f', displayName: 'Vũ Mạnh F', email: 'f@example.com' },
        { username: 'dang_thu_g', displayName: 'Đặng Thu G', email: 'g@example.com' },
        { username: 'bui_gia_h', displayName: 'Bùi Gia H', email: 'h@example.com' },
        { username: 'ngo_quoc_i', displayName: 'Ngô Quốc I', email: 'i@example.com' },
        { username: 'admin', displayName: 'Hệ Thống Admin', email: 'admin@whisper.app', role: UserRole.ADMIN },
    ];

    const users = await Promise.all(userData.map(u => 
        prisma.user.create({
            data: {
                ...u,
                password: hashedPassword,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
                level: Math.floor(Math.random() * 5) + 1,
                xp: Math.floor(Math.random() * 500),
                status: UserStatus.ACTIVE
            }
        })
    ));

    // 2. Define Locations
    const hcmLocations = [
        { name: 'Quận 1 - Phố đi bộ', lat: 10.7745, lng: 106.7030 },
        { name: 'Quận 3 - Hồ Con Rùa', lat: 10.7827, lng: 106.6961 },
        { name: 'Quận 5 - Chợ Lớn', lat: 10.7511, lng: 106.6631 },
        { name: 'Quận 7 - Phú Mỹ Hưng', lat: 10.7294, lng: 106.7081 },
        { name: 'Quận Bình Thạnh - Landmark 81', lat: 10.7951, lng: 106.7218 },
        { name: 'Quận Tân Bình - Sân bay', lat: 10.8185, lng: 106.6588 },
        { name: 'Quận Thủ Đức - ĐH Quốc Gia', lat: 10.8751, lng: 106.8007 },
        { name: 'Quận 10 - Vạn Hạnh Mall', lat: 10.7766, lng: 106.6675 },
    ];

    const otherLocations = [
        { name: 'Hà Nội - Hoàn Kiếm', lat: 21.0285, lng: 105.8542 },
        { name: 'Đà Nẵng - Cầu Rồng', lat: 16.0612, lng: 108.2275 },
        { name: 'Cần Thơ - Bến Ninh Kiều', lat: 10.0342, lng: 105.7865 },
        { name: 'Huế - Kinh Thành', lat: 16.4637, lng: 107.5908 },
        { name: 'Đà Lạt - Hồ Xuân Hương', lat: 11.9416, lng: 108.4411 },
    ];

    // 3. Create 50 VoicePins
    console.log('🎤 Creating 50 voice pins...');
    const voicePins: any[] = [];
    const emotions = ['Vui vẻ', 'Buồn', 'Giận dữ', 'Hào hứng', 'Nhớ nhung', 'Chill', 'Lo lắng'];

    for (let i = 0; i < 50; i++) {
        let loc;
        if (i < 35) {
            // 35 in HCM
            const base = hcmLocations[i % hcmLocations.length];
            // Add slight randomness to coordinates
            loc = {
                name: base.name,
                lat: base.lat + (Math.random() - 0.5) * 0.01,
                lng: base.lng + (Math.random() - 0.5) * 0.01
            };
        } else {
            // 15 elsewhere
            const base = otherLocations[i % otherLocations.length];
            loc = {
                name: base.name,
                lat: base.lat + (Math.random() - 0.5) * 0.05,
                lng: base.lng + (Math.random() - 0.5) * 0.05
            };
        }

        const userId = users[i % 10].id;
        const status = i % 10 === 0 ? VoicePinStatus.PENDING : (i % 15 === 0 ? VoicePinStatus.REJECTED : VoicePinStatus.APPROVED);
        
        // Randomly use one of our local samples or fallback to URL
        const audioSamples = ['/uploads/voice_samples/sample1.m4a', '/uploads/voice_samples/sample2.m4a'];
        const audioUrl = i % 2 === 0 ? audioSamples[0] : (i % 3 === 0 ? audioSamples[1] : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

        const pin = await createVoicePinRaw({
            audioUrl: audioUrl,
            content: `Cảm nhận tại ${loc.name} - Voice pin #${i + 1}`,
            audioDuration: Math.floor(Math.random() * 60) + 5,
            audioSize: 100000 + Math.floor(Math.random() * 1000000),
            lat: loc.lat,
            lng: loc.lng,
            address: loc.name + ', Việt Nam',
            visibility: i % 12 === 0 ? Visibility.PRIVATE : Visibility.PUBLIC,
            type: i % 8 === 0 ? VoiceType.HIDDEN_AR : VoiceType.STANDARD,
            unlockRadius: i % 8 === 0 ? 50 : 0,
            emotionLabel: emotions[Math.floor(Math.random() * emotions.length)],
            emotionScore: Math.random(),
            listensCount: Math.floor(Math.random() * 200),
            reactionsCount: Math.floor(Math.random() * 50),
            commentsCount: Math.floor(Math.random() * 10),
            status: status,
            userId: userId,
            createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30) // Within last 30 days
        });
        voicePins.push(pin);
    }

    // 3.5. Create Images for VoicePins
    console.log('🖼️ Creating images for voice pins...');
    const imageUrls = [
        'https://i.pinimg.com/736x/41/aa/ef/41aaef10b7832f1a01075ed35a6e0e7c.jpg',
        'https://i.pinimg.com/1200x/33/e0/5a/33e05ab82bccc5a9148e46c9b079f508.jpg',
        'https://i.pinimg.com/1200x/d3/8a/ae/d38aae33e141500459323d70230ecda3.jpg',
        'https://i.pinimg.com/736x/8e/9f/0a/8e9f0ab7150ee7ebd890fcda41c7d18f.jpg',
        'https://i.pinimg.com/736x/7b/fa/7b/7bfa7b2be9062690557c498174db2984.jpg',
        'https://i.pinimg.com/736x/8c/26/a5/8c26a5dcfd0470ef7da8814e1df231f5.jpg',
        'https://i.pinimg.com/736x/3c/49/fc/3c49fc9bc2e937b13434f2839eacd48a.jpg',
        'https://i.pinimg.com/736x/65/7b/c6/657bc6cbcc268c87c938f166d7be26a8.jpg',
        'https://i.pinimg.com/1200x/67/b8/e6/67b8e6de5eaf69a12778c53663592ab6.jpg',
        'https://i.pinimg.com/736x/34/10/98/341098266e923df0299f984d2cc9429b.jpg',
        'https://i.pinimg.com/736x/fa/30/70/fa307003af3753c662b922e67ec83ae0.jpg',
        'https://i.pinimg.com/736x/9d/26/58/9d265884131b502444f050f376b2cd80.jpg',
        'https://i.pinimg.com/736x/b8/41/b0/b841b096703eca40640e8aeaf552fedb.jpg',
        'https://i.pinimg.com/736x/61/20/81/612081380907b952eec53cb790d028b3.jpg',
        'https://i.pinimg.com/736x/6b/8a/ea/6b8aea0e7c7f9a4c402e743a68d669ca.jpg',
        'https://i.pinimg.com/736x/2f/0d/2d/2f0d2dbb71c50f5347621fa2c509c10e.jpg',
        'https://i.pinimg.com/736x/3d/23/f0/3d23f0c728bab69e512dce62979b1800.jpg',
        'https://i.pinimg.com/736x/3c/9e/f4/3c9ef423b25ba7b0ca693a759d2df00b.jpg',
        'https://i.pinimg.com/736x/df/22/79/df2279d38debd924c70ac8566ac18033.jpg',
        'https://i.pinimg.com/736x/6a/e3/c6/6ae3c6195197dc286c88af60b0f7d367.jpg',
        'https://i.pinimg.com/1200x/96/a1/fc/96a1fcba61e470cf1f49648904c4d061.jpg',
        'https://i.pinimg.com/1200x/1c/ae/09/1cae09250c40524142bb5a5865da434e.jpg',
        'https://i.pinimg.com/1200x/cd/ce/d4/cdced46498cdf655086c0236cb7f8318.jpg',
        'https://i.pinimg.com/1200x/7c/17/2b/7c172b3e2406b59fd8747ae0e6343e36.jpg'
    ];

    await Promise.all(
        voicePins.map((vp, index) =>
            prisma.image.create({
                data: {
                    imageUrl: imageUrls[index % imageUrls.length],
                    voicePinId: vp.id
                }
            })
        )
    );

    // 4. Create ~10 Reports
    console.log('🚩 Creating 10 reports...');
    const reportReasons = [ReportReason.SPAM, ReportReason.HARASSMENT, ReportReason.HATE_SPEECH, ReportReason.VIOLENCE, ReportReason.OTHER];
    const reportStatuses = [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW, ReportStatus.RESOLVED, ReportStatus.DISMISSED];

    for (let i = 0; i < 10; i++) {
        const reporterId = users[(i + 5) % 10].id;
        const targetPinId = voicePins[i * 4].id; // Report every 4th pin or so

        await prisma.report.create({
            data: {
                reason: reportReasons[i % reportReasons.length],
                description: `Báo cáo nội dung không phù hợp tại pin #${targetPinId}. Nội dung có dấu hiệu ${reportReasons[i % reportReasons.length].toLowerCase()}.`,
                status: reportStatuses[i % reportStatuses.length],
                reporterId: reporterId,
                voicePinId: targetPinId,
                violationTags: i % 2 === 0 ? ['SPAM', 'OFFENSIVE'] : [],
                violationScore: Math.random() * 10,
                createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 5)
            }
        });
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
