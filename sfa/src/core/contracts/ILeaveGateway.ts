import type { LeaveAllocation, LeaveApplication } from '../domain/hr/leave.types';

export interface ILeaveGateway {
  getLeaves(fy?: string): Promise<LeaveAllocation[]>;
  createLeaveAllocation(draft: Partial<LeaveAllocation>): Promise<LeaveAllocation>;
  updateLeaveAllocation(id: string, updates: Partial<LeaveAllocation>): Promise<LeaveAllocation>;
  deleteLeaveAllocation(id: string): Promise<void>;
  getLeaveApplications(fy?: string): Promise<LeaveApplication[]>;
  updateLeaveApplicationStatus(id: string, status: 'APPROVED' | 'REJECTED', approverId?: string): Promise<void>;
}
