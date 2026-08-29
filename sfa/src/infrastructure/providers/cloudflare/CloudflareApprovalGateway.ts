import { ApiClient } from '../../api/ApiClient';
import type { IApprovalGateway, ApprovalRequest } from '../../../core/contracts/IApprovalGateway';

export class CloudflareApprovalGateway implements IApprovalGateway {
  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    const rows = await ApiClient.fetch<any[]>('/api/approvals?status=PENDING&limit=200', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      entityType: String(r.entity_type || r.entityType || r.type || ''),
      entityId: String(r.entity_id || r.entityId || ''),
      action: (r.action || 'CREATE') as any,
      requestedBy: String(r.requested_by || r.requestedBy || ''),
      requestedByName: String(r.requested_by_name || r.requestedByName || ''),
      payload: typeof r.payload === 'string' ? JSON.parse(r.payload || '{}') : (r.payload || r.entityData || {}),
      status: (r.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
      approverId: r.approver_id || r.approverId,
      approverName: r.approver_name || r.approverName,
      remarks: r.remarks || r.manager_remarks || r.managerRemarks,
      createdAt: String(r.created_at || r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updated_at || r.updatedAt || ''),
    }));
  }

  async getMyApprovals(): Promise<ApprovalRequest[]> {
    const rows = await ApiClient.fetch<any[]>('/api/approvals?limit=200', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      entityType: String(r.entity_type || r.entityType || r.type || ''),
      entityId: String(r.entity_id || r.entityId || ''),
      action: (r.action || 'CREATE') as any,
      requestedBy: String(r.requested_by || r.requestedBy || ''),
      requestedByName: String(r.requested_by_name || r.requestedByName || ''),
      payload: typeof r.payload === 'string' ? JSON.parse(r.payload || '{}') : (r.payload || r.entityData || {}),
      status: (r.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
      approverId: r.approver_id || r.approverId,
      approverName: r.approver_name || r.approverName,
      remarks: r.remarks || r.manager_remarks || r.managerRemarks,
      createdAt: String(r.created_at || r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updated_at || r.updatedAt || ''),
    }));
  }

  async submitRequest(request: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const payload = {
      entity_type: request.entityType,
      entity_id: request.entityId,
      action: request.action,
      payload: JSON.stringify(request.payload || {}),
      remarks: request.remarks,
    };
    const res = await ApiClient.fetch<any>('/api/approvals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      id: String(res?.id || 'appr_' + Date.now()),
      entityType: request.entityType || '',
      entityId: request.entityId || '',
      action: request.action || 'CREATE',
      requestedBy: String(res?.requested_by || ''),
      payload: request.payload || {},
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  }

  async processAction(id: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<void> {
    await ApiClient.fetch('/api/approvals/' + id + '/action', {
      method: 'POST',
      body: JSON.stringify({ action, remarks }),
    });
  }

  async batchProcessAction(ids: string[], action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<void> {
    await ApiClient.fetch('/api/approvals/batch-action', {
      method: 'POST',
      body: JSON.stringify({ ids, action, remarks }),
    });
  }
}
