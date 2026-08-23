import type { ValidationResult } from './employeeValidator';

export function validateTransfer(userId: string, currentHqId: string, newHqId: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!userId) {
    errors.user = 'User selection is required';
  }

  if (!newHqId) {
    errors.newHq = 'Please select a destination HQ';
  } else if (currentHqId && newHqId === currentHqId) {
    errors.newHq = 'New HQ must be different from current HQ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
