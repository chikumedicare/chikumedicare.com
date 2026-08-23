import type { SfaRole } from './user.types';

export interface TransferRequest {
  id: string;
  userId: string;
  userName: string;
  currentHqId: string;
  newHqId: string;
  effectiveDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  approvedBy?: string;
}

export interface PromotionRequest {
  id: string;
  userId: string;
  userName: string;
  currentRole: SfaRole;
  newRole: SfaRole;
  newHqId?: string;
  effectiveDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  approvedBy?: string;
}

export interface LifecycleAudit {
  id: string;
  type: 'TRANSFER' | 'PROMOTION' | 'RESIGNATION' | 'TERMINATION';
  userId: string;
  details: string;
  timestamp: string;
  performedBy: string;
}
