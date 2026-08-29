import { IUserGateway } from '../../../core/contracts/IUserGateway';
import type { SfaUser, SfaRole } from '../../../core/domain/hr/user.types';
import type { LoginAudit } from '../../../core/domain/hr/lifecycle.types';
import { ApiClient } from '../../api/ApiClient';
import { mapUserFromDb, mapUserToDb } from '../../mappers/userMapper';


export class CloudflareUserGateway implements IUserGateway {
  async getUsers(): Promise<SfaUser[]> {
    const rows = await ApiClient.fetch<Record<string, unknown>[]>('/api/data/users?limit=500', { method: 'GET' });
    return (rows || []).map((r) => mapUserFromDb(r as unknown as Record<string, unknown>));
  }

  async getAllUsers(): Promise<SfaUser[]> {
    return await this.getUsers();
  }

  async getUserById(id: string): Promise<SfaUser | null> {
    const rows = await ApiClient.fetch<Record<string, unknown>[]>('/api/data/users?id=' + id + '&limit=1', { method: 'GET' });
    if (!rows || rows.length === 0) return null;
    return mapUserFromDb(rows[0] as unknown as Record<string, unknown>);
  }

  async createUser(payload: {
    userId: string;
    empCode: string;
    fullName: string;
    role: SfaRole;
    password?: string;
    mobile?: string;
    email?: string;
    designation?: string;
    hqId?: string;
    divisionId?: string;
    joiningDate?: string;
  }): Promise<SfaUser> {
    const dbPayload = mapUserToDb(payload as Partial<SfaUser>);
    const res = await ApiClient.fetch<Record<string, unknown>>('/api/data/users', {
      method: 'POST',
      body: JSON.stringify(dbPayload),
    });
    return mapUserFromDb(res as unknown as Record<string, unknown>);
  }

  async updateUser(
    id: string,
    updates: Partial<SfaUser> & { isRoleChanged?: boolean; isDivisionChanged?: boolean }
  ): Promise<SfaUser> {
    const dbPayload = mapUserToDb(updates);
    const res = await ApiClient.fetch<Record<string, unknown>>('/api/data/users/' + id, {
      method: 'PUT',
      body: JSON.stringify(dbPayload),
    });
    return mapUserFromDb(res as unknown as Record<string, unknown>);
  }

  async deleteUser(id: string): Promise<void> {
    await ApiClient.fetch('/api/data/users/' + id, { method: 'DELETE' });
  }

  async updateUserRole(id: string, newRole: string): Promise<void> {
    await ApiClient.fetch('/api/data/users/' + id, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole, updated_at: new Date().toISOString() }),
    });
  }

  async updateUserStatus(id: string, isActive: boolean, status: string): Promise<void> {
    await ApiClient.fetch('/api/data/users/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        is_active: isActive ? 1 : 0,
        status,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await ApiClient.fetch('/api/users/' + userId + '/reset-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async resetDevice(userId: string): Promise<void> {
    await ApiClient.fetch('/api/users/' + userId + '/reset-device', { method: 'POST' });
  }

  async unlockAccount(userId: string): Promise<void> {
    await ApiClient.fetch('/api/users/' + userId + '/unlock', { method: 'POST' });
  }

  async getUserLoginAudit(userId: string): Promise<LoginAudit[]> {
    const rows = await ApiClient.fetch<Record<string, unknown>[]>('/api/users/' + userId + '/audit', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      userId: String(r.user_id || r.userId || userId),
      ipAddress: String(r.ip_address || r.ipAddress || ''),
      userAgent: String(r.user_agent || r.userAgent || ''),
      loginTime: String(r.login_time || r.loginTime || r.created_at || new Date().toISOString()),
      status: (r.status || 'SUCCESS') as 'SUCCESS' | 'FAILED' | 'LOCKED',
      failureReason: String(r.failure_reason || r.failureReason || ''),
      deviceInfo: String(r.device_info || r.deviceInfo || ''),
    }));
  }
}
