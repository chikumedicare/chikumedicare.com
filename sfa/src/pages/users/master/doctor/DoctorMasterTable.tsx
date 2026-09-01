import React from 'react';
import { Badge } from '../../../../components/Badge';
import type { Doctor } from '../../../../core/domain/master/fieldMaster.types';

interface DoctorMasterTableProps {
  loading: boolean;
  filtered: Doctor[];
  getHqName: (hqId: string) => string;
  getAreaName: (areaId: string) => string;
  onEdit: (doc: Doctor) => void;
  onDelete: (id: string, name: string) => void;
}

export function DoctorMasterTable({
  loading,
  filtered,
  getHqName,
  getAreaName,
  onEdit,
  onDelete,
}: DoctorMasterTableProps) {
  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        Loading Doctor Master Records from Cloudflare D1...
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Doctor Name & Reg No</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Speciality & Qual</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Class</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Base HQ & Area</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Clinic Address</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Mobile Contact</th>
            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Visits/Mo</th>
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
                <b style={{ color: '#0f172a' }}>{item.doctorName}</b>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    <code>{item.doctorCode || item.id}</code>
                  </small>
                  {item.registrationNo && (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px' }}>
                      Reg: {item.registrationNo}
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <b style={{ color: '#0284c7' }}>{item.speciality || 'General'}</b>
                <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>{item.qualification || 'MBBS'}</small>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: item.doctorClass === 'VIP' ? '#fef3c7' : item.doctorClass === 'A' ? '#e0f2fe' : '#f1f5f9',
                    color: item.doctorClass === 'VIP' ? '#d97706' : item.doctorClass === 'A' ? '#0284c7' : '#475569',
                  }}
                >
                  Class {item.doctorClass || 'B'}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <b>{getHqName(item.hqId)}</b>
                <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>{getAreaName(item.areaId)}</small>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <small style={{ color: '#334155', fontWeight: 600 }}>{item.clinicAddress || 'Clinic'}</small>
                {item.city && <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>{item.city}</small>}
              </td>
              <td style={{ padding: '8px 12px' }}>
                <b>{item.mobile || 'N/A'}</b>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <b style={{ color: '#7c3aed' }}>{item.visitFrequency || 2} / mo</b>
              </td>
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
                    onClick={() => onDelete(item.id, item.doctorName)}
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
                No Doctor records found matching your filters. Click <b>"+ Add New Doctor"</b> to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
