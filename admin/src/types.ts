export type ManagementPage =
  | 'employees'
  | 'employee-form'
  | 'users'
  | 'user-form'
  | 'hierarchy'
  | 'transfer'
  | 'promotion'
  | 'device-management';

export type MasterPage =
  | 'head-office'
  | 'doctors'
  | 'chemists'
  | 'stockists'
  | 'products'
  | 'holidays'
  | 'geography'
  | 'geography-form'
  | 'mapping'
  | 'coverage-form'
  | 'da-rates'
  | 'sfc-master'
  | 'leave';

export type TransactionPage =
  | 'dcr-entry'
  | 'tour-plan-entry'
  | 'primary-sales'
  | 'secondary-sales'
  | 'expense-entry'
  | 'sampling';

export type PersonalPage =
  | 'my-profile'
  | 'my-attendance'
  | 'my-leaves'
  | 'salary-slip'
  | 'my-documents';

export type ReportsPage =
  | 'dcr-reports'
  | 'doctor-coverage-report'
  | 'sales-reports'
  | 'expense-reports'
  | 'stock-reports'
  | 'tp-reports';

export type ApprovalsPage =
  | 'dcr-approvals'
  | 'tp-approvals'
  | 'expense-approvals'
  | 'leave-approvals'
  | 'master-approvals';

export type UtilitiesPage =
  | 'audit-logs'
  | 'financial-year'
  | 'global-settings'
  | 'data-backup'
  | 'bulk-import-export';

export type Page =
  | 'dashboard'
  | ManagementPage
  | MasterPage
  | TransactionPage
  | PersonalPage
  | ReportsPage
  | ApprovalsPage
  | UtilitiesPage;

export type Role =
  | 'MR'
  | 'ASM'
  | 'RSM'
  | 'ZSM'
  | 'NSM'
  | 'VP'
  | 'OWNER'
  | 'ADMIN';

export type Status = 'ACTIVE' | 'RESIGNED' | 'SUSPENDED' | 'TERMINATED';

export interface Employee {
  id: string;
  empCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  mobile: string;
  email: string;
  designation: string;
  department: string;
  status: Status;
  joiningDate: string;
  gender: string;
  hqId?: string;
  zoneId?: string;
  stateId?: string;
  areaId?: string;
}

export interface User {
  id: string;
  userId: string;
  empCode: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  mobile: string;
  email: string;
  designation: string;
  hqId?: string;
  reportsToId?: string;
  zoneId?: string;
  stateId?: string;
  coveringHqIds: string[];
  areaIds: string[];
}
