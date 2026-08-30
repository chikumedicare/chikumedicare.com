import type { SfaRole, SfaUser } from '../../../core/domain/hr/user.types';
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

export function generateNextEmployeeUserId(role: SfaRole, allUsers: SfaUser[]): string {
  const isAdminOrOwner = role === 'ADMIN' || role === 'OWNER';

  if (isAdminOrOwner) {
    // Admin / Owner format: CHIKUME01, CHIKUME02, ... (2-digit padding)
    const existingNums = allUsers
      .map((u) => {
        const id = (u.userId || u.empCode || '').toUpperCase();
        const m = id.match(/^CHIKUME(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    return `CHIKUME${String(maxNum + 1).padStart(2, '0')}`;
  } else {
    // Field Employee / User format: CHIKU0001, CHIKU0002, ... (4-digit padding)
    const existingNums = allUsers
      .map((u) => {
        const id = (u.userId || u.empCode || '').toUpperCase();
        if (id.startsWith('CHIKUME')) return 0;
        const m = id.match(/^CHIKU(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    return `CHIKU${String(maxNum + 1).padStart(4, '0')}`;
  }
}
