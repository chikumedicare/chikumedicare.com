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
}

export interface UserCredentialUpdate {
  userId: string;
  password?: string;
  isActive: boolean;
  role: SfaRole;
}
