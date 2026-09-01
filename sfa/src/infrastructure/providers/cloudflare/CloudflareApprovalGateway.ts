import { ApiClient } from '../../api/ApiClient';
import type { IApprovalGateway, ApprovalRequest } from '../../../core/contracts/IApprovalGateway';

export class CloudflareApprovalGateway implements IApprovalGateway {
  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    const rows = await ApiClient.fetch<any[]>('/api/approvals/pending', { method: 'GET' });
    return (rows || []).map((r) => {
      let parsedPayload: Record<string, unknown> = {};
      try {
        parsedPayload = typeof r.entity_data === 'string' ? JSON.parse(r.entity_data) : (r.entity_data || r.payload || {});
      } catch (e) {
        parsedPayload = r.entity_data || {};
      }

      return {
        id: String(r.id || ''),
        entityType: String(r.type || r.entity_type || ''),
        entityId: String(r.entity_id || parsedPayload.id || ''),
        action: (r.type?.includes('_ADD') ? 'CREATE' : r.type?.includes('_EDIT') ? 'UPDATE' : r.type?.includes('_DELETE') ? 'DELETE' : 'CREATE') as any,
        requestedBy: String(r.requested_by || ''),
        requestedByName: String(r.requested_by_name || r.requester_name || r.requested_by || 'Field Representative'),
        payload: parsedPayload,
        status: (r.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
        approverId: r.manager_id || r.approver_id,
        remarks: r.manager_remarks || r.remarks || '',
        createdAt: String(r.created_at || new Date().toISOString()),
        updatedAt: String(r.updated_at || ''),
      };
    });
  }

  async getMyApprovals(): Promise<ApprovalRequest[]> {
    const rows = await ApiClient.fetch<any[]>('/api/approvals/my', { method: 'GET' });
    return (rows || []).map((r) => {
      let parsedPayload: Record<string, unknown> = {};
      try {
        parsedPayload = typeof r.entity_data === 'string' ? JSON.parse(r.entity_data) : (r.entity_data || r.payload || {});
      } catch (e) {
        parsedPayload = r.entity_data || {};
      }

      return {
        id: String(r.id || ''),
        entityType: String(r.type || r.entity_type || ''),
        entityId: String(r.entity_id || parsedPayload.id || ''),
        action: (r.type?.includes('_ADD') ? 'CREATE' : r.type?.includes('_EDIT') ? 'UPDATE' : r.type?.includes('_DELETE') ? 'DELETE' : 'CREATE') as any,
        requestedBy: String(r.requested_by || ''),
        requestedByName: String(r.requested_by_name || r.requester_name || r.requested_by || 'Me'),
        payload: parsedPayload,
        status: (r.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
        approverId: r.manager_id || r.approver_id,
        remarks: r.manager_remarks || r.remarks || '',
        createdAt: String(r.created_at || new Date().toISOString()),
        updatedAt: String(r.updated_at || ''),
      };
    });
  }

  async submitRequest(request: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const payload = {
      type: request.entityType || 'DR_ADD',
      entityData: request.payload || {},
      managerId: request.approverId || null,
      remarks: request.remarks || '',
    };
    const res = await ApiClient.fetch<any>('/api/approvals/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: String(res?.id || 'appr_' + Date.now()),
      entityType: request.entityType || 'DR_ADD',
      entityId: request.entityId || '',
      action: request.action || 'CREATE',
      requestedBy: String(res?.requested_by || ''),
      payload: request.payload || {},
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  }

  async processAction(id: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<void> {
    await ApiClient.fetch('/api/approvals/action', {
      method: 'POST',
      body: JSON.stringify({ id, action, remarks: remarks || '' }),
    });
  }

  async batchProcessAction(ids: string[], action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<void> {
    await ApiClient.fetch('/api/approvals/batch-action', {
      method: 'POST',
      body: JSON.stringify({ ids, action, remarks: remarks || '' }),
    });
  }
}
