export interface LoginAudit {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  loginTime: string;
  status: 'SUCCESS' | 'FAILED' | 'LOCKED';
  failureReason?: string;
  deviceInfo?: string;
}
