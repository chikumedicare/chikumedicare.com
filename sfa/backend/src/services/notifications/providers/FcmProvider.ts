import { INotificationProvider, NotificationPayload, ProviderSendResult } from '../INotificationProvider';
import { getGoogleAccessToken } from '../../../utils/googleAuth';

export class FcmProvider implements INotificationProvider {
  private cachedAccessToken: { token: string; expiresAt: number } | null = null;

  private async getAccessToken(env: any): Promise<string | null> {
    if (this.cachedAccessToken && Date.now() < this.cachedAccessToken.expiresAt) {
      return this.cachedAccessToken.token;
    }

    try {
      let clientEmail = env.FIREBASE_CLIENT_EMAIL;
      let privateKey = env.FIREBASE_PRIVATE_KEY;

      if (!clientEmail || !privateKey) {
        if (env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            const parsed = typeof env.FIREBASE_SERVICE_ACCOUNT === 'string'
              ? JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
              : env.FIREBASE_SERVICE_ACCOUNT;
            clientEmail = parsed.client_email;
            privateKey = parsed.private_key;
          } catch (e) {}
        }
      }

      if (clientEmail && privateKey) {
        const token = await getGoogleAccessToken(clientEmail, privateKey);
        this.cachedAccessToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
        return token;
      }
    } catch (err) {
      console.error('[FcmProvider] getAccessToken Error:', err);
    }
    return null;
  }

  async sendNotification(
    tokens: { userId: string; fcmToken: string }[],
    payload: NotificationPayload,
    env: any
  ): Promise<ProviderSendResult> {
    const results: ProviderSendResult['results'] = [];
    let deliveredCount = 0;
    let failedCount = 0;

    const projectId = env.FIREBASE_PROJECT_ID || 'chikusfa';
    const accessToken = await this.getAccessToken(env);
    const legacyKey = env.FCM_SERVER_KEY;

    for (const item of tokens) {
      if (!accessToken && !legacyKey) {
        console.log(`[FcmProvider] Simulated FCM push to user ${item.userId} (Token: ${item.fcmToken.slice(0, 10)}...)`);
        results.push({
          userId: item.userId,
          fcmToken: item.fcmToken,
          success: true,
          messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        });
        deliveredCount++;
        continue;
      }

      try {
        if (accessToken) {
          // Modern Firebase HTTP v1 API
          const v1Payload = {
            message: {
              token: item.fcmToken,
              notification: {
                title: payload.notification.title,
                body: payload.notification.body,
                image: payload.notification.imageUrl || undefined,
              },
              data: {
                ...(payload.data || {}),
                notificationId: payload.notificationId,
                title: payload.notification.title,
                body: payload.notification.body,
              },
              android: {
                priority: payload.options?.priority === 'HIGH' || payload.options?.priority === 'CRITICAL' ? 'HIGH' : 'NORMAL',
                notification: {
                  channel_id: 'default',
                  sound: 'default',
                },
              },
            },
          };

          const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(v1Payload),
          });

          if (res.ok) {
            const data = (await res.json()) as any;
            results.push({
              userId: item.userId,
              fcmToken: item.fcmToken,
              success: true,
              messageId: data.name || `msg_${Date.now()}`,
            });
            deliveredCount++;
          } else {
            const errText = await res.text();
            const isUnregistered = errText.includes('UNREGISTERED') || errText.includes('NOT_FOUND');
            results.push({
              userId: item.userId,
              fcmToken: item.fcmToken,
              success: false,
              error: `HTTP ${res.status}: ${errText}`,
              isUnregistered,
            });
            failedCount++;
          }
        } else {
          // Fallback Legacy API
          const legacyPayload = {
            to: item.fcmToken,
            priority: payload.options?.priority === 'HIGH' || payload.options?.priority === 'CRITICAL' ? 'high' : 'normal',
            notification: {
              title: payload.notification.title,
              body: payload.notification.body,
            },
            data: {
              ...(payload.data || {}),
              notificationId: payload.notificationId,
            },
          };

          const res = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `key=${legacyKey}`,
            },
            body: JSON.stringify(legacyPayload),
          });

          if (res.ok) {
            results.push({
              userId: item.userId,
              fcmToken: item.fcmToken,
              success: true,
              messageId: `msg_${Date.now()}`,
            });
            deliveredCount++;
          } else {
            const errText = await res.text();
            results.push({
              userId: item.userId,
              fcmToken: item.fcmToken,
              success: false,
              error: errText,
            });
            failedCount++;
          }
        }
      } catch (err: any) {
        results.push({
          userId: item.userId,
          fcmToken: item.fcmToken,
          success: false,
          error: err.message || 'FCM Exception',
        });
        failedCount++;
      }
    }

    return {
      success: deliveredCount > 0,
      deliveredCount,
      failedCount,
      results,
    };
  }
}
