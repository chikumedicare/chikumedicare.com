export interface NotificationPayload {
  notificationId: string;
  recipients: {
    userIds?: string[];
    role?: string;
    hqIds?: string[];
    broadcast?: boolean;
  };
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  data?: Record<string, string>;
  options?: {
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    scheduledFor?: string;
    ttlSeconds?: number;
    retryCount?: number;
  };
}

export interface ProviderSendResult {
  success: boolean;
  deliveredCount: number;
  failedCount: number;
  results: {
    userId: string;
    fcmToken: string;
    success: boolean;
    messageId?: string;
    error?: string;
    isUnregistered?: boolean;
  }[];
}

export interface INotificationProvider {
  sendNotification(
    tokens: { userId: string; fcmToken: string }[],
    payload: NotificationPayload,
    env: any
  ): Promise<ProviderSendResult>;
}
