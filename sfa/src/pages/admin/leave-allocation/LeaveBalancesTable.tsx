import React from 'react';
import { Badge } from '../../../components/Badge';
import type { LeaveAllocation as LeaveType } from '../../../core/domain/hr/leave.types';

interface LeaveBalancesTableProps {
  filteredLeaves: LeaveType[];
  getDisplayName: (l: LeaveType) => { name: string; code: string; role?: string; hq?: string };
  selectedFY: string;
  isReadOnly: boolean;
  onEdit: (l: LeaveType) => void;
  onDelete: (id: string) => void;
}

export function LeaveBalancesTable({
  filteredLeaves,
  getDisplayName,
  selectedFY,
  isReadOnly,
  onEdit,
  onDelete,
}: LeaveBalancesTableProps) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Representative & Code</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Role</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>FY</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>Casual (CL)</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, color: '#dc2626' }}>Sick (SL)</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, color: '#d97706' }}>Privilege (PL)</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>Total Pool</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
            {!isReadOnly && <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'center' }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {filteredLeaves.map((l) => {
            const info = getDisplayName(l);
            const total = (l.cl || 0) + (l.sl || 0) + (l.pl || 0);

            return (
              <tr
                key={l.id}
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.12s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    >
                      {info.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <b style={{ color: '#0f172a' }}>{info.name}</b>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>
                        <code>{info.code}</code>
                      </small>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <Badge v={info.role || 'MR'} />
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{l.year}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>{l.cl} d</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#dc2626' }}>{l.sl} d</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#d97706' }}>{l.pl} d</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                    {total} Days
                  </span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <Badge v={l.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </td>
                {!isReadOnly && (
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(l)}
                        style={{
                          padding: '3px 8px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          color: '#0284c7',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(l.id)}
                        style={{
                          padding: '3px 8px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          color: '#dc2626',
                        }}
                      >
                        🗑️ Delete
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
                No leave allocations found for FY {selectedFY}. Click <b>"+ Add Allocation"</b> or <b>"⚡ Bulk Allocation"</b> to credit balances.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
