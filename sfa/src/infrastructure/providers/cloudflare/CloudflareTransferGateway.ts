import { ApiClient } from '../../api/ApiClient';
import type { ITransferGateway, TransferRecord } from '../../../core/contracts/ITransferGateway';

export class CloudflareTransferGateway implements ITransferGateway {
  async transferUser(
    userId: string,
    hqId: string,
    divisionId?: string,
    primaryAreaId?: string,
    reason?: string,
    effectiveDate?: string
  ): Promise<TransferRecord> {
    const res = await ApiClient.fetch<any>('/api/users/' + userId + '/transfer', {
      method: 'POST',
      body: JSON.stringify({ hqId, divisionId, primaryAreaId, reason, effectiveDate }),
    });
    return {
      id: String(res?.id || 'tr_' + Date.now()),
      userId,
      userName: String(res?.userName || ''),
      previousHqId: String(res?.previousHqId || ''),
      newHqId: hqId,
      previousDivisionId: String(res?.previousDivisionId || ''),
      newDivisionId: divisionId || '',
      reason,
      effectiveDate: effectiveDate || new Date().toISOString(),
      createdAt: String(res?.createdAt || new Date().toISOString()),
    };
  }

  async getTransferHistory(): Promise<TransferRecord[]> {
    const rows = await ApiClient.fetch<any[]>('/api/users/history/transfers', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      userId: String(r.user_id || r.userId || ''),
      userName: String(r.full_name || r.userName || ''),
      previousHqId: String(r.old_hq_id || r.previousHqId || ''),
      newHqId: String(r.new_hq_id || r.newHqId || ''),
      previousDivisionId: String(r.old_division_id || r.previousDivisionId || ''),
      newDivisionId: String(r.new_division_id || r.newDivisionId || ''),
      reason: String(r.reason || ''),
      effectiveDate: String(r.effective_date || r.effectiveDate || ''),
      createdAt: String(r.created_at || r.createdAt || ''),
    }));
  }
}
