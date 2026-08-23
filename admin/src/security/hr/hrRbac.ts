import type { SfaRole } from '../../domain/hr/user.types';

export interface HrCapabilities {
  canManageEmployees: boolean;
  canManageUsers: boolean;
  canManageGeography: boolean;
  canTransfer: boolean;
  canPromote: boolean;
  canAllocateLeaves: boolean;
  canEditDaRates: boolean;
  canManageAdmins: boolean;
}

const roleMatrix: Record<SfaRole, HrCapabilities> = {
  OWNER: { canManageEmployees: true, canManageUsers: true, canManageGeography: true, canTransfer: true, canPromote: true, canAllocateLeaves: true, canEditDaRates: true, canManageAdmins: true },
  ADMIN: { canManageEmployees: true, canManageUsers: true, canManageGeography: true, canTransfer: true, canPromote: true, canAllocateLeaves: true, canEditDaRates: true, canManageAdmins: false },
  VP: { canManageEmployees: true, canManageUsers: true, canManageGeography: true, canTransfer: true, canPromote: true, canAllocateLeaves: true, canEditDaRates: false, canManageAdmins: false },
  NSM: { canManageEmployees: false, canManageUsers: true, canManageGeography: false, canTransfer: true, canPromote: true, canAllocateLeaves: false, canEditDaRates: false, canManageAdmins: false },
  ZSM: { canManageEmployees: false, canManageUsers: false, canManageGeography: false, canTransfer: true, canPromote: false, canAllocateLeaves: false, canEditDaRates: false, canManageAdmins: false },
  RSM: { canManageEmployees: false, canManageUsers: false, canManageGeography: false, canTransfer: false, canPromote: false, canAllocateLeaves: false, canEditDaRates: false, canManageAdmins: false },
  SR_ASM: { canManageEmployees: false, canManageUsers: false, canManageGeography: false, canTransfer: false, canPromote: false, canAllocateLeaves: false, canEditDaRates: false, canManageAdmins: false },
  ASM: { canManageEmployees: false, canManageUsers: false, canManageGeography: false, canTransfer: false, canPromote: false, canAllocateLeaves: false, canEditDaRates: false, canManageAdmins: false },
  SR_MR: { canManageEmployees: false, canManageUsers: false, canManageGeography: false, canTransfer: false, canPromote: false, canAllocateLeaves: false, canEditDaRates: false, canManageAdmins: false },
  MR: { canManageEmployees: false, canManageUsers: false, canManageGeography: false, canTransfer: false, canPromote: false, canAllocateLeaves: false, canEditDaRates: false, canManageAdmins: false },
};

export function getHrCapabilities(role: SfaRole = 'ADMIN'): HrCapabilities {
  return roleMatrix[role] || roleMatrix.MR;
}
