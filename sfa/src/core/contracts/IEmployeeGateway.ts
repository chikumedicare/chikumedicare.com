import type { Employee } from '../domain/hr/employee.types';

export interface IEmployeeGateway {
  getEmployees(divisionId?: string): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee | null>;
  createEmployee(employee: Partial<Employee>): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee>;
  toggleEmployeeStatus(id: string, isActive: boolean): Promise<Employee>;
}
