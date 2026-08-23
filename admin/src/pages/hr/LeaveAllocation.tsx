import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { LeaveAllocation as LeaveType, LeaveApplication } from '../../domain/hr/leave.types';
import type { Employee } from '../../domain/hr/employee.types';
import type { SfaUser } from '../../domain/hr/user.types';
import { LeaveFormModal } from './LeaveFormModal';
import { BulkLeaveModal } from './BulkLeaveModal';
import { LeaveApplicationsTable } from './LeaveApplicationsTable';

export function LeaveAllocation({
  leaves = [],
  employees = [],
  users = [],
  onSaveAllocation,
  onDeleteAllocation,
  onBulkAllocate,
  onFetchApplications,
  onUpdateAppStatus,
}: {
  leaves?: LeaveType[];
  employees?: Employee[];
  users?: SfaUser[];
  onSaveAllocation?: (draft: Partial<LeaveType>) => Promise<{ success: boolean; error?: string }>;
  onDeleteAllocation?: (id: string) => Promise<{ success: boolean; error?: string }>;
  onBulkAllocate?: (year: string, cl: number, sl: number, pl: number, role?: string, overwrite?: boolean) => Promise<{ success: boolean; error?: string; count?: number }>;
  onFetchApplications?: (fy?: string) => Promise<LeaveApplication[]>;
  onUpdateAppStatus?: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<{ success: boolean; error?: string }>;
}) {
  const [activeTab, setActiveTab] = useState<'BALANCES' | 'APPLICATIONS'>('BALANCES');
  const [selectedFY, setSelectedFY] = useState('2026-27');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<LeaveType | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Applications state
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'APPLICATIONS' && onFetchApplications) {
      setAppsLoading(true);
      onFetchApplications(selectedFY)
        .then((data) => setApplications(data || []))
        .catch(() => setApplications([]))
        .finally(() => setAppsLoading(false));
    }
  }, [activeTab, selectedFY, onFetchApplications]);

  const fieldUsers = users.filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER');

  const filteredLeaves = leaves.filter((l) => {
    const matchesFY = !selectedFY || l.year === selectedFY;
    if (!matchesFY) return false;

    const user = users.find((u) => u.id === l.employeeId);
    const emp = employees.find((e) => e.id === l.employeeId || e.empCode === l.employeeId);
    const userRole = user?.role || 'MR';
    if (roleFilter !== 'ALL' && userRole !== roleFilter) return false;

    if (q.trim()) {
      const name = user?.fullName || (emp ? `${emp.firstName} ${emp.lastName}` : l.employeeName || '');
      const code = user?.empCode || user?.userId || emp?.empCode || l.employeeId;
      const haystack = `${name} ${code} ${userRole} ${l.year}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }

    return true;
  });

  const getDisplayName = (l: LeaveType) => {
    const user = users.find((u) => u.id === l.employeeId);
    if (user) return { name: user.fullName, code: user.empCode || user.userId, role: user.role };
    const emp = employees.find((e) => e.id === l.employeeId || e.empCode === l.employeeId);
    if (emp) return { name: `${emp.firstName} ${emp.lastName}`, code: emp.empCode, role: emp.designation };
    return { name: l.employeeName || 'SFA User', code: l.employeeId, role: l.designation || 'MR' };
  };

  const totalPoolDays = filteredLeaves.reduce((sum, l) => sum + (l.cl + l.sl + l.pl), 0);
  const avgDays = filteredLeaves.length > 0 ? Math.round(totalPoolDays / filteredLeaves.length) : 0;
  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;

  const isReadOnly = selectedFY === '2025-26';

  const handleApproveApp = async (id: string) => {
    if (onUpdateAppStatus) {
      await onUpdateAppStatus(id, 'APPROVED');
      if (onFetchApplications) {
        const fresh = await onFetchApplications(selectedFY);
        setApplications(fresh || []);
      }
    }
  };

  const handleRejectApp = async (id: string) => {
    if (onUpdateAppStatus) {
      await onUpdateAppStatus(id, 'REJECTED');
      if (onFetchApplications) {
        const fresh = await onFetchApplications(selectedFY);
        setApplications(fresh || []);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this leave entitlement allocation?')) {
      if (onDeleteAllocation) {
        await onDeleteAllocation(id);
      }
    }
  };

  return (
    <>
      <Head
        title="Leave Allocation & Entitlement Ledger"
        sub="Financial Year Entitlements: CL, SL and PL pools with live approval tracking."
        action={
          !isReadOnly && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="secondary"
                onClick={() => setShowBulkModal(true)}
                style={{ borderRadius: '8px', fontWeight: 600 }}
              >
                ⚡ Bulk Annual Allocation
              </button>
              <button
                className="primary"
                onClick={() => setShowAddModal(true)}
                style={{ borderRadius: '8px', fontWeight: 600 }}
              >
                + Add Allocation
              </button>
            </div>
          )
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{filteredLeaves.length} Reps</b>
          <small>Allocated Employees ({selectedFY})</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#16a34a' }}>{totalPoolDays} Days</b>
          <small>Total Company Leave Pool</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>{avgDays} Days / Rep</b>
          <small>Average Entitlement (CL+SL+PL)</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: pendingCount > 0 ? '#ea580c' : '#64748b' }}>{pendingCount} Pending</b>
          <small>Applications Awaiting Approval</small>
        </div>
      </div>

      {/* Dual Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={activeTab === 'BALANCES' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('BALANCES')}
          style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }}
        >
          🏖️ Entitlements & Balances ({filteredLeaves.length})
        </button>
        <button
          className={activeTab === 'APPLICATIONS' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('APPLICATIONS')}
          style={{ padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }}
        >
          📝 Leave Applications Ledger {pendingCount > 0 && <span style={{ background: '#ea580c', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', marginLeft: '6px' }}>{pendingCount}</span>}
        </button>
      </div>

      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <select value={selectedFY} onChange={(e) => setSelectedFY(e.target.value)} style={{ flex: '0 0 auto', fontWeight: 600 }}>
          <option value="2026-27">FY 2026-27 (Current Active)</option>
          <option value="2027-28">FY 2027-28 (Upcoming Planning)</option>
          <option value="2025-26">FY 2025-26 (Past - Read Only)</option>
        </select>

        {activeTab === 'BALANCES' && (
          <>
            <input
              placeholder="Search by employee name, emp code, role or FY..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ flex: '1 1 240px' }}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
              <option value="ALL">All Roles</option>
              <option value="MR">MR Only</option>
              <option value="SR_MR">Sr. MR Only</option>
              <option value="ASM">ASM Only</option>
              <option value="SR_ASM">Sr. ASM Only</option>
              <option value="RSM">RSM Only</option>
              <option value="ZSM">ZSM Only</option>
              <option value="NSM">NSM Only</option>
              <option value="VP">VP Only</option>
            </select>
          </>
        )}
      </div>

      {isReadOnly && (
        <div style={{ padding: '10px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: '#92400e' }}>
          🔒 <b>Past Financial Year (Read-Only Mode):</b> CUD actions are disabled per Rule 4 to protect historical audit integrity.
        </div>
      )}

      {/* Tab 1: Balances Table */}
      {activeTab === 'BALANCES' && (
        <div className="panel table">
          <table>
            <thead>
              <tr>
                <th>Employee & User ID</th>
                <th>Role & HQ</th>
                <th>Financial Year</th>
                <th>Casual Leave (CL)</th>
                <th>Sick Leave (SL)</th>
                <th>Privilege Leave (PL)</th>
                <th>Total Pool</th>
                <th>Status</th>
                {!isReadOnly && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((l) => {
                const info = getDisplayName(l);
                const total = l.cl + l.sl + l.pl;

                return (
                  <tr key={l.id}>
                    <td>
                      <b>{info.name}</b>
                      <small style={{ color: '#64748b', display: 'block' }}>
                        <code>{info.code}</code>
                      </small>
                    </td>
                    <td>
                      <Badge v={info.role || 'MR'} />
                    </td>
                    <td><b>{l.year}</b></td>
                    <td><b style={{ color: '#0284c7' }}>{l.cl} Days</b></td>
                    <td><b style={{ color: '#dc2626' }}>{l.sl} Days</b></td>
                    <td><b style={{ color: '#d97706' }}>{l.pl} Days</b></td>
                    <td><span style={{ fontWeight: 700, color: '#16a34a' }}>{total} Days</span></td>
                    <td><Badge v={l.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                    {!isReadOnly && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="link"
                            onClick={() => setEditingAllocation(l)}
                            style={{ fontWeight: 600 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="link"
                            onClick={() => handleDelete(l.id)}
                            style={{ color: '#ef4444' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={isReadOnly ? 8 : 9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No leave allocations found for FY {selectedFY}. Use "+ Add Allocation" or "⚡ Bulk Annual Allocation" to credit balances.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Applications Ledger */}
      {activeTab === 'APPLICATIONS' && (
        <div className="panel table">
          <LeaveApplicationsTable
            applications={applications}
            users={users}
            loading={appsLoading}
            onApprove={handleApproveApp}
            onReject={handleRejectApp}
          />
        </div>
      )}

      {/* Modals */}
      {(showAddModal || editingAllocation) && (
        <LeaveFormModal
          allocation={editingAllocation}
          users={fieldUsers}
          employees={employees}
          currentFY={selectedFY}
          onSave={onSaveAllocation || (async () => ({ success: true }))}
          onClose={() => { setShowAddModal(false); setEditingAllocation(null); }}
        />
      )}

      {showBulkModal && (
        <BulkLeaveModal
          users={fieldUsers}
          currentFY={selectedFY}
          onBulkAllocate={onBulkAllocate || (async () => ({ success: true }))}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </>
  );
}
