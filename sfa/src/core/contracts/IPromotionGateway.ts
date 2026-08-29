import type { SfaRole } from '../domain/hr/user.types';

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
  createdAt: string;
}

export interface IPromotionGateway {
  promoteUser(
    userId: string,
    role: SfaRole,
    hqId?: string,
    designation?: string,
    remarks?: string,
    effectiveDate?: string,
    actionType?: string
  ): Promise<PromotionRecord>;
  getPromotionHistory(): Promise<PromotionRecord[]>;
}
