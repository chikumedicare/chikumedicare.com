import type { SfaUser } from '../../domain/hr/user.types';
import type { TransferRequest, LifecycleAudit } from '../../domain/hr/lifecycle.types';
import { validateTransfer } from '../../validation/hr/transferValidator';

export class TransferWorkflow {
  static executeTransfer(
    user: SfaUser,
    newHqId: string,
    performedBy: string = 'ADMIN'
  ): { success: boolean; updatedUser?: SfaUser; audit?: LifecycleAudit; error?: string } {
    const validation = validateTransfer(user.id, user.hqId || '', newHqId);
    if (!validation.isValid) {
      return { success: false, error: Object.values(validation.errors)[0] };
    }

    const prevHq = user.hqId || 'None';
    const updatedUser: SfaUser = {
      ...user,
      hqId: newHqId,
      coveringHqIds: user.coveringHqIds.filter((h) => h !== newHqId),
    };

    const audit: LifecycleAudit = {
      id: `audit_${Date.now()}`,
      type: 'TRANSFER',
      userId: user.id,
      details: `Transferred ${user.fullName} from HQ [${prevHq}] to HQ [${newHqId}]`,
      timestamp: new Date().toISOString(),
      performedBy,
    };

    return { success: true, updatedUser, audit };
  }
}
