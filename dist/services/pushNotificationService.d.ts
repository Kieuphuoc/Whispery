declare class PushNotificationService {
    sendPushNotification(userId: number, title: string, body: string, data?: any): Promise<void>;
    private stringifyData;
}
export declare const pushNotificationService: PushNotificationService;
export {};
//# sourceMappingURL=pushNotificationService.d.ts.map