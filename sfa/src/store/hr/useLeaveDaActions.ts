import { useCallback } from 'react';
import { getErrorMessage } from '../../utils/dataIntegrity';
import type { SfaUser, SfaRole } from '../../core/domain/hr/user.types';
import type { LeaveAllocation, DaRate, LeaveApplication } from '../../core/domain/hr/leave.types';

interface UseLeaveDaActionsParams {
  leaveGateway: any;
  daGateway: any;
  refresh: (force?: boolean) => Promise<void>;
  setLoading: (loading: boolean) => void;
  leaves: LeaveAllocation[];
  daRates: DaRate[];
}

export function useLeaveDaActions({
  leaveGateway,
  daGateway,
  refresh,
  setLoading,
  leaves,
  daRates,
}: UseLeaveDaActionsParams) {
  const addOrUpdateLeaveAllocation = useCallback(
    async (draft: Partial<LeaveAllocation>) => {
      try {
        setLoading(true);
        if (draft.id) {
          await leaveGateway.updateLeaveAllocation(draft.id, draft);
        } else {
          await leaveGateway.createLeaveAllocation(draft);
        }
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [leaveGateway, refresh, setLoading]
  );

  const deleteLeaveAllocation = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await leaveGateway.deleteLeaveAllocation(id);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [leaveGateway, refresh, setLoading]
  );

  const bulkAllocateLeaves = useCallback(
    async (
      targetUsers: SfaUser[],
      cl: number,
      sl: number,
      pl: number,
      year: string,
      onProgress?: (curr: number, total: number) => void
    ) => {
      try {
        setLoading(true);
        let count = 0;
        for (const u of targetUsers) {
          const existing = leaves.find((l) => (l.employeeId === u.id || l.employeeId === u.empCode || l.employeeId === u.userId) && l.year === year);
          if (existing) {
            await leaveGateway.updateLeaveAllocation(existing.id, {
              cl,
              sl,
              pl,
              year,
            });
          } else {
            await leaveGateway.createLeaveAllocation({
              employeeId: u.id,
              employeeName: u.fullName,
              designation: u.designation || u.role,
              hqName: u.hqId || '',
              year,
              cl,
              sl,
              pl,
              isActive: true,
            });
          }
          count++;
          if (onProgress) onProgress(count, targetUsers.length);
        }
        await refresh();
        return { success: true, count };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [leaveGateway, leaves, refresh, setLoading]
  );

  const fetchLeaveApplications = useCallback(async (): Promise<LeaveApplication[]> => {
    try {
      return await leaveGateway.getLeaveApplications();
    } catch (err) {
      console.error('Failed to fetch leave applications:', err);
      return [];
    }
  }, [leaveGateway]);

  const updateLeaveApplicationStatus = useCallback(
    async (applicationId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
      try {
        setLoading(true);
        await leaveGateway.updateApplicationStatus(applicationId, status, comment);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [leaveGateway, refresh, setLoading]
  );

  const addOrUpdateRoleDaRates = useCallback(
    async (
      role: SfaRole,
      rates: { hqRate: number; exHqRate: number; outstationRate: number },
      effectiveFrom: string,
      daId?: string
    ) => {
      try {
        setLoading(true);
        if (daId) {
          await daGateway.updateDaRate(daId, { role, ...rates, effectiveFrom });
        } else {
          await daGateway.createDaRate({ role, ...rates, effectiveFrom });
        }
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [daGateway, refresh, setLoading]
  );

  const deleteRoleDaRates = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await daGateway.deleteDaRate(id);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [daGateway, refresh, setLoading]
  );

  const bulkAdjustDaRates = useCallback(
    async (role: SfaRole | 'ALL', type: 'FLAT' | 'PERCENTAGE', amount: number, onProgress?: (c: number, t: number) => void) => {
      try {
        setLoading(true);
        const targetRates = daRates.filter((r) => role === 'ALL' || r.role === role);
        let count = 0;
        for (const r of targetRates) {
          const calc = (base: number) => (type === 'FLAT' ? Math.max(0, base + amount) : Math.max(0, Math.round(base * (1 + amount / 100))));
          await daGateway.updateDaRate(r.id, {
            hqRate: calc((r as any).hqRate || 0),
            exHqRate: calc((r as any).exHqRate || 0),
            outstationRate: calc((r as any).outstationRate || 0),
          });
          count++;
          if (onProgress) onProgress(count, targetRates.length);
        }
        await refresh();
        return { success: true, count };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [daGateway, daRates, refresh, setLoading]
  );

  return {
    addOrUpdateLeaveAllocation,
    deleteLeaveAllocation,
    bulkAllocateLeaves,
    fetchLeaveApplications,
    updateLeaveApplicationStatus,
    addOrUpdateRoleDaRates,
    deleteRoleDaRates,
    bulkAdjustDaRates,
  };
}
