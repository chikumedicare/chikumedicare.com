import React, { useState, useEffect } from 'react';
import { useHrStore } from '../../../store/hr/useHrStore';
import type { LeaveAllocation as LeaveType, LeaveApplication } from '../../../core/domain/hr/leave.types';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { LeaveAllocationHeader } from './LeaveAllocationHeader';
import { LeaveAllocationToolbar } from './LeaveAllocationToolbar';
import { LeaveBalancesTable } from './LeaveBalancesTable';
import { LeaveFormModal } from './LeaveFormModal';
import { LeaveApplicationsTable } from './LeaveApplicationsTable';

interface LeaveAllocationProps {
  users?: SfaUser[];
  onSaveAllocation?: (draft: Partial<LeaveType>) => Promise<{ success: boolean; error?: string }>;
  onDeleteAllocation?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function LeaveAllocation({
  users: propUsers,
  onSaveAllocation: propSave,
  onDeleteAllocation: propDelete,
}: LeaveAllocationProps) {
  const {
    leaves,
    users: storeUsers,
    employees,
    addOrUpdateLeaveAllocation,
    deleteLeaveAllocation,
    fetchLeaveApplications,
    updateLeaveApplicationStatus,
    refresh,
  } = useHrStore();

  const users = propUsers || storeUsers;

  const [selectedFY, setSelectedFY] = useState('2026-27');
  const [activeTab, setActiveTab] = useState<'BALANCES' | 'APPLICATIONS'>('BALANCES');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<LeaveType | null>(null);

  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    const loadApps = async () => {
      setAppsLoading(true);
      try {
        const apps = await fetchLeaveApplications();
        if (mounted) setApplications(apps || []);
      } catch (err) {
        console.error('Failed to load leave applications:', err);
      } finally {
        if (mounted) setAppsLoading(false);
      }
    };
    loadApps();
    return () => {
      mounted = false;
    };
  }, [fetchLeaveApplications]);

  const fieldUsers = users.filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER');

  const getDisplayName = (l: LeaveType) => {
    const user = users.find((u) => u.id === l.employeeId || u.userId === l.employeeId || u.empCode === l.employeeId);
    const emp = employees.find((e) => e.id === l.employeeId || e.empCode === l.employeeId || e.empCode === user?.empCode);

    const name = l.employeeName || user?.fullName || (emp ? `${emp.firstName} ${emp.lastName}` : l.employeeId);
    const code = user?.userId || emp?.empCode || l.employeeId;
    const role = user?.role || l.designation || emp?.designation;
    const hq = user?.hqId || (emp as any)?.hqName || l.hqName || '-';

    return { name, code, role, hq };
  };

  const filteredLeaves = leaves.filter((l) => {
    if (l.year !== selectedFY) return false;
    const info = getDisplayName(l);
    if (roleFilter !== 'ALL' && info.role !== roleFilter) return false;
    if (q.trim()) {
      const match = [info.name, info.code, info.role, info.hq, l.year].join(' ').toLowerCase();
      if (!match.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  const totalPoolDays = filteredLeaves.reduce((sum, l) => sum + (l.cl || 0) + (l.sl || 0) + (l.pl || 0), 0);
  const avgDays = filteredLeaves.length ? Math.round(totalPoolDays / filteredLeaves.length) : 0;
  const pendingAppsCount = applications.filter((a) => a.status === 'PENDING').length;

  const handleSave = async (draft: Partial<LeaveType>) => {
    if (propSave) return await propSave(draft);
    const res = await addOrUpdateLeaveAllocation(draft);
    if (res.success) {
      await refresh(true);
      setShowAddModal(false);
      setEditingAllocation(null);
    }
    return res;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this leave allocation?')) return;
    if (propDelete) {
      await propDelete(id);
    } else {
      await deleteLeaveAllocation(id);
    }
    await refresh(true);
  };

  const handleApprove = async (id: string) => {
    await updateLeaveApplicationStatus(id, 'APPROVED');
    const apps = await fetchLeaveApplications();
    setApplications(apps || []);
  };

  const handleReject = async (id: string) => {
    await updateLeaveApplicationStatus(id, 'REJECTED');
    const apps = await fetchLeaveApplications();
    setApplications(apps || []);
  };

  const isReadOnly = selectedFY === '2025-26';

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <LeaveAllocationHeader
        allocatedCount={filteredLeaves.length}
        totalPoolDays={totalPoolDays}
        avgDays={avgDays}
        pendingAppsCount={pendingAppsCount}
        isReadOnly={isReadOnly}
        onOpenAdd={() => setShowAddModal(true)}
      />

      <LeaveAllocationToolbar
        selectedFY={selectedFY}
        setSelectedFY={setSelectedFY}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        balancesCount={filteredLeaves.length}
        applicationsCount={applications.length}
        q={q}
        setQ={setQ}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      {activeTab === 'BALANCES' && (
        <LeaveBalancesTable
          filteredLeaves={filteredLeaves}
          getDisplayName={getDisplayName}
          selectedFY={selectedFY}
          isReadOnly={isReadOnly}
          onEdit={(l) => setEditingAllocation(l)}
          onDelete={handleDelete}
        />
      )}

      {activeTab === 'APPLICATIONS' && (
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <LeaveApplicationsTable
            applications={applications}
            users={users}
            loading={appsLoading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      )}

      {(showAddModal || editingAllocation) && (
        <LeaveFormModal
          allocation={editingAllocation}
          users={fieldUsers}
          employees={employees}
          currentFY={selectedFY}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false);
            setEditingAllocation(null);
          }}
        />
      )}
    </div>
  );
}
