import { ApiClient } from '../../api/ApiClient';
import type { LeaveAllocation, LeaveApplication } from '../../domain/hr/leave.types';

export class LeaveGateway {
  static async getLeaves(fy?: string): Promise<LeaveAllocation[]> {
    const query = fy ? `?year=${fy}&includeInactive=true` : '?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(`/api/data/leave_allocations${query}`, { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      employeeId: r.employee_id || '',
      employeeName: r.employee_name || '',
      designation: r.designation || '',
      hqName: r.hq_name || '',
      year: r.year || '',
      cl: Number(r.balance_cl || 0),
      sl: Number(r.balance_sl || 0),
      pl: Number(r.balance_pl || 0),
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  static async createLeaveAllocation(draft: Partial<LeaveAllocation>): Promise<any> {
    const body: Record<string, any> = {
      employee_id: draft.employeeId,
      year: draft.year,
      balance_cl: draft.cl || 0,
      balance_sl: draft.sl || 0,
      balance_pl: draft.pl || 0,
      is_active: draft.isActive !== false ? 1 : 0,
    };
    if (draft.employeeName) body.employee_name = draft.employeeName;
    if (draft.designation) body.designation = draft.designation;
    if (draft.hqName) body.hq_name = draft.hqName;

    return await ApiClient.fetch('/api/data/leave_allocations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async updateLeaveAllocation(id: string, updates: Partial<LeaveAllocation>): Promise<any> {
    const body: Record<string, any> = {};
    if (updates.cl !== undefined) body.balance_cl = updates.cl;
    if (updates.sl !== undefined) body.balance_sl = updates.sl;
    if (updates.pl !== undefined) body.balance_pl = updates.pl;
    if (updates.year !== undefined) body.year = updates.year;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    if (updates.employeeName !== undefined) body.employee_name = updates.employeeName;
    if (updates.designation !== undefined) body.designation = updates.designation;
    if (updates.hqName !== undefined) body.hq_name = updates.hqName;

    return await ApiClient.fetch(`/api/data/leave_allocations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async deleteLeaveAllocation(id: string): Promise<any> {
    return await ApiClient.fetch(`/api/data/leave_allocations/${id}`, {
      method: 'DELETE',
    });
  }

  static async getLeaveApplications(fy?: string): Promise<LeaveApplication[]> {
    const query = fy ? `?fy=${fy}&includeInactive=true` : '?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(`/api/data/leave_applications${query}`, { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      employeeId: r.employee_id || '',
      employeeName: r.employee_name || '',
      leaveType: r.leave_type || 'CL',
      fromDate: r.from_date || '',
      toDate: r.to_date || '',
      numDays: Number(r.num_days || 0),
      reason: r.reason || '',
      emergencyContact: r.emergency_contact || '',
      status: r.status || 'PENDING',
      approvedBy: r.approved_by || '',
      approvedAt: r.approved_at || '',
      fy: r.fy || '',
      hqId: r.hq_id || '',
      createdAt: r.created_at,
    }));
  }

  static async updateLeaveApplicationStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    approverId?: string
  ): Promise<any> {
    return await ApiClient.fetch(`/api/data/leave_applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        approved_by: approverId || 'admin',
        approved_at: new Date().toISOString(),
      }),
    });
  }
}
