import type { Employee } from '../../domain/hr/employee.types';

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

  if (!emp.mobile || !/^[6-9]\d{9}$/.test(emp.mobile.trim())) {
    errors.mobile = 'Valid 10-digit mobile number required';
  }

  if (emp.email && emp.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emp.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (emp.ifscCode && emp.ifscCode.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(emp.ifscCode.trim().toUpperCase())) {
    errors.ifscCode = 'Invalid IFSC code format (e.g. SBIN0001234)';
  }

  if (emp.accountNumber && emp.accountNumber.trim() && !/^\d{8,18}$/.test(emp.accountNumber.trim())) {
    errors.accountNumber = 'Account number must be 8-18 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
