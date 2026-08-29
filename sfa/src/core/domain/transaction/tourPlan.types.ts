export type WorkType =
  | 'FIELD_WORK'
  | 'MEETING'
  | 'TRANSIT'
  | 'CAMP'
  | 'WEEKLY_OFF'
  | 'HOLIDAY'
  | 'LEAVE'
  | 'ABSENT';

export type WorkWithMode = 'ALONE' | 'JOINT';

export interface TourPlanDay {
  date: string; // YYYY-MM-DD
  dayName: string; // Sunday, Monday...
  workType: WorkType;
  workWithMode: WorkWithMode;
  jointWithIds?: string[];
  jointWithNames?: string[];
  workingAreaIds: string[];
  workingAreaNames?: string[];
  transitFrom?: string;
  transitTo?: string;
  remarks?: string;
}

export interface TourPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  hqId?: string;
  hqName?: string;
  financialYear: string;
  monthYear: string; // YYYY-MM e.g. 2026-09
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  details: TourPlanDay[];
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  remarks?: string;
  createdAt?: string;
}
