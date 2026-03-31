import admin from 'firebase-admin';
import firebaseApp from '../configs/firebase.js';
import prisma from '../prismaClient.js';

class PushNotificationService {
    public async sendPushNotification(userId: number, title: string, body: string, data?: any) {
        if (!firebaseApp) {
            console.warn('Firebase not initialized. Skipping push notification.');
            return;
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true }
            });

            if (!user || !user.fcmToken) {
                console.log(`No FCM token found for user ${userId}. Skipping push notification.`);
                return;
            }

            const message: admin.messaging.Message = {
                notification: { title, body },
                data: data ? this.stringifyData(data) : {},
                token: user.fcmToken,
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'default'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default'
                        }
                    }
                }
            };

            const response = await admin.messaging().send(message);
            console.log(`Push notification sent successfully to user ${userId}:`, response);
        } catch (error) {
            console.error(`Error sending push notification to user ${userId}:`, error);
        }
    }

    private stringifyData(data: any): { [key: string]: string } {
        const result: { [key: string]: string } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
            }
        }
        return result;
    }
}

export const pushNotificationService = new PushNotificationService();
