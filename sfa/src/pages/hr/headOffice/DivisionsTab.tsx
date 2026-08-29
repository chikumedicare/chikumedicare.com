import React, { useState, useMemo } from 'react';
import type { Division } from '../../../core/domain/hr/headOffice.types';

interface DivisionsTabProps {
  divisions: Division[];
  onAdd: () => void;
  onEdit: (d: Division) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => Promise<void>;
}

export function DivisionsTab({
  divisions,
  onAdd,
  onEdit,
  onToggleStatus,
}: DivisionsTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const filtered = useMemo(() => {
    return divisions.filter((d) => {
      const matchText =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase()) ||
        (d.headUserName && d.headUserName.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && d.isActive) ||
        (statusFilter === 'INACTIVE' && !d.isActive);

      return matchText && matchStatus;
    });
  }, [divisions, search, statusFilter]);

  return (
    <div>
      <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🌐</span>
        <span><b>Universal DCR Scope:</b> All marketing divisions and Super HQ (HQ000) are globally enabled for every field sales representative for reporting cycle meetings, launch conferences, and training sessions.</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search divisions by code, name, head..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', width: '280px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#ffffff' }}
          >
            <option value="ALL">🏢 All Status</option>
            <option value="ACTIVE">🟢 Active Only</option>
            <option value="INACTIVE">🔴 Inactive Only</option>
          </select>
        </div>
        <button className="primary" onClick={onAdd} style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>➕</span>
          <span>Add Marketing Division</span>
        </button>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 16px' }}>Code</th>
              <th style={{ padding: '12px 16px' }}>Division Name</th>
              <th style={{ padding: '12px 16px' }}>Division Lead</th>
              <th style={{ padding: '12px 16px' }}>Therapeutic Portfolio</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No marketing divisions found matching your search filter.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700, background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                      {d.code}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>{d.name}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{d.headUserName || '-'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '280px' }}>{d.description || '-'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      onClick={() => onToggleStatus(d.id, d.isActive)}
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: d.isActive ? '#dcfce7' : '#fee2e2',
                        color: d.isActive ? '#166534' : '#991b1b',
                        border: d.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                      }}
                      title="Click to toggle active status"
                    >
                      {d.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      className="link"
                      onClick={() => onEdit(d)}
                      style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
