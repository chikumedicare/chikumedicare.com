import type { Employee } from '../../core/domain/hr/employee.types';
import type { SfaUser, SfaRole } from '../../core/domain/hr/user.types';
import { validateSfaUser } from '../../validation/hr/userValidator';

export class UserLifecycleService {
  static createSfaAccount(
    employee: Employee,
    userId: string,
    role: SfaRole,
    password?: string
  ): { success: boolean; user?: SfaUser; error?: string } {
    const validation = validateSfaUser({ empCode: employee.empCode, userId, role }, password, true);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      return { success: false, error: firstError };
    }

    const newUser: SfaUser = {
      id: `usr_${Date.now()}`,
      userId: userId.trim(),
      empCode: employee.empCode,
      fullName: `${employee.firstName} ${employee.lastName}`.trim(),
      role,
      isActive: true,
      mobile: employee.mobile || '',
      email: employee.email || '',
      designation: employee.designation || '',
      hqId: employee.hqId || '',
      coveringHqIds: [],
      areaIds: [],
    };

    return { success: true, user: newUser };
  }

  static toggleUserStatus(user: SfaUser): SfaUser {
    return {
      ...user,
      isActive: !user.isActive,
    };
  }
}
