import { ILeaveGateway } from '../../../core/contracts/ILeaveGateway';
import type { LeaveAllocation, LeaveApplication } from '../../../core/domain/hr/leave.types';
import { ApiClient } from '../../api/ApiClient';

export class CloudflareLeaveGateway implements ILeaveGateway {
  async getLeaves(fy?: string): Promise<LeaveAllocation[]> {
    const query = fy ? `?fy=${fy}` : '';
    const rows = await ApiClient.fetch<Record<string, any>[]>(`/api/data/leave_allocations${query}`, { method: 'GET' });
    return (rows || []).map((r) => ({
      id: r.id,
      employeeId: r.employee_id || r.employeeId || '',
      employeeName: r.employee_name || r.employeeName || '',
      designation: r.designation || '',
      hqName: r.hq_name || r.hqName || '',
      year: r.year,
      cl: Number(r.balance_cl ?? r.cl ?? 0),
      sl: Number(r.balance_sl ?? r.sl ?? 0),
      pl: Number(r.balance_pl ?? r.pl ?? 0),
      isActive: Boolean(r.is_active === 1 || r.is_active === true),
    }));
  }

  async createLeaveAllocation(draft: Partial<LeaveAllocation>): Promise<LeaveAllocation> {
    const body: Record<string, unknown> = {
      employee_id: draft.employeeId,
      employee_name: draft.employeeName || '',
      designation: draft.designation || '',
      hq_name: draft.hqName || '',
      year: draft.year,
      balance_cl: Number(draft.cl || 0),
      balance_sl: Number(draft.sl || 0),
      balance_pl: Number(draft.pl || 0),
      is_active: draft.isActive !== false ? 1 : 0,
    };
    return await ApiClient.fetch<LeaveAllocation>('/api/data/leave_allocations', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateLeaveAllocation(id: string, updates: Partial<LeaveAllocation>): Promise<LeaveAllocation> {
    const body: Record<string, unknown> = {};
    if (updates.cl !== undefined) body.balance_cl = Number(updates.cl);
    if (updates.sl !== undefined) body.balance_sl = Number(updates.sl);
    if (updates.pl !== undefined) body.balance_pl = Number(updates.pl);
    if (updates.year !== undefined) body.year = updates.year;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch<LeaveAllocation>(`/api/data/leave_allocations/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteLeaveAllocation(id: string): Promise<void> {
    await ApiClient.fetch<void>(`/api/data/leave_allocations/${id}`, { method: 'DELETE' });
  }

  async getLeaveApplications(fy?: string): Promise<LeaveApplication[]> {
    const query = fy ? `?fy=${fy}` : '';
    const rows = await ApiClient.fetch<Record<string, any>[]>(`/api/data/leave_applications${query}`, { method: 'GET' });
    return (rows || []).map((r) => ({
      id: r.id,
      employeeId: r.employee_id || r.employeeId || '',
      employeeName: r.employee_name || r.employeeName || '',
      leaveType: r.leave_type as 'CL' | 'SL' | 'PL',
      fromDate: r.from_date || r.fromDate,
      toDate: r.to_date || r.toDate,
      daysCount: Number(r.days_count ?? r.num_days ?? 1),
      reason: r.reason || '',
      status: r.status,
      createdAt: r.created_at || r.createdAt,
    }));
  }

  async updateLeaveApplicationStatus(id: string, status: 'APPROVED' | 'REJECTED', approverId?: string): Promise<void> {
    await ApiClient.fetch<void>(`/api/data/leave_applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, approver_id: approverId }),
    });
  }
}
