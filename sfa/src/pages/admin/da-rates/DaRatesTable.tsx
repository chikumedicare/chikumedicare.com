import React from 'react';
import { Badge } from '../../../components/Badge';
import type { RoleDaSummary } from '../../../core/domain/hr/leave.types';

interface DaRatesTableProps {
  activeTab: 'DA' | 'TA';
  roleSummaries: RoleDaSummary[];
  onEdit: (r: RoleDaSummary) => void;
  onDelete: (r: RoleDaSummary) => void;
}

export function DaRatesTable({
  activeTab,
  roleSummaries,
  onEdit,
  onDelete,
}: DaRatesTableProps) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {activeTab === 'DA' ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Designation Role</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>Local HQ DA</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>EX-HQ DA</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#d97706' }}>Outstation DA</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>Transit DA</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Effective From</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roleSummaries.map((r) => (
              <tr
                key={r.role}
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.12s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <td style={{ padding: '8px 12px' }}>
                  <b style={{ color: '#0f172a', fontSize: '13.5px' }}>{r.role}</b>
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>₹ {r.hq} / day</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>₹ {r.exhq} / day</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#d97706' }}>₹ {r.outstation} / day</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>₹ {r.transit} / day</td>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{r.effectiveFrom}</td>
                <td style={{ padding: '8px 12px' }}>
                  <Badge v={r.active ? 'ACTIVE' : 'INACTIVE'} />
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(r)}
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
                      ✏️ Edit DA
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(r)}
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
                      🗑️ Reset
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {roleSummaries.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No role DA policy slabs found. Click <b>"+ Add Role Policy Slab"</b> to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Designation Role</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Fare Mode</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#7c3aed' }}>0 - 199 KM Rate</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, color: '#7c3aed' }}>200 - 299 KM Rate</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>299 - 599 KM Policy</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>600+ KM Policy</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roleSummaries.map((r) => (
              <tr
                key={r.role}
                style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.12s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                <td style={{ padding: '8px 12px' }}>
                  <b style={{ color: '#0f172a', fontSize: '13.5px' }}>{r.role}</b>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                    {r.fareType || 'TWO_WAY'}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#7c3aed' }}>₹ {r.kmRate0_199 || 3.5} / KM</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#7c3aed' }}>₹ {r.kmRate200_299 || 4.5} / KM</td>
                <td style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>{r.travelMode299_599 || 'Sleeper Ticket'}</td>
                <td style={{ padding: '8px 12px', color: '#475569', fontWeight: 600 }}>{r.travelMode600Plus || '3rd AC Ticket'}</td>
                <td style={{ padding: '8px 12px' }}>
                  <Badge v={r.active ? 'ACTIVE' : 'INACTIVE'} />
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    style={{
                      padding: '3px 8px',
                      background: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '4px',
                      fontWeight: 600,
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      color: '#7c3aed',
                    }}
                  >
                    ✏️ Edit KM Policy
                  </button>
                </td>
              </tr>
            ))}
            {roleSummaries.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No travel allowance policies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
