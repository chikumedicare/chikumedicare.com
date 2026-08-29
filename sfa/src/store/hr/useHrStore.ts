import { getErrorMessage } from '../../utils/dataIntegrity';
import { useState, useCallback, useEffect } from 'react';
import type { Employee, EmploymentStatus } from '../../core/domain/hr/employee.types';
import type { SfaUser, SfaRole } from '../../core/domain/hr/user.types';
import type { LeaveAllocation, DaRate, TaPolicy } from '../../core/domain/hr/leave.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';

export function useHrStore() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<SfaUser[]>([]);
  const [leaves, setLeaves] = useState<LeaveAllocation[]>([]);
  const [daRates, setDaRates] = useState<DaRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const empGateway = GatewayContainer.getEmployeeGateway();
  const userGateway = GatewayContainer.getUserGateway();
  const leaveGateway = GatewayContainer.getLeaveGateway();
  const daGateway = GatewayContainer.getDaGateway();
  const transferGateway = GatewayContainer.getTransferGateway();
  const promotionGateway = GatewayContainer.getPromotionGateway();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empList, uList, lList, daList] = await Promise.all([
        empGateway.getEmployees(),
        userGateway.getUsers(),
        leaveGateway.getLeaves(),
        daGateway.getDaRates(),
      ]);
      setEmployees(empList);
      setUsers(uList);
      setLeaves(lList);
      setDaRates(daList);
    } catch (e: unknown) {
      console.error('[useHrStore] Live data fetch error:', e);
      setError((e as any)?.error || (e as any)?.message || 'Failed to fetch HR data from live database');
    } finally {
      setLoading(false);
    }
  }, [empGateway, userGateway, leaveGateway, daGateway]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addOrUpdateEmployee = useCallback(
    async (draft: Partial<Employee>) => {
      try {
        setLoading(true);
        let saved: Employee;
        if (draft.id) {
          saved = await empGateway.updateEmployee(draft.id, draft);
        } else {
          saved = await empGateway.createEmployee(draft);
        }
        await refresh();
        return { success: true, employee: saved };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [empGateway, refresh]
  );

  const toggleEmployeeStatus = useCallback(
    async (emp: Employee, status: EmploymentStatus) => {
      try {
        setLoading(true);
        await empGateway.updateEmployee(emp.id, { ...emp, status });
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [empGateway, refresh]
  );

  const addOrUpdateSfaUser = useCallback(
    async (user: SfaUser, updates: Partial<SfaUser>, newPassword?: string) => {
      try {
        setLoading(true);
        const pw = newPassword ?? '';
        if (pw.trim().length > 0) {
          await userGateway.resetPassword(user.id, pw.trim());
        }
        await userGateway.updateUser(user.id, updates);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [userGateway, refresh]
  );

  const createSfaUser = useCallback(
    async (
      emp: Employee,
      userId: string,
      password: string,
      role: SfaRole,
      hqId?: string,
      divisionId?: string,
      joiningDate?: string
    ) => {
      try {
        setLoading(true);
        const created = await userGateway.createUser({
          userId: userId.trim(),
          empCode: emp.empCode,
          fullName: `${emp.firstName} ${emp.lastName}`.trim(),
          role: role,
          password: password,
          mobile: emp.mobile,
          email: emp.email,
          designation: emp.designation,
          hqId: hqId || undefined,
          divisionId: divisionId || emp.divisionId || undefined,
          joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        });
        await refresh();
        return { success: true, user: created };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [userGateway, refresh]
  );

  const toggleUserActive = useCallback(
    async (user: SfaUser) => {
      try {
        setLoading(true);
        await userGateway.updateUser(user.id, { isActive: !user.isActive });
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [userGateway, refresh]
  );

  const executeTransfer = useCallback(
    async (
      user: SfaUser,
      newHqId: string,
      divisionId?: string,
      primaryAreaId?: string,
      reason?: string,
      effectiveDate?: string
    ) => {
      try {
        setLoading(true);
        await transferGateway.transferUser(user.id, newHqId, divisionId, primaryAreaId, reason, effectiveDate);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [transferGateway, refresh]
  );

  const executePromotion = useCallback(
    async (
      user: SfaUser,
      newRole: SfaRole,
      newHqId?: string,
      designation?: string,
      remarks?: string,
      effectiveDate?: string,
      actionType?: string
    ) => {
      try {
        setLoading(true);
        await promotionGateway.promoteUser(
          user.id,
          newRole,
          newHqId,
          designation,
          remarks,
          effectiveDate,
          actionType
        );
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [promotionGateway, refresh]
  );

  const fetchTransferHistory = useCallback(async () => {
    try {
      return await transferGateway.getTransferHistory();
    } catch (err: unknown) {
      console.error('[useHrStore] fetchTransferHistory error:', err);
      return [];
    }
  }, [transferGateway]);

  const fetchPromotionHistory = useCallback(async () => {
    try {
      return await promotionGateway.getPromotionHistory();
    } catch (err: unknown) {
      console.error('[useHrStore] fetchPromotionHistory error:', err);
      return [];
    }
  }, [promotionGateway]);

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
    [leaveGateway, refresh]
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
    [leaveGateway, refresh]
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
          const existing = leaves.find((l) => l.employeeId === u.empCode && l.year === year);
          if (existing) {
            await leaveGateway.updateLeaveAllocation(existing.id, { cl, sl, pl, year, isActive: true });
          } else {
            await leaveGateway.createLeaveAllocation({
              employeeId: u.empCode,
              employeeName: u.fullName,
              designation: u.designation,
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
    [leaveGateway, leaves, refresh]
  );

  const fetchLeaveApplications = useCallback(
    async (fy?: string) => {
      try {
        return await leaveGateway.getLeaveApplications(fy);
      } catch (err: unknown) {
        console.error('[useHrStore] fetchLeaveApplications error:', err);
        return [];
      }
    },
    [leaveGateway]
  );

  const updateLeaveApplicationStatus = useCallback(
    async (id: string, status: 'APPROVED' | 'REJECTED', approverId?: string) => {
      try {
        setLoading(true);
        await leaveGateway.updateLeaveApplicationStatus(id, status, approverId);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [leaveGateway, refresh]
  );

  const updateUserHierarchy = useCallback(
    async (userId: string, reportsToId?: string) => {
      try {
        setLoading(true);
        await userGateway.updateUser(userId, { reportsToId: reportsToId || '' });
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [userGateway, refresh]
  );

  const executeResetDevice = useCallback(
    async (user: SfaUser) => {
      try {
        setLoading(true);
        await userGateway.resetDevice(user.id);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [userGateway, refresh]
  );

  const getUserLoginAudit = useCallback(
    async (userId: string) => {
      try {
        return await userGateway.getUserLoginAudit(userId);
      } catch (err: unknown) {
        console.error('[useHrStore] getUserLoginAudit error:', err);
        return [];
      }
    },
    [userGateway]
  );

  const addOrUpdateRoleDaRates = useCallback(
    async (
      role: string,
      hq: number,
      exhq: number,
      outstation: number,
      transit: number,
      effectiveFrom?: string,
      isActive = true,
      existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
      taPolicy?: TaPolicy
    ) => {
      try {
        setLoading(true);
        await daGateway.saveRoleDaRates(
          role,
          hq,
          exhq,
          outstation,
          transit,
          effectiveFrom,
          isActive,
          existingIds,
          taPolicy
        );
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [daGateway, refresh]
  );

  const deleteRoleDaRates = useCallback(
    async (existingIds: string[]) => {
      try {
        setLoading(true);
        await daGateway.deleteRoleDaRates(existingIds);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [daGateway, refresh]
  );

  const bulkAdjustDaRates = useCallback(
    async (percentIncrement: number, fixedIncrement: number, targetRole?: string) => {
      try {
        setLoading(true);
        const res = await daGateway.bulkAdjustDaRates(daRates, percentIncrement, fixedIncrement, targetRole);
        await refresh();
        return res;
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [daGateway, daRates, refresh]
  );

  return {
    employees,
    users,
    leaves,
    daRates,
    loading,
    error,
    addOrUpdateEmployee,
    toggleEmployeeStatus,
    createSfaUser,
    addOrUpdateSfaUser,
    toggleUserActive,
    executeTransfer,
    executePromotion,
    updateUserHierarchy,
    executeResetDevice,
    getUserLoginAudit,
    fetchTransferHistory,
    fetchPromotionHistory,
    addOrUpdateLeaveAllocation,
    deleteLeaveAllocation,
    bulkAllocateLeaves,
    fetchLeaveApplications,
    updateLeaveApplicationStatus,
    addOrUpdateRoleDaRates,
    deleteRoleDaRates,
    bulkAdjustDaRates,
    refresh,
  };
}
