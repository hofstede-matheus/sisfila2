export interface NotificationService {
  sendNotification(
    to: string,
    title: string,
    body: string,
    notificationTypes: NotificationTypes,
  ): Promise<void>;
  subscribeToTopic(topic: string, token: string): Promise<void>;
  unsubscribeFromTopic(topic: string, token: string): Promise<void>;
}

export enum NotificationTypes {
  TO_TOKEN = 'TO_TOKEN',
  TO_TOPIC = 'TO_TOPIC',
}

export const NotificationService = Symbol('NotificationService');
