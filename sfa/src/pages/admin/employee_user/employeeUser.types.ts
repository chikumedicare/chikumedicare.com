import type { SfaRole } from '../../../core/domain/hr/user.types';
import type { Gender, MaritalStatus, AccountType } from '../../../core/domain/hr/employee.types';

export interface EmployeeUserDraft {
  id?: string;
  userId: string;
  empCode: string;
  password?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  role: SfaRole;
  divisionId?: string;
  hqId?: string;
  reportsToId?: string;
  joiningDate?: string;
  isActive: boolean;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  dateOfBirth?: string;
  gender: Gender;
  bloodGroup?: string;
  maritalStatus: MaritalStatus;
  currentAddress?: string;
  permanentAddress?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: AccountType;
  emergencyContactName?: string;
  emergencyContactNo?: string;
  emergencyContactRelation?: string;
  qualification?: string;
  passingYear?: string;
}

export interface EmployeeUserRecord extends EmployeeUserDraft {
  id: string;
  divisionName?: string;
  hqName?: string;
  reportsToName?: string;
}
