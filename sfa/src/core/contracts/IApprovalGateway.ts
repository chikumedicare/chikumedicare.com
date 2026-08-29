export interface ApprovalRequest {
  id: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSFER' | 'PROMOTION';
  requestedBy: string;
  requestedByName?: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId?: string;
  approverName?: string;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IApprovalGateway {
  getPendingApprovals(): Promise<ApprovalRequest[]>;
  getMyApprovals(): Promise<ApprovalRequest[]>;
  submitRequest(request: Partial<ApprovalRequest>): Promise<ApprovalRequest>;
  processAction(id: string, action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<void>;
  batchProcessAction(ids: string[], action: 'APPROVED' | 'REJECTED', remarks?: string): Promise<void>;
}
