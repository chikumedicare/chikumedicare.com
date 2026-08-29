import { Env, AuthUser } from '../types';
import { DeviceRepository } from '../repositories/DeviceRepository';
import { NotificationProviderFactory } from '../services/notifications/NotificationProviderFactory';
import { NotificationPayload } from '../services/notifications/INotificationProvider';

export class NotificationController {
  static async registerDevice(request: Request, env: Env, authUser: AuthUser) {
    try {
      const body = (await request.json()) as {
        fcmToken: string;
        deviceId?: string;
        deviceName?: string;
        deviceModel?: string;
        osVersion?: string;
        appVersion?: string;
      };

      if (!body.fcmToken) {
        return new Response(JSON.stringify({ error: '400 Bad Request: Missing fcmToken' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const success = await DeviceRepository.registerDevice(env, authUser.id, body.fcmToken, {
        device_id: body.deviceId,
        device_name: body.deviceName,
        device_model: body.deviceModel,
        os_version: body.osVersion,
        app_version: body.appVersion,
      });

      return new Response(JSON.stringify({ success }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      console.error('[NotificationController] registerDevice error:', err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async unregisterDevice(request: Request, env: Env, authUser: AuthUser) {
    try {
      const body = (await request.json()) as { fcmToken?: string };
      const success = await DeviceRepository.unregisterDevice(env, authUser.id, body?.fcmToken);
      return new Response(JSON.stringify({ success }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      console.error('[NotificationController] unregisterDevice error:', err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async sendNotification(request: Request, env: Env, authUser: AuthUser) {
    try {
      const payload = (await request.json()) as NotificationPayload;

      if (!payload.notificationId) {
        payload.notificationId = `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }

      if (!payload.recipients || !payload.notification?.title) {
        return new Response(
          JSON.stringify({ error: '400 Bad Request: Missing recipients or notification title/body' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Step 1: Device Repository lookup for active FCM tokens
      const targetTokens = await DeviceRepository.getTokensForRecipients(env, payload.recipients);

      if (targetTokens.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            notificationId: payload.notificationId,
            deliveredCount: 0,
            message: 'No active device tokens found for target recipients.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Step 2: Resolve Notification Provider from Factory
      const provider = NotificationProviderFactory.getProvider(env.NOTIFICATION_PROVIDER || 'FCM');

      // Step 3: Provider sends notification to FCM
      const providerResult = await provider.sendNotification(targetTokens, payload, env);

      // Step 4: Process Results, Auto-Cleanup Invalid Tokens & Write Audit Logs
      for (const res of providerResult.results) {
        if (res.isUnregistered) {
          // Token is invalid/expired -> auto-deactivate in D1
          await DeviceRepository.markTokenInactive(env, res.fcmToken);
        }

        const statusStr = res.success ? 'DELIVERED' : 'FAILED';
        const deliveredAtStr = res.success ? new Date().toISOString() : undefined;

        await DeviceRepository.logNotification(env, {
          id: `${payload.notificationId}_${res.userId.slice(0, 6)}`,
          recipientId: res.userId,
          notificationType: payload.data?.notificationType || 'GENERAL',
          title: payload.notification.title,
          body: payload.notification.body,
          priority: payload.options?.priority || 'NORMAL',
          status: statusStr,
          providerMessageId: res.messageId,
          errorMessage: res.error,
          deliveredAt: deliveredAtStr,
        });
      }

      return new Response(
        JSON.stringify({
          success: providerResult.success,
          notificationId: payload.notificationId,
          deliveredCount: providerResult.deliveredCount,
          failedCount: providerResult.failedCount,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      console.error('[NotificationController] sendNotification error:', err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
}
