import { PrismaClient, UserStatus, VoiceType, Visibility, ReactionType, FriendRequestStatus, NotificationType, ReportReason, ReportStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clean up existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning up existing data...');
    await prisma.voiceViewHistory.deleteMany();
    await prisma.report.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.discoveredVoice.deleteMany();
    await prisma.reaction.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.image.deleteMany();
    await prisma.voicePin.deleteMany();
    await prisma.friendship.deleteMany();
    await prisma.session.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.levelThreshold.deleteMany();
    await prisma.user.deleteMany();

    // ==========================================
    // 1. LEVEL THRESHOLDS
    // ==========================================
    console.log('📊 Creating level thresholds...');
    const levelThresholds = await Promise.all([
        prisma.levelThreshold.create({
            data: { level: 1, requiredXp: 0, scanRadius: 1000, title: 'Newcomer' }
        }),
        prisma.levelThreshold.create({
            data: { level: 2, requiredXp: 100, scanRadius: 1500, title: 'Explorer' }
        }),
        prisma.levelThreshold.create({
            data: { level: 3, requiredXp: 300, scanRadius: 2000, title: 'Adventurer' }
        }),
        prisma.levelThreshold.create({
            data: { level: 4, requiredXp: 600, scanRadius: 2500, title: 'Pathfinder' }
        }),
        prisma.levelThreshold.create({
            data: { level: 5, requiredXp: 1000, scanRadius: 3000, title: 'Wanderer' }
        }),
        prisma.levelThreshold.create({
            data: { level: 6, requiredXp: 1500, scanRadius: 4000, title: 'Voyager' }
        }),
        prisma.levelThreshold.create({
            data: { level: 7, requiredXp: 2100, scanRadius: 5000, title: 'Pioneer' }
        }),
        prisma.levelThreshold.create({
            data: { level: 8, requiredXp: 2800, scanRadius: 6000, title: 'Trailblazer' }
        }),
        prisma.levelThreshold.create({
            data: { level: 9, requiredXp: 3600, scanRadius: 7500, title: 'Master Explorer' }
        }),
        prisma.levelThreshold.create({
            data: { level: 10, requiredXp: 5000, scanRadius: 10000, title: 'Legend' }
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
                name: 'First Voice',
                description: 'Create your first voice pin',
                iconUrl: 'https://example.com/icons/first-voice.png',
                xpReward: 50,
                condition: { voice_count: 1 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Voice Collector',
                description: 'Create 10 voice pins',
                iconUrl: 'https://example.com/icons/voice-collector.png',
                xpReward: 150,
                condition: { voice_count: 10 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Social Butterfly',
                description: 'Make 5 friends',
                iconUrl: 'https://example.com/icons/social-butterfly.png',
                xpReward: 100,
                condition: { friend_count: 5 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Explorer',
                description: 'Discover 5 hidden voices',
                iconUrl: 'https://example.com/icons/explorer.png',
                xpReward: 200,
                condition: { discovered_count: 5 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Commenter',
                description: 'Leave 10 comments on voice pins',
                iconUrl: 'https://example.com/icons/commenter.png',
                xpReward: 75,
                condition: { comment_count: 10 }
            }
        }),
        prisma.achievement.create({
            data: {
                name: 'Popular Voice',
                description: 'Get 50 reactions on a single voice pin',
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
                username: 'john_doe',
                email: 'john@example.com',
                password: hashedPassword,
                displayName: 'John Doe',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
                bio: 'Voice explorer and music lover 🎵',
                level: 3,
                xp: 350,
                scanRadius: 2000,
                status: UserStatus.ACTIVE
            }
        }),
        prisma.user.create({
            data: {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: hashedPassword,
                displayName: 'Jane Smith',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
                bio: 'Sharing stories one voice at a time',
                level: 5,
                xp: 1200,
                scanRadius: 3000,
                status: UserStatus.ACTIVE
            }
        }),
        prisma.user.create({
            data: {
                username: 'alex_wonder',
                email: 'alex@example.com',
                password: hashedPassword,
                googleId: 'google-oauth-id-alex-123',
                displayName: 'Alex Wonder',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
                bio: 'Adventure seeker 🌍',
                level: 2,
                xp: 150,
                scanRadius: 1500,
                status: UserStatus.ACTIVE
            }
        }),
        prisma.user.create({
            data: {
                username: 'sarah_connor',
                email: 'sarah@example.com',
                password: hashedPassword,
                displayName: 'Sarah Connor',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                bio: 'Tech enthusiast and voice artist',
                level: 4,
                xp: 700,
                scanRadius: 2500,
                status: UserStatus.ACTIVE
            }
        }),
        prisma.user.create({
            data: {
                username: 'mike_ross',
                email: 'mike@example.com',
                password: hashedPassword,
                displayName: 'Mike Ross',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
                bio: 'Just here to whisper...',
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
        prisma.voicePin.create({
            data: {
                audioUrl: 'https://example.com/audio/voice1.mp3',
                content: 'Beautiful sunset at the beach! 🌅',
                audioDuration: 45,
                audioSize: 720000,
                latitude: 10.7769,
                longitude: 106.7009,
                address: 'District 1, Ho Chi Minh City, Vietnam',
                visibility: Visibility.PUBLIC,
                type: VoiceType.STANDARD,
                emotionLabel: 'Happy',
                emotionScore: 0.92,
                deviceModel: 'iPhone 14 Pro',
                osVersion: 'iOS 17.0',
                listensCount: 125,
                reactionsCount: 42,
                commentsCount: 8,
                userId: users[0].id
            }
        }),
        prisma.voicePin.create({
            data: {
                audioUrl: 'https://example.com/audio/voice2.mp3',
                content: 'Secret message for explorers only! 🔍',
                audioDuration: 30,
                audioSize: 480000,
                latitude: 10.7829,
                longitude: 106.6945,
                address: 'Ben Thanh Market, Ho Chi Minh City',
                visibility: Visibility.PUBLIC,
                type: VoiceType.HIDDEN_AR,
                unlockRadius: 50,
                emotionLabel: 'Mysterious',
                emotionScore: 0.78,
                deviceModel: 'iPhone 14 Pro',
                osVersion: 'iOS 17.0',
                listensCount: 35,
                reactionsCount: 18,
                commentsCount: 3,
                userId: users[0].id
            }
        }),
        // Jane's voice pins
        prisma.voicePin.create({
            data: {
                audioUrl: 'https://example.com/audio/voice3.mp3',
                content: 'My favorite coffee spot recommendation ☕',
                audioDuration: 60,
                audioSize: 960000,
                latitude: 10.7867,
                longitude: 106.7011,
                address: 'Nguyen Hue Walking Street, District 1',
                visibility: Visibility.PUBLIC,
                type: VoiceType.STANDARD,
                emotionLabel: 'Relaxed',
                emotionScore: 0.85,
                deviceModel: 'Samsung Galaxy S24',
                osVersion: 'Android 14',
                listensCount: 89,
                reactionsCount: 31,
                commentsCount: 12,
                userId: users[1].id
            }
        }),
        prisma.voicePin.create({
            data: {
                audioUrl: 'https://example.com/audio/voice4.mp3',
                content: 'Private thoughts for friends only 💭',
                audioDuration: 90,
                audioSize: 1440000,
                latitude: 10.7900,
                longitude: 106.7100,
                address: 'Landmark 81, Binh Thanh District',
                visibility: Visibility.FRIENDS,
                type: VoiceType.STANDARD,
                emotionLabel: 'Thoughtful',
                emotionScore: 0.72,
                deviceModel: 'Samsung Galaxy S24',
                osVersion: 'Android 14',
                listensCount: 15,
                reactionsCount: 8,
                commentsCount: 2,
                userId: users[1].id
            }
        }),
        // Alex's voice pins
        prisma.voicePin.create({
            data: {
                audioUrl: 'https://example.com/audio/voice5.mp3',
                content: 'Amazing street food discovery! 🍜',
                audioDuration: 40,
                audioSize: 640000,
                latitude: 10.7620,
                longitude: 106.6830,
                address: 'District 5, Ho Chi Minh City',
                visibility: Visibility.PUBLIC,
                isAnonymous: true,
                type: VoiceType.STANDARD,
                emotionLabel: 'Excited',
                emotionScore: 0.95,
                deviceModel: 'Pixel 8 Pro',
                osVersion: 'Android 14',
                listensCount: 67,
                reactionsCount: 25,
                commentsCount: 6,
                userId: users[2].id
            }
        }),
        // Sarah's voice pins
        prisma.voicePin.create({
            data: {
                audioUrl: 'https://example.com/audio/voice6.mp3',
                content: 'Tech meetup announcement! Join us! 💻',
                audioDuration: 120,
                audioSize: 1920000,
                latitude: 10.8000,
                longitude: 106.6500,
                address: 'District 7, Ho Chi Minh City',
                visibility: Visibility.PUBLIC,
                type: VoiceType.STANDARD,
                emotionLabel: 'Enthusiastic',
                emotionScore: 0.88,
                deviceModel: 'iPhone 15 Pro Max',
                osVersion: 'iOS 17.2',
                listensCount: 203,
                reactionsCount: 78,
                commentsCount: 22,
                userId: users[3].id
            }
        }),
        prisma.voicePin.create({
            data: {
                audioUrl: 'https://example.com/audio/voice7.mp3',
                content: 'Hidden gem location for photographers 📸',
                audioDuration: 55,
                audioSize: 880000,
                latitude: 10.7550,
                longitude: 106.7200,
                address: 'Thu Thiem Bridge, District 2',
                visibility: Visibility.PUBLIC,
                type: VoiceType.HIDDEN_AR,
                unlockRadius: 100,
                emotionLabel: 'Inspiring',
                emotionScore: 0.90,
                deviceModel: 'iPhone 15 Pro Max',
                osVersion: 'iOS 17.2',
                listensCount: 45,
                reactionsCount: 22,
                commentsCount: 5,
                userId: users[3].id
            }
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
                imageUrl: 'https://example.com/images/sunset1.jpg',
                voicePinId: voicePins[0].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://example.com/images/sunset2.jpg',
                voicePinId: voicePins[0].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://example.com/images/coffee-shop.jpg',
                voicePinId: voicePins[2].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://example.com/images/street-food.jpg',
                voicePinId: voicePins[4].id
            }
        }),
        prisma.image.create({
            data: {
                imageUrl: 'https://example.com/images/tech-meetup.jpg',
                voicePinId: voicePins[5].id
            }
        }),
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
                content: 'What a beautiful view! Thanks for sharing!',
                userId: users[1].id,
                voicePinId: voicePins[0].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'I need to visit this place!',
                userId: users[2].id,
                voicePinId: voicePins[0].id
            }
        }),
        // Comments on coffee spot voice pin
        prisma.comment.create({
            data: {
                content: 'Best coffee recommendation ever! ☕',
                userId: users[0].id,
                voicePinId: voicePins[2].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Going there this weekend!',
                userId: users[3].id,
                voicePinId: voicePins[2].id
            }
        }),
        // Voice comment
        prisma.comment.create({
            data: {
                content: 'Voice reply attached',
                audioUrl: 'https://example.com/audio/comment1.mp3',
                audioDuration: 15,
                audioSize: 240000,
                userId: users[2].id,
                voicePinId: voicePins[2].id
            }
        }),
        // Comments on tech meetup
        prisma.comment.create({
            data: {
                content: 'Count me in! What time does it start?',
                userId: users[0].id,
                voicePinId: voicePins[5].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Will there be food? 🍕',
                userId: users[4].id,
                voicePinId: voicePins[5].id
            }
        }),
    ]);

    // Create reply comments
    const replies = await Promise.all([
        prisma.comment.create({
            data: {
                content: 'You should! The view is amazing at sunset.',
                userId: users[0].id,
                voicePinId: voicePins[0].id,
                parentId: comments[1].id
            }
        }),
        prisma.comment.create({
            data: {
                content: 'Starts at 6 PM! See you there!',
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
                data: { title: 'Welcome to Whispery!', message: 'Start exploring and sharing your voice with the world.' }
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
                description: 'This voice pin seems to be promoting a product',
                status: ReportStatus.PENDING,
                reporterId: users[2].id,
                voicePinId: voicePins[4].id
            }
        }),
        prisma.report.create({
            data: {
                reason: ReportReason.OTHER,
                description: 'Audio quality is very poor and hard to understand',
                status: ReportStatus.RESOLVED,
                moderatorNote: 'Reviewed and found to be acceptable quality',
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
