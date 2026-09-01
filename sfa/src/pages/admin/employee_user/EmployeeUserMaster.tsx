import React, { useState, useMemo } from 'react';
import type { EmployeeUserRecord } from './employeeUser.types';
import { useEmployeeUserActions } from './useEmployeeUserActions';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { EmployeeUserModal } from './EmployeeUserModal';
import { EmployeeUserConfirmModal, ConfirmActionType } from './EmployeeUserConfirmModal';

export function EmployeeUserMaster() {
  const {
    records,
    users,
    loading,
    error,
    refresh,
    saveEmployeeUser,
    toggleActive,
    deleteRecord,
  } = useEmployeeUserActions();

  const { divisions, refresh: refreshHo } = useHeadOfficeStore();
  const { hqs, states, refresh: refreshGeo } = useGeographyStore();

  // Auto-refresh HO and Geography on mount to ensure fresh dropdown data
  React.useEffect(() => {
    refreshHo(true);
    refreshGeo(true);
  }, [refreshHo, refreshGeo]);

  // Search & Filter States
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [divFilter, setDivFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmployeeUserRecord | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    item: EmployeeUserRecord;
    actionType: ConfirmActionType;
  } | null>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchQ =
        !q.trim() ||
        `${r.userId} ${r.fullName} ${r.firstName} ${r.lastName} ${r.mobile} ${r.email || ''}`
          .toLowerCase()
          .includes(q.toLowerCase());

      const matchRole = roleFilter === 'ALL' || r.role === roleFilter;
      const matchDiv = divFilter === 'ALL' || r.divisionId === divFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && r.isActive) ||
        (statusFilter === 'INACTIVE' && !r.isActive);

      return matchQ && matchRole && matchDiv && matchStatus;
    });
  }, [records, q, roleFilter, divFilter, statusFilter]);

  const getHqName = (hqId?: string) => {
    if (!hqId) return 'Direct HO';
    const found = hqs.find((h) => h.id === hqId);
    return found ? found.name : 'Field Territory';
  };

  const getDivisionName = (divId?: string, role?: string) => {
    if (role === 'OWNER' || role === 'ADMIN') return 'Apex (All Divisions)';
    if (!divId) return 'General';
    const found = divisions.find((d) => d.id === divId);
    return found ? found.name : 'Division';
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'Executive Direct';
    const found = users.find((u) => u.id === managerId);
    return found ? found.fullName : 'Head Office';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 2-Row Modern Header */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Row 1: Title, Filters & Add Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👥</span>
              <span>Employee & User Master</span>
            </h2>
            <span style={{ padding: '3px 10px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {records.length} Profiles
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600, background: '#ffffff' }}
            >
              <option value="ALL">👔 All Designations</option>
              <option value="MR">Medical Rep (MR)</option>
              <option value="ASM">Area Sales Mgr (ASM)</option>
              <option value="RSM">Regional Mgr (RSM)</option>
              <option value="ZSM">Zonal Mgr (ZSM)</option>
              <option value="ADMIN">Administrator</option>
            </select>

            <select
              value={divFilter}
              onChange={(e) => setDivFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600, background: '#ffffff' }}
            >
              <option value="ALL">🏢 All Divisions</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 600, background: '#ffffff' }}
            >
              <option value="ALL">🟢 All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <button
              type="button"
              onClick={() => { setEditingRecord(null); setModalOpen(true); }}
              style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' }}
            >
              <span>➕</span>
              <span>Onboard Employee</span>
            </button>
          </div>
        </div>

        {/* Row 2: Live Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Live Search by Employee Code / User ID, Full Name, Mobile Number, Email..."
            style={{ width: '100%', padding: '9px 14px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f8fafc' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '14px', color: '#94a3b8' }}>🔍</span>
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              style={{ position: 'absolute', right: '12px', top: '8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Data Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Emp Code / User ID</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Employee Name & Contact</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Role & Division</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Field HQ & Manager</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>KYC & Bank</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    <div>Loading registered employees and SFA users from D1 database...</div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>No Employees or Users Found</div>
                    <div style={{ fontSize: '12.5px', marginTop: '4px' }}>Click "Onboard Employee" to add your first field force member.</div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, index) => {
                  const isEven = index % 2 === 0;
                  const hasKyc = Boolean(r.panNumber || r.aadhaarNumber);
                  const hasBank = Boolean(r.bankName && r.accountNumber);

                  return (
                    <tr key={r.id} style={{ background: isEven ? '#ffffff' : '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{ padding: '3px 8px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>
                          {r.userId}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                          {r.fullName || r.firstName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '8px' }}>
                          <span>📱 {r.mobile || 'No Mobile'}</span>
                          {r.email && <span>✉️ {r.email}</span>}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-block', padding: '2px 8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>
                          {r.role}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '3px' }}>
                          🏢 {getDivisionName(r.divisionId, r.role)}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                          📍 {getHqName(r.hqId)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          👤 Reports To: {getManagerName(r.reportsToId)}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, background: hasKyc ? '#ecfdf5' : '#fef2f2', color: hasKyc ? '#065f46' : '#991b1b', border: `1px solid ${hasKyc ? '#a7f3d0' : '#fecaca'}` }}>
                            {hasKyc ? '✓ KYC' : 'No KYC'}
                          </span>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, background: hasBank ? '#eff6ff' : '#fef2f2', color: hasBank ? '#1d4ed8' : '#991b1b', border: `1px solid ${hasBank ? '#bfdbfe' : '#fecaca'}` }}>
                            {hasBank ? '✓ Bank' : 'No Bank'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, background: r.isActive ? '#ecfdf5' : '#fef2f2', color: r.isActive ? '#065f46' : '#991b1b', border: `1px solid ${r.isActive ? '#a7f3d0' : '#fecaca'}` }}>
                          <span style={{ fontSize: '8px' }}>●</span>
                          <span>{r.isActive ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingRecord(r); setModalOpen(true); }}
                            style={{ padding: '5px 10px', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmModal({ item: r, actionType: r.isActive ? 'DEACTIVATE' : 'ACTIVATE' })}
                            style={{ padding: '5px 8px', border: `1px solid ${r.isActive ? '#fecaca' : '#bbf7d0'}`, background: r.isActive ? '#fff1f2' : '#f0fdf4', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: r.isActive ? '#be123c' : '#15803d', cursor: 'pointer' }}
                          >
                            {r.isActive ? '🚫' : '🟢'}
                          </button>
                          {r.role !== 'OWNER' && r.userId !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => setConfirmModal({ item: r, actionType: 'DELETE' })}
                              style={{ padding: '5px 8px', border: '1px solid #fecdd3', background: '#fff1f2', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#e11d48', cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard / Edit Unified Modal */}
      {modalOpen && (
        <EmployeeUserModal
          item={editingRecord}
          divisions={divisions}
          hqs={hqs}
          states={states}
          allUsers={users}
          onSave={saveEmployeeUser}
          onClose={() => { setModalOpen(false); setEditingRecord(null); }}
        />
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <EmployeeUserConfirmModal
          item={confirmModal.item}
          actionType={confirmModal.actionType}
          onConfirm={async () => {
            if (confirmModal.actionType === 'DEACTIVATE' || confirmModal.actionType === 'ACTIVATE') {
              await toggleActive(confirmModal.item);
            } else if (confirmModal.actionType === 'DELETE') {
              await deleteRecord(confirmModal.item);
            }
            setConfirmModal(null);
          }}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
