export type LeaveType = 'CL' | 'SL' | 'PL' | 'LWP';

export interface LeaveBalance {
  clAllocated: number;
  clUsed: number;
  clAvailable: number;
  slAllocated: number;
  slUsed: number;
  slAvailable: number;
  plAllocated: number;
  plUsed: number;
  plAvailable: number;
}

export interface LeaveApplicationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  hqId?: string;
  hqName?: string;
  leaveType: LeaveType;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  emergencyContact: string;
  financialYear: string;
  monthYear: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  managerRemarks?: string;
  appliedAt?: string;
}
