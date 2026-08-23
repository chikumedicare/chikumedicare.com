import type { SfaRole } from '../../domain/hr/user.types';
import { getHrCapabilities } from './hrRbac';

export function canCreateEmployee(role: SfaRole): boolean {
  return getHrCapabilities(role).canManageEmployees;
}

export function canCreateSfaUser(role: SfaRole): boolean {
  return getHrCapabilities(role).canManageUsers;
}

export function canPerformTransfer(role: SfaRole): boolean {
  return getHrCapabilities(role).canTransfer;
}

export function canPerformPromotion(role: SfaRole): boolean {
  return getHrCapabilities(role).canPromote;
}

export function canModifyGeography(role: SfaRole): boolean {
  return getHrCapabilities(role).canManageGeography;
}

export function canAllocateLeaves(role: SfaRole): boolean {
  return getHrCapabilities(role).canAllocateLeaves;
}

export function canManageAdmins(role: SfaRole): boolean {
  return getHrCapabilities(role).canManageAdmins;
}

export function getDivisionFilter(role: string, divisionId?: string): string | undefined {
  if (role === 'OWNER' || role === 'ADMIN') {
    return undefined; // No filter – see everything
  }
  return divisionId;  // Filter to own division only
}
