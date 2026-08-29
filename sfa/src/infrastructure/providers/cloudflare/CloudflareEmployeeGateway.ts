import { IEmployeeGateway } from '../../../core/contracts/IEmployeeGateway';
import type { Employee } from '../../../core/domain/hr/employee.types';
import { ApiClient } from '../../api/ApiClient';
import { mapEmployeeFromDb, mapEmployeeToDb } from '../../mappers/employeeMapper';

export class CloudflareEmployeeGateway implements IEmployeeGateway {
  async getEmployees(): Promise<Employee[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/employees?limit=500', { method: 'GET' });
    return (rows || []).map((r) => mapEmployeeFromDb(r as Record<string, unknown>));
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const rows = await ApiClient.fetch<any[]>('/api/data/employees?id=' + id + '&limit=1', { method: 'GET' });
    if (!rows || rows.length === 0) return null;
    return mapEmployeeFromDb(rows[0] as Record<string, unknown>);
  }

  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    const payload = mapEmployeeToDb(employee);
    const res = await ApiClient.fetch<any>('/api/data/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapEmployeeFromDb(res as Record<string, unknown>);
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const payload = mapEmployeeToDb(updates);
    const res = await ApiClient.fetch<any>('/api/data/employees/' + id, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapEmployeeFromDb(res as Record<string, unknown>);
  }

  async toggleEmployeeStatus(id: string, isActive: boolean): Promise<Employee> {
    return await this.updateEmployee(id, { status: isActive ? 'ACTIVE' : 'RESIGNED' });
  }

  async deleteEmployee(id: string): Promise<void> {
    await ApiClient.fetch('/api/data/employees/' + id, { method: 'DELETE' });
  }
}
