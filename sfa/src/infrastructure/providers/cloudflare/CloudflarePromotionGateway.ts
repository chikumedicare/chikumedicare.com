import { ApiClient } from '../../api/ApiClient';
import type { IPromotionGateway, PromotionRecord } from '../../../core/contracts/IPromotionGateway';
import type { SfaRole } from '../../../core/domain/hr/user.types';

export class CloudflarePromotionGateway implements IPromotionGateway {
  async promoteUser(
    userId: string,
    role: SfaRole,
    hqId?: string,
    designation?: string,
    remarks?: string,
    effectiveDate?: string,
    actionType?: string
  ): Promise<PromotionRecord> {
    const res = await ApiClient.fetch<any>('/api/users/' + userId + '/promote', {
      method: 'POST',
      body: JSON.stringify({ role, hqId, designation, remarks, effectiveDate, actionType }),
    });
    return {
      id: String(res?.id || 'pr_' + Date.now()),
      userId,
      userName: String(res?.userName || ''),
      previousRole: (res?.previousRole || 'MR') as SfaRole,
      newRole: role,
      hqId,
      designation,
      remarks,
      effectiveDate: effectiveDate || new Date().toISOString(),
      createdAt: String(res?.createdAt || new Date().toISOString()),
    };
  }

  async getPromotionHistory(): Promise<PromotionRecord[]> {
    const rows = await ApiClient.fetch<any[]>('/api/users/history/promotions', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      userId: String(r.user_id || r.userId || ''),
      userName: String(r.full_name || r.userName || ''),
      previousRole: (r.old_role || r.previous_role || r.previousRole || 'MR') as SfaRole,
      newRole: (r.new_role || r.newRole || 'MR') as SfaRole,
      hqId: String(r.hq_id || r.hqId || ''),
      designation: String(r.designation || ''),
      remarks: String(r.remarks || ''),
      effectiveDate: String(r.effective_date || r.effectiveDate || ''),
      createdAt: String(r.created_at || r.createdAt || ''),
    }));
  }
}
