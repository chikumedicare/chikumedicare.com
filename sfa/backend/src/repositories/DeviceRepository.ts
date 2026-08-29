import { Env } from '../types';

export interface DeviceRecord {
  id: string;
  user_id: string;
  fcm_token: string;
  device_id?: string;
  device_name?: string;
  device_model?: string;
  os_version?: string;
  app_version?: string;
  is_active: number;
}

export class DeviceRepository {
  static async registerDevice(
    env: Env,
    userId: string,
    fcmToken: string,
    deviceDetails: Partial<DeviceRecord> = {}
  ): Promise<boolean> {
    if (!userId || !fcmToken) return false;

    // Check if token already exists
    const existing = await env.chikusfa_db
      .prepare('SELECT id, user_id FROM user_devices WHERE fcm_token = ?')
      .bind(fcmToken)
      .first<{ id: string; user_id: string }>();

    if (existing) {
      // Update existing token record
      await env.chikusfa_db
        .prepare(
          `UPDATE user_devices SET
            user_id = ?,
            device_id = ?,
            device_name = ?,
            device_model = ?,
            os_version = ?,
            app_version = ?,
            is_active = 1,
            updated_at = CURRENT_TIMESTAMP
          WHERE fcm_token = ?`
        )
        .bind(
          userId,
          deviceDetails.device_id || null,
          deviceDetails.device_name || null,
          deviceDetails.device_model || null,
          deviceDetails.os_version || null,
          deviceDetails.app_version || null,
          fcmToken
        )
        .run();
    } else {
      // Insert new device token record
      const id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await env.chikusfa_db
        .prepare(
          `INSERT INTO user_devices (
            id, user_id, fcm_token, device_id, device_name, device_model, os_version, app_version, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
        )
        .bind(
          id,
          userId,
          fcmToken,
          deviceDetails.device_id || null,
          deviceDetails.device_name || null,
          deviceDetails.device_model || null,
          deviceDetails.os_version || null,
          deviceDetails.app_version || null
        )
        .run();
    }

    return true;
  }

  static async unregisterDevice(env: Env, userId: string, fcmToken?: string): Promise<boolean> {
    if (fcmToken) {
      await env.chikusfa_db
        .prepare('UPDATE user_devices SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE fcm_token = ? AND user_id = ?')
        .bind(fcmToken, userId)
        .run();
    } else {
      await env.chikusfa_db
        .prepare('UPDATE user_devices SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?')
        .bind(userId)
        .run();
    }
    return true;
  }

  static async getTokensForRecipients(
    env: Env,
    recipients: { userIds?: string[]; role?: string; hqIds?: string[]; broadcast?: boolean }
  ): Promise<{ userId: string; fcmToken: string }[]> {
    if (recipients.broadcast) {
      const res = await env.chikusfa_db
        .prepare('SELECT user_id, fcm_token FROM user_devices WHERE is_active = 1')
        .all<{ user_id: string; fcm_token: string }>();
      return (res.results || []).map((r) => ({ userId: r.user_id, fcmToken: r.fcm_token }));
    }

    const userIdsToFetch: string[] = [...(recipients.userIds || [])];

    if (recipients.role || (recipients.hqIds && recipients.hqIds.length > 0)) {
      let query = 'SELECT id FROM users WHERE is_active = 1';
      const params: any[] = [];

      if (recipients.role) {
        query += ' AND role = ?';
        params.push(recipients.role);
      }

      if (recipients.hqIds && recipients.hqIds.length > 0) {
        const placeholders = recipients.hqIds.map(() => '?').join(',');
        query += ` AND hq_id IN (${placeholders})`;
        params.push(...recipients.hqIds);
      }

      const userRes = await env.chikusfa_db.prepare(query).bind(...params).all<{ id: string }>();
      (userRes.results || []).forEach((u) => {
        if (!userIdsToFetch.includes(u.id)) {
          userIdsToFetch.push(u.id);
        }
      });
    }

    if (userIdsToFetch.length === 0) return [];

    const placeholders = userIdsToFetch.map(() => '?').join(',');
    const tokenRes = await env.chikusfa_db
      .prepare(`SELECT user_id, fcm_token FROM user_devices WHERE is_active = 1 AND user_id IN (${placeholders})`)
      .bind(...userIdsToFetch)
      .all<{ user_id: string; fcm_token: string }>();

    return (tokenRes.results || []).map((r) => ({ userId: r.user_id, fcmToken: r.fcm_token }));
  }

  static async markTokenInactive(env: Env, fcmToken: string): Promise<boolean> {
    await env.chikusfa_db
      .prepare('UPDATE user_devices SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE fcm_token = ?')
      .bind(fcmToken)
      .run();
    return true;
  }

  static async logNotification(
    env: Env,
    logData: {
      id: string;
      recipientId: string;
      notificationType?: string;
      title?: string;
      body?: string;
      priority?: string;
      status: string;
      providerMessageId?: string;
      errorMessage?: string;
      retryAttempts?: number;
      deliveredAt?: string;
    }
  ): Promise<boolean> {
    try {
      await env.chikusfa_db
        .prepare(
          `INSERT INTO notification_logs (
            id, recipient_id, notification_type, title, body, priority, status, provider_type, provider_message_id, error_message, retry_attempts, delivered_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'FCM', ?, ?, ?, ?)`
        )
        .bind(
          logData.id,
          logData.recipientId,
          logData.notificationType || 'GENERAL',
          logData.title || '',
          logData.body || '',
          logData.priority || 'NORMAL',
          logData.status,
          logData.providerMessageId || null,
          logData.errorMessage || null,
          logData.retryAttempts || 0,
          logData.deliveredAt || null
        )
        .run();
      return true;
    } catch (err) {
      console.error('[DeviceRepository] logNotification Error:', err);
      return false;
    }
  }
}
