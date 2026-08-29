export type LeaveType = 'CL' | 'SL' | 'PL' | 'LWP';

export interface LeaveAllocation {
  id: string;
  employeeId: string;
  employeeName?: string;
  designation?: string;
  hqName?: string;
  year: string; // e.g. "2026-27"
  cl: number;
  sl: number;
  pl: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  numDays?: number;
  daysCount?: number;
  reason?: string;
  emergencyContact?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  fy?: string;
  hqId?: string;
  createdAt?: string;
}

export interface DaRate {
  id: string;
  role: string;
  cityType: 'HQ' | 'EX_HQ' | 'OUTSTATION' | 'TRANSIT';
  amount: number;
  effectiveFrom: string;
  isActive: boolean;
  fareType?: 'ONE_WAY' | 'TWO_WAY';
  kmRate0_199?: number;
  kmRate200_299?: number;
  travelMode299_599?: string;
  travelMode600Plus?: string;
}

export interface RoleDaSummary {
  role: string;
  hq: number;
  exhq: number;
  outstation: number;
  transit: number;
  effectiveFrom: string;
  active: boolean;
  fareType?: 'ONE_WAY' | 'TWO_WAY';
  kmRate0_199?: number;
  kmRate200_299?: number;
  travelMode299_599?: string;
  travelMode600Plus?: string;
  ids: {
    hq?: string;
    exhq?: string;
    outstation?: string;
    transit?: string;
  };
}

export interface TaPolicy {
  fareType?: 'ONE_WAY' | 'TWO_WAY';
  kmRate0_199?: number;
  kmRate200_299?: number;
  travelMode299_599?: string;
  travelMode600Plus?: string;
}
