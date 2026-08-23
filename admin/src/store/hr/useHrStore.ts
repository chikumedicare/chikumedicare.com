import { useState, useCallback, useEffect } from 'react';
import type { Employee, EmploymentStatus } from '../../domain/hr/employee.types';
import type { SfaUser, SfaRole } from '../../domain/hr/user.types';
import type { LeaveAllocation, DaRate } from '../../domain/hr/leave.types';
import { HrGateway } from '../../gateway/hr/hrGateway';
import { validateEmployee } from '../../validation/hr/employeeValidator';
import { validateSfaUser } from '../../validation/hr/userValidator';
import { validateTransfer } from '../../validation/hr/transferValidator';

export function useHrStore() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<SfaUser[]>([]);
  const [leaves, setLeaves] = useState<LeaveAllocation[]>([]);
  const [daRates, setDaRates] = useState<DaRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const savedUserStr = localStorage.getItem('chiku_auth_user');
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      const role = savedUser?.role || 'ADMIN';
      const divisionId = (role === 'ADMIN' || role === 'OWNER')
        ? undefined
        : (savedUser?.division_id || savedUser?.divisionId || undefined);

      const [empList, userList, leaveList, daList] = await Promise.all([
        HrGateway.getEmployees(divisionId),
        HrGateway.getUsers(),
        HrGateway.getLeaves(),
        HrGateway.getDaRates(),
      ]);
      setEmployees(empList);
      setUsers(userList);
      setLeaves(leaveList);
      setDaRates(daList);
    } catch (err: any) {
      console.error('[useHrStore] Live data fetch error:', err);
      setError(err?.error || err?.message || 'Failed to fetch HR data from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addOrUpdateEmployee = useCallback(async (draft: Partial<Employee>) => {
    const val = validateEmployee(draft);
    if (!val.isValid) {
      return { success: false, errors: val.errors };
    }

    try {
      setLoading(true);
      if (draft.id && !draft.id.startsWith('temp_')) {
        await HrGateway.updateEmployee(draft.id, draft);
      } else {
        await HrGateway.createEmployee(draft);
      }
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, errors: { submit: err?.error || err?.message || 'Failed to save employee' } };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const toggleEmployeeStatus = useCallback(async (emp: Employee, status: EmploymentStatus) => {
    try {
      setLoading(true);
      await HrGateway.updateEmployee(emp.id, { ...emp, status });
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const addOrUpdateSfaUser = useCallback(async (
    user: SfaUser | null,
    emp: Employee,
    userId: string,
    role: SfaRole,
    pw?: string,
    divisionId?: string,
    joiningDate?: string,
    isRoleChanged?: boolean,
    isDivisionChanged?: boolean
  ) => {
    if (user && user.id) {
      try {
        setLoading(true);
        const updates: any = {
          role,
          divisionId: divisionId || undefined,
          joiningDate: joiningDate || undefined,
          empCode: emp.empCode || user.empCode,
          fullName: (emp.firstName ? `${emp.firstName} ${emp.lastName}`.trim() : user.fullName),
          isRoleChanged,
          isDivisionChanged,
        };
        if (pw && pw.trim().length > 0) {
          await HrGateway.resetPassword(user.id, pw.trim());
        }
        await HrGateway.updateUser(user.id, updates);
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.error || err?.message || 'Failed to update user' };
      } finally {
        setLoading(false);
      }
    } else {
      const val = validateSfaUser({ empCode: emp.empCode, userId, role }, pw, true);
      if (!val.isValid) {
        return { success: false, error: Object.values(val.errors)[0] };
      }

      try {
        setLoading(true);
        await HrGateway.createUser({
          userId,
          empCode: emp.empCode,
          fullName: `${emp.firstName} ${emp.lastName}`.trim(),
          role,
          divisionId: divisionId || (emp as any).divisionId || undefined,
          joiningDate: joiningDate || undefined,
          password: pw || 'chiku123',
          mobile: emp.mobile,
          email: emp.email,
          designation: emp.designation,
          hqId: emp.hqId,
        });
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.error || err?.message || 'Failed to create user' };
      } finally {
        setLoading(false);
      }
    }
  }, [refresh]);

  const createSfaUser = useCallback((emp: Employee, userId: string, role: SfaRole, pw?: string, divisionId?: string) => {
    return addOrUpdateSfaUser(null, emp, userId, role, pw, divisionId);
  }, [addOrUpdateSfaUser]);

  const toggleUserActive = useCallback(async (user: SfaUser) => {
    try {
      setLoading(true);
      await HrGateway.updateUser(user.id, { isActive: !user.isActive });
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const executeTransfer = useCallback(
    async (
      user: SfaUser,
      newHqId: string,
      primaryAreaId?: string,
      reason?: string,
      effectiveDate?: string
    ) => {
      const val = validateTransfer(user.id, user.hqId || '', newHqId);
      if (!val.isValid) {
        return { success: false, error: Object.values(val.errors)[0] };
      }

      try {
        setLoading(true);
        await HrGateway.transferUser(user.id, newHqId, primaryAreaId, reason, effectiveDate);
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.error || err?.message || 'Transfer failed' };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
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
        await HrGateway.promoteUser(
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
      } catch (err: any) {
        return { success: false, error: err?.error || err?.message || 'Promotion failed' };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const fetchTransferHistory = useCallback(async () => {
    try {
      return await HrGateway.getTransferHistory();
    } catch (err) {
      return [];
    }
  }, []);

  const fetchPromotionHistory = useCallback(async () => {
    try {
      return await HrGateway.getPromotionHistory();
    } catch (err) {
      return [];
    }
  }, []);

  const addOrUpdateLeaveAllocation = useCallback(async (draft: Partial<LeaveAllocation>) => {
    try {
      setLoading(true);
      if (draft.id && !draft.id.startsWith('la_temp_')) {
        await HrGateway.updateLeaveAllocation(draft.id, draft);
      } else {
        await HrGateway.createLeaveAllocation(draft);
      }
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to save leave allocation' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const deleteLeaveAllocation = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await HrGateway.deleteLeaveAllocation(id);
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to delete leave allocation' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const bulkAllocateLeaves = useCallback(async (
    year: string,
    cl: number,
    sl: number,
    pl: number,
    role?: string,
    overwrite?: boolean
  ) => {
    try {
      setLoading(true);
      const targetUsers = users.filter((u) => {
        if (u.role === 'ADMIN' || u.role === 'OWNER') return false;
        if (role && role !== 'ALL' && u.role !== role) return false;
        return true;
      });

      for (const u of targetUsers) {
        const existing = leaves.find((l) => l.employeeId === u.id && l.year === year);
        if (existing) {
          if (overwrite) {
            await HrGateway.updateLeaveAllocation(existing.id, { cl, sl, pl, year, isActive: true });
          }
        } else {
          await HrGateway.createLeaveAllocation({
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
      }

      await refresh();
      return { success: true, count: targetUsers.length };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Bulk allocation failed' };
    } finally {
      setLoading(false);
    }
  }, [users, leaves, refresh]);

  const fetchLeaveApplications = useCallback(async (fy?: string) => {
    try {
      return await HrGateway.getLeaveApplications(fy);
    } catch (err) {
      return [];
    }
  }, []);

  const updateLeaveApplicationStatus = useCallback(async (
    id: string,
    status: 'APPROVED' | 'REJECTED',
    approverId?: string
  ) => {
    try {
      setLoading(true);
      await HrGateway.updateLeaveApplicationStatus(id, status, approverId);

      // If approved directly by Admin, auto-deduct leave balance from leave_allocations
      if (status === 'APPROVED') {
        const apps = await HrGateway.getLeaveApplications();
        const app = apps.find((a) => a.id === id);
        if (app && app.leaveType !== 'LWP') {
          const allLeaves = await HrGateway.getLeaves(app.fy || '2026-27');
          const alloc = allLeaves.find((l) => l.employeeId === app.employeeId && l.year === (app.fy || '2026-27'));
          if (alloc) {
            const field = app.leaveType === 'CL' ? 'cl' : app.leaveType === 'SL' ? 'sl' : 'pl';
            const newBal = Math.max((alloc[field] || 0) - app.numDays, 0);
            await HrGateway.updateLeaveAllocation(alloc.id, { [field]: newBal });
          }
        }
      }

      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to update leave application' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const updateUserHierarchy = useCallback(async (userId: string, reportsToId: string | null) => {
    try {
      setLoading(true);
      await HrGateway.updateUser(userId, { reportsToId: reportsToId || '' });
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Hierarchy update failed' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const executeResetDevice = useCallback(async (user: SfaUser) => {
    try {
      setLoading(true);
      await HrGateway.resetDevice(user.id);
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Device reset failed' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const getUserLoginAudit = useCallback(async (userId: string) => {
    try {
      return await HrGateway.getUserLoginAudit(userId);
    } catch (err: any) {
      console.error('[useHrStore] getUserLoginAudit error:', err);
      return [];
    }
  }, []);

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
      taPolicy?: {
        fareType?: 'ONE_WAY' | 'TWO_WAY';
        kmRate0_199?: number;
        kmRate200_299?: number;
        travelMode299_599?: string;
        travelMode600Plus?: string;
      }
    ) => {
      try {
        setLoading(true);
        await HrGateway.saveRoleDaRates(role, hq, exhq, outstation, transit, effectiveFrom, isActive, existingIds, taPolicy);
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.error || err?.message || 'Failed to save DA rates' };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const deleteRoleDaRates = useCallback(
    async (existingIds: string[]) => {
      try {
        setLoading(true);
        await HrGateway.deleteRoleDaRates(existingIds);
        await refresh();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.error || err?.message || 'Failed to delete DA rates' };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const bulkAdjustDaRates = useCallback(
    async (percentIncrement: number, fixedIncrement: number, targetRole?: string) => {
      try {
        setLoading(true);
        const res = await HrGateway.bulkAdjustDaRates(daRates, percentIncrement, fixedIncrement, targetRole);
        await refresh();
        return res;
      } catch (err: any) {
        return { success: false, error: err?.error || err?.message || 'Failed to adjust DA rates' };
      } finally {
        setLoading(false);
      }
    },
    [daRates, refresh]
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
