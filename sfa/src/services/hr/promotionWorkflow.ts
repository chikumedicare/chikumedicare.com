import type { SfaUser, SfaRole } from '../../core/domain/hr/user.types';
import type { LifecycleAudit } from '../../core/domain/hr/lifecycle.types';

export class PromotionWorkflow {
  static executePromotion(
    user: SfaUser,
    newRole: SfaRole,
    newHqId?: string,
    performedBy: string = 'ADMIN'
  ): { success: boolean; updatedUser?: SfaUser; audit?: LifecycleAudit; error?: string } {
    if (user.role === newRole && (!newHqId || newHqId === user.hqId)) {
      return { success: false, error: 'New role or HQ must differ from current state.' };
    }

    const prevRole = user.role;
    const updatedUser: SfaUser = {
      ...user,
      role: newRole,
      hqId: newHqId || user.hqId,
    };

    const audit: LifecycleAudit = {
      id: `audit_${Date.now()}`,
      type: 'PROMOTION',
      userId: user.id,
      details: `Role updated for ${user.fullName} from [${prevRole}] to [${newRole}]`,
      timestamp: new Date().toISOString(),
      performedBy,
    };

    return { success: true, updatedUser, audit };
  }
}
