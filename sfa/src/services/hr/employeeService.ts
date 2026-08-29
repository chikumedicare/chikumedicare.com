import type { Employee, EmploymentStatus } from '../../core/domain/hr/employee.types';
import { validateEmployee, type ValidationResult } from '../../validation/hr/employeeValidator';

export class EmployeeService {
  static createNewEmployee(draft: Partial<Employee>): { success: boolean; employee?: Employee; validation: ValidationResult } {
    const validation = validateEmployee(draft);
    if (!validation.isValid) {
      return { success: false, validation };
    }

    const employee: Employee = {
      id: `emp_${Date.now()}`,
      empCode: draft.empCode!.trim().toUpperCase(),
      firstName: draft.firstName!.trim(),
      middleName: draft.middleName?.trim() || '',
      lastName: draft.lastName!.trim(),
      mobile: draft.mobile!.trim(),
      alternateMobile: draft.alternateMobile?.trim() || '',
      email: draft.email?.trim() || '',
      dateOfBirth: draft.dateOfBirth || '',
      gender: draft.gender || 'MALE',
      maritalStatus: draft.maritalStatus || 'SINGLE',
      department: draft.department || 'Sales',
      designation: draft.designation || 'Field Representative',
      joiningDate: draft.joiningDate || new Date().toLocaleDateString('en-GB'),
      status: draft.status || 'ACTIVE',
      hqId: draft.hqId || '',
      bankName: draft.bankName?.trim() || '',
      accountNumber: draft.accountNumber?.trim() || '',
      ifscCode: draft.ifscCode?.trim().toUpperCase() || '',
      accountType: draft.accountType || 'SAVINGS',
      currentAddress: draft.currentAddress || '',
      permanentAddress: draft.permanentAddress || '',
      createdAt: new Date().toISOString(),
    };

    return { success: true, employee, validation };
  }

  static updateStatus(current: Employee, newStatus: EmploymentStatus): Employee {
    return {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
  }
}
