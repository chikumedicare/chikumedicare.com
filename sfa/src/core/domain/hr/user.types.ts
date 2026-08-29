export type SfaRole = 'MR' | 'SR_MR' | 'ASM' | 'SR_ASM' | 'RSM' | 'ZSM' | 'NSM' | 'VP' | 'OWNER' | 'ADMIN';

export interface SfaUser {
  joiningDate?: string;
  id: string;
  userId: string;
  empCode: string;
  fullName: string;
  role: SfaRole;
  isActive: boolean;
  mobile: string;
  email: string;
  designation: string;
  hqId?: string;
  hqName?: string;
  reportingToName?: string;
  reportsToId?: string;
  zoneId?: string;
  stateId?: string;
  coveringHqIds: string[];
  areaIds: string[];
  divisionId?: string;
  deviceId?: string;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  registeredOn?: string;
  lastLogin?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  status?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCredentialUpdate {
  userId: string;
  password?: string;
  isActive: boolean;
  role: SfaRole;
}

export interface LoginAudit {
  id: string;
  userId: string;
  ipAddress?: string;
  ip_address?: string;
  userAgent?: string;
  user_agent?: string;
  loginTime?: string;
  login_time?: string;
  timestamp?: string;
  created_at?: string;
  status?: string;
  result?: string;
  action?: string;
  clientType?: string;
  deviceId?: string;
  device_id?: string;
  deviceModel?: string;
  device_model?: string;
  deviceInfo?: string;
  device_info?: string;
  failureReason?: string;
  failure_reason?: string;
}
