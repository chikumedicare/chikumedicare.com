import { ApiClient } from '../../api/ApiClient';
import type { Employee } from '../../domain/hr/employee.types';
import { mapEmployeeFromDb, mapEmployeeToDb } from './hrDataMapper';

export class EmployeeGateway {
  static async getEmployees(divisionId?: string): Promise<Employee[]> {
    const url = divisionId
      ? `/api/data/employees?division_id=${divisionId}&includeInactive=true`
      : '/api/data/employees?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(url, { method: 'GET' });
    return (rows || []).map(mapEmployeeFromDb);
  }

  static async createEmployee(emp: Partial<Employee>): Promise<Employee> {
    const payload = mapEmployeeToDb(emp);
    const result = await ApiClient.fetch<any>('/api/data/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapEmployeeFromDb(result);
  }

  static async updateEmployee(id: string, emp: Partial<Employee>): Promise<Employee> {
    const payload = mapEmployeeToDb(emp);
    const result = await ApiClient.fetch<any>(`/api/data/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapEmployeeFromDb(result);
  }
}
