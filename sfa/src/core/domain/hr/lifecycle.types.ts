import type { SfaRole } from './user.types';

export interface TransferRecord {
  id: string;
  userId: string;
  userName: string;
  previousHqId: string;
  newHqId: string;
  previousDivisionId?: string;
  newDivisionId?: string;
  reason?: string;
  effectiveDate: string;
  createdAt?: string;
  remarks?: string;
  old_data?: any;
  new_data?: any;
  changed_at?: string;
  role?: string;
  status?: string;
  approvedBy?: string;
  [key: string]: any;
}

export interface PromotionRecord {
  id: string;
  userId: string;
  userName: string;
  previousRole: SfaRole;
  newRole: SfaRole;
  hqId?: string;
  designation?: string;
  remarks?: string;
  effectiveDate: string;
  createdAt?: string;
  action_type?: string;
  previous_role?: string;
  new_role?: string;
  status?: string;
  approvedBy?: string;
  [key: string]: any;
}

export type TransferRequest = TransferRecord;
export type PromotionRequest = PromotionRecord;

export interface LifecycleAudit {
  id: string;
  type: string;
  userId: string;
  details: string;
  timestamp: string;
  performedBy: string;
}

export type { LoginAudit } from './user.types';
