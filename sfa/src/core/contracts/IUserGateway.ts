import type { SfaUser, SfaRole } from '../domain/hr/user.types';
import type { LoginAudit } from '../domain/hr/lifecycle.types';

export interface IUserGateway {
  getUsers(): Promise<SfaUser[]>;
  getAllUsers?(): Promise<SfaUser[]>;
  getUserById(id: string): Promise<SfaUser | null>;
  createUser(payload: {
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
  }): Promise<SfaUser>;
  updateUser(
    id: string,
    updates: Partial<SfaUser> & { isRoleChanged?: boolean; isDivisionChanged?: boolean }
  ): Promise<SfaUser>;
  deleteUser?(id: string): Promise<void>;
  updateUserRole?(id: string, newRole: string): Promise<void>;
  updateUserStatus?(id: string, isActive: boolean, status: string): Promise<void>;
  resetPassword(userId: string, newPassword: string): Promise<void>;
  resetDevice(userId: string): Promise<void>;
  unlockAccount(userId: string): Promise<void>;
  getUserLoginAudit(userId: string): Promise<LoginAudit[]>;
}
