import type { SfaRole } from '../../domain/hr/user.types';

export interface GuardContext {
  role: SfaRole;
  activeFY: string;
  systemFY: string;
}

export function assertCanMutate(ctx: GuardContext, permissionGranted: boolean): { allowed: boolean; reason?: string } {
  if (ctx.activeFY !== ctx.systemFY) {
    return {
      allowed: false,
      reason: `Cannot modify past Financial Year records (${ctx.activeFY}). Past FY is Strictly Read-Only.`,
    };
  }

  if (!permissionGranted) {
    return {
      allowed: false,
      reason: `Insufficient role permissions for ${ctx.role}. Action restricted to authorized HR managers.`,
    };
  }

  return { allowed: true };
}
