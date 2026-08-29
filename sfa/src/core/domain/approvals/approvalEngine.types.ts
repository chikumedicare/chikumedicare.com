export type ApprovalCategory =
  | 'TOUR_PLAN'
  | 'LEAVE'
  | 'DR_ADD'
  | 'DR_EDIT'
  | 'DR_DELETE'
  | 'SPONSORSHIP';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalItem {
  id: string;
  type: ApprovalCategory;
  requestedBy: string;
  requestedByName: string;
  requesterRole?: string;
  requesterHqName?: string;
  entityTitle: string;
  entitySubtitle: string;
  financialYear: string;
  createdAt: string;
  status: ApprovalStatus;
  managerRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  payload: Record<string, any>;
  oldData?: Record<string, any>;
}
