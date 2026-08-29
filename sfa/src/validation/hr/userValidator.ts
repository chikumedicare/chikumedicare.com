import type { SfaUser } from '../../core/domain/hr/user.types';
import type { ValidationResult } from './employeeValidator';

export function validateSfaUser(user: Partial<SfaUser>, password?: string, isNew: boolean = true): ValidationResult {
  const errors: Record<string, string> = {};

  if (!user.empCode || user.empCode.trim().length === 0) {
    errors.empCode = 'Employee linkage is required';
  }

  if (!user.userId || user.userId.trim().length < 3) {
    errors.userId = 'Login User ID must be at least 3 characters';
  }

  if (isNew) {
    if (!password) {
      errors.password = 'Password is required for new users';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,12}$/.test(password)) {
      errors.password = 'Password must be 6-12 characters long and contain both letters and numbers';
    }
  } else if (password && !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,12}$/.test(password)) {
    errors.password = 'Password must be 6-12 characters long and contain both letters and numbers';
  }

  if (!user.role) {
    errors.role = 'Role selection is mandatory';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
