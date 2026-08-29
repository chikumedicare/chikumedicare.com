import { ILeaveGateway } from '../../../core/contracts/ILeaveGateway';
import type { LeaveAllocation, LeaveApplication } from '../../../core/domain/hr/leave.types';
import { ApiClient } from '../../api/ApiClient';

interface LeaveAllocationApiDto { id: string; employee_id: string; employee_name?: string; designation?: string; year: string; cl?: number; sl?: number; pl?: number; is_active?: number | boolean; }
interface LeaveApplicationApiDto { id: string; employee_id: string; employee_name?: string; leave_type: string; from_date: string; to_date: string; days_count: number; reason?: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; created_at: string; }

export class CloudflareLeaveGateway implements ILeaveGateway {
  async getLeaves(fy?: string): Promise<LeaveAllocation[]> {
    const query = fy ? `?fy=${fy}` : '';
    const rows = await ApiClient.fetch<LeaveAllocationApiDto[]>(`/api/data/leave_allocations${query}`, { method: 'GET' });
    return (rows || []).map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name || '',
      designation: r.designation || '',
      year: r.year,
      cl: Number(r.cl || 0),
      sl: Number(r.sl || 0),
      pl: Number(r.pl || 0),
      isActive: Boolean(r.is_active === 1 || r.is_active === true),
    }));
  }

  async createLeaveAllocation(draft: Partial<LeaveAllocation>): Promise<LeaveAllocation> {
    const body: Record<string, unknown> = {
      employee_id: draft.employeeId,
      employee_name: draft.employeeName,
      designation: draft.designation,
      year: draft.year,
      cl: draft.cl,
      sl: draft.sl,
      pl: draft.pl,
      is_active: draft.isActive ? 1 : 0,
    };
    return await ApiClient.fetch<LeaveAllocation>('/api/data/leave_allocations', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateLeaveAllocation(id: string, updates: Partial<LeaveAllocation>): Promise<LeaveAllocation> {
    const body: Record<string, unknown> = {};
    if (updates.cl !== undefined) body.cl = updates.cl;
    if (updates.sl !== undefined) body.sl = updates.sl;
    if (updates.pl !== undefined) body.pl = updates.pl;
    if (updates.year !== undefined) body.year = updates.year;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch<LeaveAllocation>(`/api/data/leave_allocations/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteLeaveAllocation(id: string): Promise<void> {
    await ApiClient.fetch<void>(`/api/data/leave_allocations/${id}`, { method: 'DELETE' });
  }

  async getLeaveApplications(fy?: string): Promise<LeaveApplication[]> {
    const query = fy ? `?fy=${fy}` : '';
    const rows = await ApiClient.fetch<LeaveApplicationApiDto[]>(`/api/data/leave_applications${query}`, { method: 'GET' });
    return (rows || []).map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name || '',
      leaveType: r.leave_type as 'CL' | 'SL' | 'PL',
      fromDate: r.from_date,
      toDate: r.to_date,
      daysCount: r.days_count,
      reason: r.reason || '',
      status: r.status,
      createdAt: r.created_at,
    }));
  }

  async updateLeaveApplicationStatus(id: string, status: 'APPROVED' | 'REJECTED', approverId?: string): Promise<void> {
    await ApiClient.fetch<void>(`/api/data/leave_applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, approver_id: approverId }),
    });
  }
}
