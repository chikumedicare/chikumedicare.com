import type { Employee } from '../../core/domain/hr/employee.types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEmployee(emp: Partial<Employee>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!emp.firstName || !emp.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  if (!emp.lastName || !emp.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
