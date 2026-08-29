import React from 'react';
import type { LeaveApplicationRecord } from '../../../../core/domain/transaction/leaveApplication.types';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';

interface LeaveApplicationListProps {
  records: LeaveApplicationRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fyFilter: string;
  setFyFilter: (fy: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onAddNew: () => void;
  onEdit: (rec: LeaveApplicationRecord) => void;
  onDelete: (id: string) => void;
}

export function LeaveApplicationList({
  records,
  searchQuery,
  setSearchQuery,
  fyFilter,
  setFyFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  onAddNew,
  onEdit,
  onDelete,
}: LeaveApplicationListProps) {
  const fyInfo = getFinancialYearInfo();

  const getLeaveTypeBadge = (t: string) => {
    switch (t) {
      case 'CL': return { bg: '#eff6ff', color: '#1e40af', label: '🌴 Casual Leave (CL)' };
      case 'SL': return { bg: '#ecfdf5', color: '#065f46', label: '💊 Sick Leave (SL)' };
      case 'PL': return { bg: '#faf5ff', color: '#6b21a8', label: '🏖️ Privilege Leave (PL)' };
      case 'LWP': return { bg: '#fef2f2', color: '#991b1b', label: '⚠️ Without Pay (LWP)' };
      default: return { bg: '#f8fafc', color: '#334155', label: t };
    }
  };

  return (
    <>
      {/* Top Filter Toolbar */}
      <div
        className="toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <input
          placeholder="Search by Employee, Role, HQ, Reason, or FY..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: '200px' }}
        />

        <select
          value={fyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          style={{ flex: '0 0 auto', fontWeight: 800, color: '#059669', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Financial Years</option>
          <option value={fyInfo.currentFY}>🟢 Current FY ({fyInfo.currentFY})</option>
          <option value={fyInfo.nextFY}>🔵 Next FY ({fyInfo.nextFY})</option>
          <option value={fyInfo.previousFY}>🔒 Previous FY ({fyInfo.previousFY})</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Leave Types</option>
          <option value="CL">Casual Leave (CL)</option>
          <option value="SL">Sick Leave (SL)</option>
          <option value="PL">Privilege Leave (PL)</option>
          <option value="LWP">Leave Without Pay (LWP)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <button
          type="button"
          className="primary"
          onClick={onAddNew}
          style={{
            marginLeft: 'auto',
            borderRadius: '10px',
            fontWeight: 700,
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>➕</span> Apply for Leave
        </button>
      </div>

      {/* Directory Table */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table>
          <thead>
            <tr>
              <th>Employee & Role</th>
              <th>Leave Type</th>
              <th>HQ Territory</th>
              <th>Duration & Dates</th>
              <th>Total Days</th>
              <th>Reason & Emergency No</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => {
              const badge = getLeaveTypeBadge(item.leaveType);

              return (
                <tr key={item.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '14px' }}>{item.employeeName}</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {item.employeeRole || 'Field MR'}
                    </div>
                  </td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                      📍 {item.hqName || 'Bhopal'}
                    </span>
                  </td>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '13px' }}>📅 {item.fromDate} ➔ {item.toDate}</b>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                        FY {item.financialYear}
                      </span>
                    </div>
                  </td>
                  <td>
                    <b style={{ color: '#0284c7', fontSize: '14px' }}>
                      {item.totalDays} Day(s)
                    </b>
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>{item.reason}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>📞 {item.emergencyContact}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        background:
                          item.status === 'APPROVED' ? '#ecfdf5' : item.status === 'PENDING_APPROVAL' ? '#eff6ff' : '#fef2f2',
                        color:
                          item.status === 'APPROVED' ? '#059669' : item.status === 'PENDING_APPROVAL' ? '#2563eb' : '#dc2626',
                      }}
                    >
                      ● {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#991b1b' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {records.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No Leave Applications found. Click <strong>"➕ Apply for Leave"</strong> to submit a new request.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
