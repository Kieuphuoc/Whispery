import { PrismaClient, UserStatus, VoiceType, Visibility, ReactionType, FriendRequestStatus, NotificationType, ReportReason, ReportStatus } from '@prisma/client';
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
    userId: number;
    createdAt?: Date | string;
};

async function createVoicePinRaw(input: VoicePinSeedInput) {
    const visibility = input.visibility ?? Visibility.PUBLIC;
    const type = input.type ?? VoiceType.STANDARD;

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
            ${input.userId},
            ${input.createdAt ?? new Date()},
            ${input.createdAt ?? new Date()}
        )
        RETURNING "id";
    `;

    return rows[0];
}

async function main() {
    console.log('🌱 Starting seed...');

    // Clean up existing data and reset ID sequences
    console.log('🧹 Cleaning up existing data...');
    await prisma.$executeRaw`TRUNCATE TABLE "VoiceViewHistory", "Report", "Notification", "UserAchievement", "DiscoveredVoice", "Reaction", "Comment", "Image", "VoicePin", "Friendship", "Session", "Achievement", "LevelThreshold", "User" RESTART IDENTITY CASCADE`;

    // ==========================================
    // 1. LEVEL THRESHOLDS
    // ==========================================
    console.log('📊 Creating level thresholds...');
    const levelThresholds = await Promise.all([
        prisma.levelThreshold.create({
            data: { level: 1, requiredXp: 0, scanRadius: 1000, title: 'Người mới' }
        }),
        prisma.levelThreshold.create({
            data: { level: 2, requiredXp: 100, scanRadius: 1500, title: 'Người khám phá' }
        }),
        prisma.levelThreshold.create({
            data: { level: 3, requiredXp: 300, scanRadius: 2000, title: 'Nhà thám hiểm' }
        }),
        prisma.levelThreshold.create({
            data: { level: 4, requiredXp: 600, scanRadius: 2500, title: 'Người dẫn đường' }
        }),
        prisma.levelThreshold.create({
            data: { level: 5, requiredXp: 1000, scanRadius: 3000, title: 'Lãng khách' }
        }),
        prisma.levelThreshold.create({
            data: { level: 6, requiredXp: 1500, scanRadius: 4000, title: 'Người du hành' }
        }),
        prisma.levelThreshold.create({
            data: { level: 7, requiredXp: 2100, scanRadius: 5000, title: 'Người tiên phong' }
        }),
        prisma.levelThreshold.create({
            data: { level: 8, requiredXp: 2800, scanRadius: 6000, title: 'Người khai phá' }
        }),
        prisma.levelThreshold.create({
            data: { level: 9, requiredXp: 3600, scanRadius: 7500, title: 'Bậc thầy khám phá' }
        }),
        prisma.levelThreshold.create({
            data: { level: 10, requiredXp: 5000, scanRadius: 10000, title: 'Huyền thoại' }
        }),
    ]);
    console.log(`✅ Created ${levelThresholds.length} level thresholds`);

    // ==========================================
    // 2. ACHIEVEMENTS
    // ==========================================
    console.log('🏆 Creating achievements...');
    const achievements = await Promise.all([
        prisma.achievement.create({
            data: {
                name: 'Lời nói đầu tiên',
                description: 'Tạo voice pin đầu tiên của bạn',
                iconUrl: 'https://example.com/icons/first-voice.png',
                xpReward: 50,
                condition: { voice_count: 1 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Người sưu tầm giọng nói',
                description: 'Tạo 10 voice pins',
                iconUrl: 'https://example.com/icons/voice-collector.png',
                xpReward: 150,
                condition: { voice_count: 10 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Giao thiệp rộng',
                description: 'Kết bạn với 5 người',
                iconUrl: 'https://example.com/icons/social-butterfly.png',
                xpReward: 100,
                condition: { friend_count: 5 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Nhà thám hiểm',
                description: 'Khám phá 5 giọng nói ẩn',
                iconUrl: 'https://example.com/icons/explorer.png',
                xpReward: 200,
                condition: { discovered_count: 5 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Người bình luận',
                description: 'Để lại 10 bình luận trên các voice pins',
                iconUrl: 'https://example.com/icons/commenter.png',
                xpReward: 75,
                condition: { comment_count: 10 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Giọng nói phổ biến',
                description: 'Nhận được 50 tương tác trên một voice pin duy nhất',
                iconUrl: 'https://example.com/icons/popular-voice.png',
                xpReward: 250,
                condition: { single_voice_reactions: 50 }
            }
        }),
    ]);
    console.log(`✅ Created ${achievements.length} achievements`);

    // ==========================================
    // 3. USERS
    // ==========================================
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                username: 'my_ngan_2k',
                email: 'myngan@gmail.com',
                password: hashedPassword,
                displayName: 'Mỹ Ngân',
                avatar: 'https://i.pinimg.com/736x/d5/19/0c/d5190c1430fee145a3c76f479134da8f.jpg',
                bio: 'Shopaholic & Genz chính hiệu 💅✨',
                level: 3,
                xp: 350,
                scanRadius: 2000,
                status: UserStatus.ACTIVE,
                createdAt: new Date('2025-07-06T10:00:00Z')
            }
        }),
        prisma.user.create({
            data: {
                username: 'bundau_mamtom',
                email: 'bundau@gmail.com',
                password: hashedPassword,
                displayName: 'Bún Đậu',
                avatar: 'https://i.pinimg.com/736x/b7/86/7f/b7867fb2b579cbfceec90e671f566a36.jpg',
                bio: 'Nghiện bún đậu mắm tôm, không có mắm tôm đời không nể 🍜',
                level: 5,
                xp: 1200,
                scanRadius: 3000,
                status: UserStatus.ACTIVE
            }
        }),
        prisma.user.create({
            data: {
                username: 'dau_dai_hoc',
                email: 'dau_dai_hoc@gmail.com',
                password: hashedPassword,
                googleId: 'google-oauth-id-alex-123',
                displayName: 'Đậu đại học thì đổi tên',
                avatar: 'https://i.pinimg.com/736x/d4/e3/b0/d4e3b0f80d2ef6656fbdc671af9c0975.jpg',
                bio: 'Khi nào đậu đại học tôi mới đổi tên này, thề! ✍️🎓',
                level: 2,
                xp: 150,
                scanRadius: 1500,
                status: UserStatus.ACTIVE
            }
        }),
        prisma.user.create({
            data: {
                username: 'chay_pho_102',
                email: 'chaypho@gmail.com',
                password: hashedPassword,
                displayName: 'Cháy phố',
                avatar: 'https://i.pinimg.com/736x/41/9b/2b/419b2bd96c0aca8761ec0d15c47b6235.jpg',
                bio: 'Hệ hướng ngoại, chuyên săn deal và cháy phố mỗi tối 🏎️💨',
                level: 4,
                xp: 700,
                scanRadius: 2500,
                status: UserStatus.ACTIVE
            }
        }),
        prisma.user.create({
            data: {
                username: 'simp_lo_lord',
                email: 'simplo@gmail.com',
                password: hashedPassword,
                displayName: 'Simp lỏ',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
                bio: 'Simp lỏ chúa, chỉ ở đây để tìm người thương... 💖🥺',
                level: 1,
                xp: 25,
                scanRadius: 1000,
                status: UserStatus.ACTIVE
            }
        }),
    ]);
    console.log(`✅ Created ${users.length} users`);

    // ==========================================
    // 4. FRIENDSHIPS
    // ==========================================
    console.log('🤝 Creating friendships...');
    const friendships = await Promise.all([
        prisma.friendship.create({
            data: {
                senderId: users[0].id,
                receiverId: users[1].id,
                status: FriendRequestStatus.ACCEPTED
            }
        }),
        prisma.friendship.create({
            data: {
                senderId: users[0].id,
                receiverId: users[2].id,
                status: FriendRequestStatus.ACCEPTED
            }
        }),
        prisma.friendship.create({
            data: {
                senderId: users[1].id,
                receiverId: users[3].id,
                status: FriendRequestStatus.ACCEPTED
            }
        }),
        prisma.friendship.create({
            data: {
                senderId: users[2].id,
                receiverId: users[3].id,
                status: FriendRequestStatus.PENDING
            }
        }),
        prisma.friendship.create({
            data: {
                senderId: users[4].id,
                receiverId: users[0].id,
                status: FriendRequestStatus.PENDING
            }
        }),
    ]);
    console.log(`✅ Created ${friendships.length} friendships`);

    // ==========================================
    // 5. VOICE PINS
    // ==========================================
    console.log('🎤 Creating voice pins...');
    const voicePins = await Promise.all([
        // John's voice pins
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            audioDuration: 30,
            audioSize: 720000,
            lat: 10.7769,
            lng: 106.7009,
            address: 'Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Vui vẻ',
            emotionScore: 0.92,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 125,
            reactionsCount: 42,
            commentsCount: 8,
            userId: users[0].id,
            createdAt: new Date('2026-03-15T10:00:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Tin nhắn bí mật chỉ dành cho những người khám phá! 🔍',
            audioDuration: 30,
            audioSize: 480000,
            lat: 10.7829,
            lng: 106.6945,
            address: 'Chợ Bến Thành, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.HIDDEN_AR,
            unlockRadius: 50,
            emotionLabel: 'Bí ẩn',
            emotionScore: 0.78,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 35,
            reactionsCount: 18,
            commentsCount: 3,
            userId: users[0].id,
            createdAt: new Date('2026-03-10T14:30:00Z')
        }),
        // John's additional voice pins
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Buổi chiều mưa ở Sài Gòn, nhớ quá... 🌧️',
            audioDuration: 30,
            audioSize: 560000,
            lat: 10.7731,
            lng: 106.6980,
            address: 'Nhà thờ Đức Bà, Quận 1, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'U sầu',
            emotionScore: 0.88,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 78,
            reactionsCount: 35,
            commentsCount: 11,
            userId: users[0].id,
            createdAt: new Date('2026-03-05T09:15:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Buổi sáng bình yên với ly cà phê sữa đá ☕',
            audioDuration: 30,
            audioSize: 800000,
            lat: 10.7850,
            lng: 106.6950,
            address: 'Cà phê Trung Nguyên, Quận 3, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Bình yên',
            emotionScore: 0.91,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 95,
            reactionsCount: 48,
            commentsCount: 7,
            userId: users[0].id,
            createdAt: new Date('2026-02-28T08:00:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Hồi tưởng về tuổi thơ với những gánh hàng rong đêm khuya 🌙',
            audioDuration: 30,
            audioSize: 1040000,
            lat: 10.7628,
            lng: 106.6602,
            address: 'Chợ Lớn, Quận 5, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Hoài niệm',
            emotionScore: 0.94,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 145,
            reactionsCount: 67,
            commentsCount: 19,
            userId: users[0].id,
            createdAt: new Date('2026-02-20T21:45:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Buổi hẹn hò dưới ánh đèn phố đi bộ 💕',
            audioDuration: 30,
            audioSize: 672000,
            lat: 10.7745,
            lng: 106.7030,
            address: 'Phố đi bộ Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh',
            visibility: Visibility.FRIENDS,
            type: VoiceType.STANDARD,
            emotionLabel: 'Lãng mạn',
            emotionScore: 0.96,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 52,
            reactionsCount: 38,
            commentsCount: 5,
            userId: users[0].id,
            createdAt: new Date('2026-03-12T19:20:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Khám phá một con hẻm nhỏ ở Sài Gòn, tìm thấy một quán ăn tuyệt vời! 🍲',
            audioDuration: 30,
            audioSize: 608000,
            lat: 10.7810,
            lng: 106.6890,
            address: 'Hẻm 138 Lê Thị Riêng, Quận 1, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Cô đơn',
            emotionScore: 0.82,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 62,
            reactionsCount: 29,
            commentsCount: 8,
            userId: users[0].id,
            createdAt: new Date('2026-03-01T15:10:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Buổi hòa nhạc tuyệt vời! Năng lượng khó tin suốt cả đêm 🎶🔥',
            audioDuration: 30,
            audioSize: 448000,
            lat: 10.7880,
            lng: 106.7050,
            address: 'Nhà hát Thành phố, Quận 1, Thành phố Hồ Chi Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Năng động',
            emotionScore: 0.97,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 189,
            reactionsCount: 92,
            commentsCount: 24,
            userId: users[0].id,
            createdAt: new Date('2026-02-15T22:30:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Bình minh trên sông Sài Gòn, thực sự tuyệt đẹp 🌅',
            audioDuration: 30,
            audioSize: 1200000,
            lat: 10.7870,
            lng: 106.7150,
            address: 'Bến Bạch Đằng, Quận 1, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Truyền cảm hứng',
            emotionScore: 0.93,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 112,
            reactionsCount: 56,
            commentsCount: 14,
            userId: users[0].id,
            createdAt: new Date('2026-03-18T06:00:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Suy ngẫm về cuộc đời giữa những con hẻm cũ 🤔',
            audioDuration: 30,
            audioSize: 1408000,
            lat: 10.7720,
            lng: 106.6920,
            address: 'Đường sách Nguyễn Văn Bình, Quận 1, Thành phố Hồ Chi Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Giận dữ',
            emotionScore: 0.86,
            deviceModel: 'iPhone 14 Pro',
            osVersion: 'iOS 17.0',
            listensCount: 83,
            reactionsCount: 41,
            commentsCount: 16,
            userId: users[0].id,
            createdAt: new Date('2026-03-08T11:20:00Z')
        }),
        // Jane's voice pins
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Gợi ý quán cà phê yêu thích của tôi ☕',
            audioDuration: 30,
            audioSize: 960000,
            lat: 10.7867,
            lng: 106.7011,
            address: 'Phố đi bộ Nguyễn Huệ, Quận 1',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Bình yên',
            emotionScore: 0.85,
            deviceModel: 'Samsung Galaxy S24',
            osVersion: 'Android 14',
            listensCount: 89,
            reactionsCount: 31,
            commentsCount: 12,
            userId: users[1].id,
            createdAt: new Date('2026-02-25T16:40:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Suy nghĩ riêng tư chỉ dành cho bạn bè 💭',
            audioDuration: 30,
            audioSize: 1440000,
            lat: 10.7900,
            lng: 106.7100,
            address: 'Landmark 81, Quận Bình Thạnh',
            visibility: Visibility.FRIENDS,
            type: VoiceType.STANDARD,
            emotionLabel: 'Hoài niệm',
            emotionScore: 0.72,
            deviceModel: 'Samsung Galaxy S24',
            osVersion: 'Android 14',
            listensCount: 15,
            reactionsCount: 8,
            commentsCount: 2,
            userId: users[1].id,
            createdAt: new Date('2026-03-14T20:15:00Z')
        }),
        // Alex's voice pins
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Phát hiện món ăn đường phố tuyệt vời! 🍜',
            audioDuration: 30,
            audioSize: 640000,
            lat: 10.7620,
            lng: 106.6830,
            address: 'Quận 5, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            isAnonymous: true,
            type: VoiceType.STANDARD,
            emotionLabel: 'Vui vẻ',
            emotionScore: 0.95,
            deviceModel: 'Pixel 8 Pro',
            osVersion: 'Android 14',
            listensCount: 67,
            reactionsCount: 25,
            commentsCount: 6,
            userId: users[2].id,
            createdAt: new Date('2026-03-03T12:00:00Z')
        }),
        // Sarah's voice pins
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Thông báo buổi gặp gỡ công nghệ! Tham gia cùng chúng tôi nhé! 💻',
            audioDuration: 30,
            audioSize: 1920000,
            lat: 10.8000,
            lng: 106.6500,
            address: 'Quận 7, Thành phố Hồ Chí Minh',
            visibility: Visibility.PUBLIC,
            type: VoiceType.STANDARD,
            emotionLabel: 'Năng động',
            emotionScore: 0.88,
            deviceModel: 'iPhone 15 Pro Max',
            osVersion: 'iOS 17.2',
            listensCount: 203,
            reactionsCount: 78,
            commentsCount: 22,
            userId: users[3].id,
            createdAt: new Date('2026-02-18T14:30:00Z')
        }),
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Địa điểm ẩn mình tuyệt vời cho các nhiếp ảnh gia 📸',
            audioDuration: 30,
            audioSize: 880000,
            lat: 10.7550,
            lng: 106.7200,
            address: 'Cầu Thủ Thiêm, Quận 2',
            visibility: Visibility.PUBLIC,
            type: VoiceType.HIDDEN_AR,
            unlockRadius: 100,
            emotionLabel: 'Lãng mạn',
            emotionScore: 0.90,
            deviceModel: 'iPhone 15 Pro Max',
            osVersion: 'iOS 17.2',
            listensCount: 45,
            reactionsCount: 22,
            commentsCount: 5,
            userId: users[3].id,
            createdAt: new Date('2026-03-17T17:50:00Z')
        }),
        // Extra AR pin near current test location (from device log)
        createVoicePinRaw({
            audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
            content: 'Voice AR test ngay gần bạn — bật camera để khám phá 👀',
            audioDuration: 25,
            audioSize: 520000,
            lat: 10.754872365396297,
            lng: 106.6069211919823,
            address: 'AR test (near device current location)',
            visibility: Visibility.PUBLIC,
            isAnonymous: true,
            type: VoiceType.HIDDEN_AR,
            unlockRadius: 30,
            emotionLabel: 'Bí ẩn',
            emotionScore: 0.80,
            deviceModel: 'Seed',
            osVersion: 'Seed',
            listensCount: 0,
            reactionsCount: 0,
            commentsCount: 0,
            userId: users[0].id,
            createdAt: new Date('2026-03-19T08:00:00Z')
        }),
        // Thêm 20 voice pins rải rác từ tháng 7-2025 đến nay cho my_ngan_2k
        ...Array.from({ length: 20 }).map((_, i) => {
            const startTs = new Date('2025-07-01T00:00:00Z').getTime();
            const endTs = new Date().getTime(); // Từ tháng 7 đến nay
            const randomTs = startTs + Math.random() * (endTs - startTs);
            const randomLat = 10.7 + Math.random() * 0.1; // Random quanh khu vực TPHCM
            const randomLng = 106.6 + Math.random() * 0.1;
            
            return createVoicePinRaw({
                audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
                content: `Chút tâm sự của Mỹ Ngân lúc rảnh rỗi số ${i + 1} ✨`,
                audioDuration: 15 + Math.floor(Math.random() * 30),
                audioSize: 500000 + Math.floor(Math.random() * 500000),
                lat: randomLat,
                lng: randomLng,
                address: 'Thành phố Hồ Chí Minh',
                visibility: Visibility.PUBLIC,
                type: VoiceType.STANDARD,
                emotionLabel: ['Vui vẻ', 'Bình yên', 'Nhớ nhung', 'Hào hứng', 'Chill'][Math.floor(Math.random() * 5)],
                emotionScore: 0.8 + Math.random() * 0.2,
                deviceModel: 'iPhone 14 Pro',
                osVersion: 'iOS 17.0',
                listensCount: Math.floor(Math.random() * 100),
                reactionsCount: Math.floor(Math.random() * 30),
                commentsCount: Math.floor(Math.random() * 10),
                userId: users[0].id,
                createdAt: new Date(randomTs)
            });
        }),
    ]);
    console.log(`✅ Created ${voicePins.length} voice pins`);

    // ==========================================
    // 6. IMAGES FOR VOICE PINS
    // ==========================================
    console.log('🖼️ Creating images...');
    const images = await Promise.all([
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/41/aa/ef/41aaef10b7832f1a01075ed35a6e0e7c.jpg',
                voicePinId: voicePins[0].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/1200x/33/e0/5a/33e05ab82bccc5a9148e46c9b079f508.jpg',
                voicePinId: voicePins[1].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/1200x/d3/8a/ae/d38aae33e141500459323d70230ecda3.jpg',
                voicePinId: voicePins[2].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/8e/9f/0a/8e9f0ab7150ee7ebd890fcda41c7d18f.jpg',
                voicePinId: voicePins[3].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/7b/fa/7b/7bfa7b2be9062690557c498174db2984.jpg',
                voicePinId: voicePins[4].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/8c/26/a5/8c26a5dcfd0470ef7da8814e1df231f5.jpg',
                voicePinId: voicePins[5].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/3c/49/fc/3c49fc9bc2e937b13434f2839eacd48a.jpg',
                voicePinId: voicePins[6].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/65/7b/c6/657bc6cbcc268c87c938f166d7be26a8.jpg',
                voicePinId: voicePins[0].id
            }
        }),
        // John's additional voice pin images
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/1200x/67/b8/e6/67b8e6de5eaf69a12778c53663592ab6.jpg',
                voicePinId: voicePins[7].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/34/10/98/341098266e923df0299f984d2cc9429b.jpg',
                voicePinId: voicePins[8].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/fa/30/70/fa307003af3753c662b922e67ec83ae0.jpg',
                voicePinId: voicePins[9].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/9d/26/58/9d265884131b502444f050f376b2cd80.jpg',
                voicePinId: voicePins[10].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/b8/41/b0/b841b096703eca40640e8aeaf552fedb.jpg',
                voicePinId: voicePins[11].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/61/20/81/612081380907b952eec53cb790d028b3.jpg',
                voicePinId: voicePins[12].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/6b/8a/ea/6b8aea0e7c7f9a4c402e743a68d669ca.jpg',
                voicePinId: voicePins[13].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://i.pinimg.com/736x/2f/0d/2d/2f0d2dbb71c50f5347621fa2c509c10e.jpg',
                voicePinId: voicePins[14].id
            }
        }),
        // Register images for remaining voice pins (from index 15 to end)
        ...(() => {
            const urls = [
                'https://i.pinimg.com/736x/3d/23/f0/3d23f0c728bab69e512dce62979b1800.jpg',
                'https://i.pinimg.com/736x/3c/9e/f4/3c9ef423b25ba7b0ca693a759d2df00b.jpg',
                'https://i.pinimg.com/736x/df/22/79/df2279d38debd924c70ac8566ac18033.jpg',
                'https://i.pinimg.com/736x/6a/e3/c6/6ae3c6195197dc286c88af60b0f7d367.jpg',
                'https://i.pinimg.com/1200x/96/a1/fc/96a1fcba61e470cf1f49648904c4d061.jpg',
                'https://i.pinimg.com/1200x/1c/ae/09/1cae09250c40524142bb5a5865da434e.jpg',
                'https://i.pinimg.com/1200x/cd/ce/d4/cdced46498cdf655086c0236cb7f8318.jpg',
                'https://i.pinimg.com/1200x/7c/17/2b/7c172b3e2406b59fd8747ae0e6343e36.jpg'
            ];
            return voicePins.slice(15).map((vp, index) => 
                prisma.image.create({
                    data: {
                        imageUrl: urls[index % urls.length],
                        voicePinId: vp.id
                    }
                })
            );
        })()
    ]);
    console.log(`✅ Created ${images.length} images`);

    // ==========================================
    // 7. COMMENTS
    // ==========================================
    console.log('💬 Creating comments...');
    const comments = await Promise.all([
        // Comments on first voice pin
        prisma.comment.create({
            data: {
                content: 'Một khung cảnh thật đẹp! Cảm ơn bạn đã chia sẻ!',
                userId: users[1].id,
                voicePinId: voicePins[0].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Tôi nhất định phải ghé thăm nơi này!',
                userId: users[2].id,
                voicePinId: voicePins[0].id
            }
        }),
        // Comments on coffee spot voice pin
        prisma.comment.create({
            data: {
                content: 'Gợi ý quán cà phê tuyệt vời nhất từ trước đến nay! ☕',
                userId: users[0].id,
                voicePinId: voicePins[2].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Sẽ đến đó vào cuối tuần này!',
                userId: users[3].id,
                voicePinId: voicePins[2].id
            }
        }),
        // Voice comment
        prisma.comment.create({
            data: {
                content: 'Đã đính kèm phản hồi bằng giọng nói',
                audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
                audioDuration: 30,
                audioSize: 240000,
                userId: users[2].id,
                voicePinId: voicePins[2].id
            }
        }),
        // Comments on tech meetup
        prisma.comment.create({
            data: {
                content: 'Cho tôi tham gia với! Mấy giờ thì bắt đầu vậy?',
                userId: users[0].id,
                voicePinId: voicePins[5].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Có đồ ăn không nhỉ? 🍕',
                userId: users[4].id,
                voicePinId: voicePins[5].id
            }
        }),
    ]);

    // Create reply comments
    const replies = await Promise.all([
        prisma.comment.create({
            data: {
                content: 'Bạn nên đi đi! Cảnh hoàng hôn ở đó tuyệt lắm.',
                userId: users[0].id,
                voicePinId: voicePins[0].id,
                parentId: comments[1].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Bắt đầu lúc 6 giờ tối! Hẹn gặp lại bạn ở đó!',
                userId: users[3].id,
                voicePinId: voicePins[5].id,
                parentId: comments[5].id
            }
        }),
    ]);
    console.log(`✅ Created ${comments.length + replies.length} comments`);

    // ==========================================
    // 8. REACTIONS
    // ==========================================
    console.log('❤️ Creating reactions...');
    const reactions = await Promise.all([
        // Reactions on first voice pin
        prisma.reaction.create({
            data: { type: ReactionType.LOVE, userId: users[1].id, voicePinId: voicePins[0].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.WOW, userId: users[2].id, voicePinId: voicePins[0].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.LIKE, userId: users[3].id, voicePinId: voicePins[0].id }
        }),
        // Reactions on coffee spot
        prisma.reaction.create({
            data: { type: ReactionType.LOVE, userId: users[0].id, voicePinId: voicePins[2].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.LIKE, userId: users[2].id, voicePinId: voicePins[2].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.LIKE, userId: users[3].id, voicePinId: voicePins[2].id }
        }),
        // Reactions on tech meetup
        prisma.reaction.create({
            data: { type: ReactionType.WOW, userId: users[0].id, voicePinId: voicePins[5].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.LOVE, userId: users[1].id, voicePinId: voicePins[5].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.LIKE, userId: users[2].id, voicePinId: voicePins[5].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.LIKE, userId: users[4].id, voicePinId: voicePins[5].id }
        }),
        // More reactions on other pins
        prisma.reaction.create({
            data: { type: ReactionType.LAUGH, userId: users[0].id, voicePinId: voicePins[4].id }
        }),
        prisma.reaction.create({
            data: { type: ReactionType.LOVE, userId: users[1].id, voicePinId: voicePins[4].id }
        }),
    ]);
    console.log(`✅ Created ${reactions.length} reactions`);

    // ==========================================
    // 9. DISCOVERED VOICES
    // ==========================================
    console.log('🔍 Creating discovered voices...');
    const discoveredVoices = await Promise.all([
        // Users who discovered hidden voice pins
        prisma.discoveredVoice.create({
            data: { userId: users[1].id, voicePinId: voicePins[1].id }
        }),
        prisma.discoveredVoice.create({
            data: { userId: users[2].id, voicePinId: voicePins[1].id }
        }),
        prisma.discoveredVoice.create({
            data: { userId: users[3].id, voicePinId: voicePins[1].id }
        }),
        prisma.discoveredVoice.create({
            data: { userId: users[0].id, voicePinId: voicePins[6].id }
        }),
        prisma.discoveredVoice.create({
            data: { userId: users[1].id, voicePinId: voicePins[6].id }
        }),
    ]);
    console.log(`✅ Created ${discoveredVoices.length} discovered voices`);

    // ==========================================
    // 10. USER ACHIEVEMENTS
    // ==========================================
    console.log('🏅 Creating user achievements...');
    const userAchievements = await Promise.all([
        prisma.userAchievement.create({
            data: { userId: users[0].id, achievementId: achievements[0].id }
        }),
        prisma.userAchievement.create({
            data: { userId: users[1].id, achievementId: achievements[0].id }
        }),
        prisma.userAchievement.create({
            data: { userId: users[1].id, achievementId: achievements[1].id }
        }),
        prisma.userAchievement.create({
            data: { userId: users[1].id, achievementId: achievements[2].id }
        }),
        prisma.userAchievement.create({
            data: { userId: users[2].id, achievementId: achievements[0].id }
        }),
        prisma.userAchievement.create({
            data: { userId: users[3].id, achievementId: achievements[0].id }
        }),
        prisma.userAchievement.create({
            data: { userId: users[3].id, achievementId: achievements[1].id }
        }),
    ]);
    console.log(`✅ Created ${userAchievements.length} user achievements`);

    // ==========================================
    // 11. NOTIFICATIONS
    // ==========================================
    console.log('🔔 Creating notifications...');
    const notifications = await Promise.all([
        prisma.notification.create({
            data: {
                type: NotificationType.NEW_REACTION,
                userId: users[0].id,
                data: { voicePinId: voicePins[0].id, senderId: users[1].id, reactionType: 'LOVE' }
            }
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.NEW_COMMENT,
                userId: users[0].id,
                data: { voicePinId: voicePins[0].id, senderId: users[1].id, commentId: comments[0].id }
            }
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.FRIEND_REQUEST,
                userId: users[0].id,
                data: { senderId: users[4].id, senderName: 'Mike Ross' }
            }
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.FRIEND_ACCEPTED,
                userId: users[2].id,
                data: { senderId: users[0].id, senderName: 'John Doe' }
            }
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.ACHIEVEMENT_EARNED,
                userId: users[1].id,
                isRead: true,
                data: { achievementId: achievements[1].id, achievementName: 'Voice Collector' }
            }
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.VOICE_DISCOVERED,
                userId: users[0].id,
                data: { voicePinId: voicePins[1].id, discovererId: users[1].id }
            }
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.LEVEL_UP,
                userId: users[1].id,
                isRead: true,
                data: { newLevel: 5, newTitle: 'Wanderer', xpGained: 200 }
            }
        }),
        prisma.notification.create({
            data: {
                type: NotificationType.SYSTEM_MESSAGE,
                userId: users[0].id,
                data: { title: 'Chào mừng bạn đến với Whispery!', message: 'Bắt đầu khám phá và chia sẻ giọng nói của bạn với thế giới.' }
            }
        }),
    ]);
    console.log(`✅ Created ${notifications.length} notifications`);

    // ==========================================
    // 12. REPORTS
    // ==========================================
    console.log('🚩 Creating reports...');
    const reports = await Promise.all([
        prisma.report.create({
            data: {
                reason: ReportReason.SPAM,
                description: 'Voice pin này có vẻ như đang quảng cáo sản phẩm',
                status: ReportStatus.PENDING,
                reporterId: users[2].id,
                voicePinId: voicePins[4].id
            }
        }),
        prisma.report.create({
            data: {
                reason: ReportReason.OTHER,
                description: 'Chất lượng âm thanh rất kém và khó nghe',
                status: ReportStatus.RESOLVED,
                moderatorNote: 'Đã xem xét và thấy chất lượng có thể chấp nhận được',
                resolvedAt: new Date(),
                reporterId: users[4].id,
                voicePinId: voicePins[2].id
            }
        }),
    ]);
    console.log(`✅ Created ${reports.length} reports`);

    // ==========================================
    // 13. VOICE VIEW HISTORY
    // ==========================================
    console.log('👁️ Creating voice view history...');
    const viewHistory = await Promise.all([
        prisma.voiceViewHistory.create({
            data: { userId: users[1].id, voicePinId: voicePins[0].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[2].id, voicePinId: voicePins[0].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[3].id, voicePinId: voicePins[0].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[0].id, voicePinId: voicePins[2].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[2].id, voicePinId: voicePins[2].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[0].id, voicePinId: voicePins[5].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[1].id, voicePinId: voicePins[5].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[2].id, voicePinId: voicePins[5].id }
        }),
        prisma.voiceViewHistory.create({
            data: { userId: users[4].id, voicePinId: voicePins[5].id }
        }),
    ]);
    console.log(`✅ Created ${viewHistory.length} voice view history records`);

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log('\n🎉 Seed completed successfully!');
    console.log('=====================================');
    console.log(`📊 Level Thresholds: ${levelThresholds.length}`);
    console.log(`🏆 Achievements: ${achievements.length}`);
    console.log(`👤 Users: ${users.length}`);
    console.log(`🤝 Friendships: ${friendships.length}`);
    console.log(`🎤 Voice Pins: ${voicePins.length}`);
    console.log(`🖼️ Images: ${images.length}`);
    console.log(`💬 Comments: ${comments.length + replies.length}`);
    console.log(`❤️ Reactions: ${reactions.length}`);
    console.log(`🔍 Discovered Voices: ${discoveredVoices.length}`);
    console.log(`🏅 User Achievements: ${userAchievements.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    console.log(`🚩 Reports: ${reports.length}`);
    console.log(`👁️ View History: ${viewHistory.length}`);
    console.log('=====================================');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
