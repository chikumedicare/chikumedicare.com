import React from 'react';
import { Badge } from '../../../components/Badge';
import type { SfcRate } from '../../../core/domain/hr/sfc.types';

interface SfcMasterTableProps {
  loading: boolean;
  filtered: SfcRate[];
  onEdit: (sfc: SfcRate) => void;
  onDelete: (id: string, routeName: string) => void;
}

export function SfcMasterTable({
  loading,
  filtered,
  onEdit,
  onDelete,
}: SfcMasterTableProps) {
  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        Loading SFC Route Slabs & Live DA Rates...
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Origin (From Node)</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Destination (To Node)</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Category</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Distance (1-Way / Round)</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, color: '#7c3aed' }}>Rate / KM</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>Approved Fare</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Effective</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Status</th>
            <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr
              key={item.id}
              style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.12s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <td style={{ padding: '8px 12px' }}>
                <b style={{ color: '#0f172a' }}>{item.fromNodeName || item.fromHqName || '-'}</b>
                <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>{item.fromNodeType || 'Origin'}</small>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <b style={{ color: '#0284c7' }}>{item.toNodeName || item.toAreaName || '-'}</b>
                <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>{item.toNodeType || 'Destination'}</small>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: item.travelType === 'OUTSTATION' ? '#fef3c7' : item.travelType === 'EX_HQ' ? '#e0f2fe' : '#f1f5f9',
                    color: item.travelType === 'OUTSTATION' ? '#d97706' : item.travelType === 'EX_HQ' ? '#0284c7' : '#475569',
                  }}
                >
                  {item.travelType}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <b>{item.distanceKm} KM</b> (1-Way)
                <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>
                  Round: <b>{item.roundTripKm} KM</b>
                </small>
              </td>
              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#7c3aed' }}>
                ₹{item.ratePerKm || 3.5} / KM
              </td>
              <td style={{ padding: '8px 12px' }}>
                <b style={{ fontSize: '14px', color: '#16a34a' }}>₹ {item.approvedFare}</b>
              </td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.effectiveFrom || '2026-04-01'}</td>
              <td style={{ padding: '8px 12px' }}>
                <Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
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
                    onClick={() => onDelete(item.id, `${item.fromNodeName || item.fromHqName} ➔ ${item.toNodeName || item.toAreaName}`)}
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
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No SFC route fare slabs found. Click <b>"+ Add New SFC Slab"</b> to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
