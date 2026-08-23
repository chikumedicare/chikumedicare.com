import { ApiClient } from '../../api/ApiClient';
import type { SfaUser, SfaRole } from '../../domain/hr/user.types';
import { mapUserFromDb } from './hrDataMapper';

export class UserGateway {
  static async getUsers(): Promise<SfaUser[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/users?includeInactive=true', { method: 'GET' });
    return (rows || []).map(mapUserFromDb);
  }

  static async createUser(payload: {
    userId: string;
    empCode: string;
    fullName: string;
    role: SfaRole;
    password: string;
    mobile?: string;
    email?: string;
    designation?: string;
    hqId?: string;
    divisionId?: string;
    joiningDate?: string;
  }): Promise<SfaUser> {
    const body = {
      user_id: payload.userId,
      emp_code: payload.empCode,
      full_name: payload.fullName,
      role: payload.role,
      division_id: payload.divisionId || null,
      password_hash: payload.password,
      mobile: payload.mobile || null,
      email: payload.email || null,
      designation: payload.designation || null,
      hq_id: payload.hqId || null,
      joining_date: payload.joiningDate || null,
      is_active: 1,
    };
    const result = await ApiClient.fetch<any>('/api/data/users', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return mapUserFromDb(result);
  }

  static async updateUser(
    id: string,
    updates: Partial<SfaUser> & { isRoleChanged?: boolean; isDivisionChanged?: boolean }
  ): Promise<SfaUser> {
    const body: any = {};
    if (updates.role !== undefined) body.role = updates.role;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    if (updates.hqId !== undefined) body.hq_id = updates.hqId;
    if ((updates as any).divisionId !== undefined) body.division_id = (updates as any).divisionId;
    if ((updates as any).joiningDate !== undefined) body.joining_date = (updates as any).joiningDate;
    if (updates.reportsToId !== undefined) {
      body.reports_to_id = updates.reportsToId || null;
      body.manager_id = updates.reportsToId || null;
    }
    if (updates.coveringHqIds !== undefined) body.covering_hq_ids = updates.coveringHqIds;
    if (updates.areaIds !== undefined) body.area_ids = updates.areaIds;

    // Unbind / Break Hierarchy & Field Geography Mappings if Role or Division Changed
    if (updates.isRoleChanged || updates.isDivisionChanged) {
      body.reports_to_id = null;
      body.reports_to_ids = null;
      body.manager_id = null;
      body.asm_id = null;
      body.rsm_id = null;
      body.zsm_id = null;
      body.vp_id = null;
      body.hierarchy_status = 'UNASSIGNED';
    }

    if (updates.isDivisionChanged) {
      body.hq_id = null;
      body.covering_hq_ids = '[]';
      body.area_ids = '[]';
    }

    const result = await ApiClient.fetch<any>(`/api/data/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return mapUserFromDb(result);
  }

  static async transferUser(
    userId: string,
    hqId: string,
    divisionId?: string,
    primaryAreaId?: string,
    reason?: string,
    effectiveDate?: string
  ): Promise<any> {
    return await ApiClient.fetch(`/api/users/${userId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ hqId, divisionId, primaryAreaId, reason, effectiveDate }),
    });
  }

  static async promoteUser(
    userId: string,
    role: SfaRole,
    hqId?: string,
    designation?: string,
    remarks?: string,
    effectiveDate?: string,
    actionType?: string
  ): Promise<any> {
    return await ApiClient.fetch(`/api/users/${userId}/promote`, {
      method: 'POST',
      body: JSON.stringify({ role, hqId, designation, remarks, effectiveDate, actionType }),
    });
  }

  static async getTransferHistory(): Promise<any[]> {
    return await ApiClient.fetch<any[]>('/api/users/history/transfers', { method: 'GET' });
  }

  static async getPromotionHistory(): Promise<any[]> {
    return await ApiClient.fetch<any[]>('/api/users/history/promotions', { method: 'GET' });
  }

  static async resetPassword(userId: string, newPassword: string): Promise<any> {
    return await ApiClient.fetch(`/api/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  static async resetDevice(userId: string): Promise<any> {
    return await ApiClient.fetch(`/api/users/${userId}/reset-device`, {
      method: 'POST',
    });
  }

  static async unlockAccount(userId: string): Promise<any> {
    return await ApiClient.fetch(`/api/users/${userId}/unlock`, {
      method: 'POST',
    });
  }

  static async getUserLoginAudit(userId: string): Promise<any[]> {
    return await ApiClient.fetch<any[]>(`/api/users/${userId}/audit`, {
      method: 'GET',
    });
  }
}
