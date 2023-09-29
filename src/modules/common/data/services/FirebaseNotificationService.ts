import { Injectable } from '@nestjs/common';
import {
  NotificationService,
  NotificationTypes,
} from '../../domain/services/NotificationService';
import { App, initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

import serviceAccount from '../../../../../serviceAccountKey.json';

@Injectable()
export class FirebaseNotificationService implements NotificationService {
  firebaseApp: App;
  messaging: admin.messaging.Messaging;

  constructor() {
    this.firebaseApp = initializeApp({
      credential: admin.credential.cert({
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
        projectId: serviceAccount.project_id,
      }),
    });
    this.messaging = getMessaging(this.firebaseApp);
  }

  async subscribeToTopic(topic: string, token: string): Promise<void> {
    await this.messaging.subscribeToTopic(token, topic);
  }

  async unsubscribeFromTopic(topic: string, token: string): Promise<void> {
    await this.messaging.unsubscribeFromTopic(token, topic);
  }

  async sendNotification(
    to: string,
    title: string,
    body: string,
    notificationTypes: NotificationTypes,
  ): Promise<void> {
    console.log(
      `Sending notification to ${to} with message: ${body} and title: ${title} and type: ${notificationTypes}`,
    );

    switch (notificationTypes) {
      case NotificationTypes.TO_TOKEN:
        await this.messaging.send({
          token: to,
          notification: {
            title,
            body,
          },
        });
      case NotificationTypes.TO_TOPIC:
        await this.messaging.send({
          topic: to,
          notification: {
            title,
            body,
          },
        });
      default:
        break;
    }
  }
}
