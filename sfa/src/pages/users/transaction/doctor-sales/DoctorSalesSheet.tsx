import React, { useState } from 'react';
import type { DoctorSalesEntryRecord } from '../../../../core/domain/transaction/doctorSales.types';

interface DoctorSalesSheetProps {
  monthYear: string;
  currentFY: string;
  doctors: any[];
  entries: DoctorSalesEntryRecord[];
  onOpenProductEditor: (doctor: any) => void;
  onChangeMonth: () => void;
  onBackToDirectory: () => void;
}

export function DoctorSalesSheet({
  monthYear,
  currentFY,
  doctors,
  entries,
  onOpenProductEditor,
  onChangeMonth,
  onBackToDirectory,
}: DoctorSalesSheetProps) {
  const [searchDoc, setSearchDoc] = useState('');
  const [patchFilter, setPatchFilter] = useState('ALL');

  const patches = Array.from(new Set(doctors.map((d) => d.patchName || 'General')));

  const filteredDoctors = doctors.filter((doc) => {
    if (patchFilter !== 'ALL' && (doc.patchName || 'General') !== patchFilter) return false;
    if (searchDoc.trim()) {
      const q = searchDoc.toLowerCase().trim();
      const str = `${doc.name} ${doc.specialty || ''} ${doc.patchName || ''} ${doc.hqName || ''}`.toLowerCase();
      if (!str.includes(q)) return false;
    }
    return true;
  });

  // Calculate month metrics
  const monthEntries = entries.filter((e) => e.monthYear === monthYear);
  const totalEnteredDoctors = monthEntries.filter((e) => e.totalQuantity > 0).length;
  const totalMonthUnits = monthEntries.reduce((sum, e) => sum + e.totalQuantity, 0);
  const totalMonthVal = monthEntries.reduce((sum, e) => sum + e.totalAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Header & Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToDirectory}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 14px', fontWeight: 800, fontSize: '13px', color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>←</span> Back to Directory
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
              Doctor Sales Sheet: {monthYear} (FY {currentFY})
            </h3>
            <small style={{ color: '#64748b', fontSize: '11.5px' }}>
              All assigned doctors in your territory for month {monthYear}
            </small>
          </div>
        </div>

        <button
          type="button"
          onClick={onChangeMonth}
          style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, color: '#6d28d9', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span>🗓️</span> Change Month ({monthYear})
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            👨‍⚕️
          </div>
          <div>
            <small style={{ fontSize: '11px', color: '#5b21b6', fontWeight: 800, textTransform: 'uppercase' }}>Doctors Recorded</small>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
              {totalEnteredDoctors} / {doctors.length} Doctors
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            💊
          </div>
          <div>
            <small style={{ fontSize: '11px', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>Total Rx Units</small>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>
              {totalMonthUnits.toLocaleString('en-IN')} Units
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            💰
          </div>
          <div>
            <small style={{ fontSize: '11px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>Total Business Value</small>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed' }}>
              ₹ {totalMonthVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#ffffff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <input
          placeholder="Search doctors by name, specialty, or clinic..."
          value={searchDoc}
          onChange={(e) => setSearchDoc(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        />
        <select
          value={patchFilter}
          onChange={(e) => setPatchFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
        >
          <option value="ALL">All Patches / Areas</option>
          {patches.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Full Doctor List Table */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Doctor Name & Specialty</th>
              <th>HQ Territory</th>
              <th>Working Patch</th>
              <th>Status</th>
              <th>Prescribed Units</th>
              <th>Doctor Value (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doc) => {
              const record = entries.find((e) => e.doctorId === doc.id && e.monthYear === monthYear);
              const isEntered = record && record.totalQuantity > 0;

              return (
                <tr key={doc.id} style={{ background: isEntered ? '#faf5ff' : '#ffffff' }}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '14px' }}>{doc.name}</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      {doc.degree || 'MBBS'} • {doc.specialty || 'General Physician'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                      📍 {doc.hqName}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                      {doc.patchName || 'General'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        background: isEntered ? '#ede9fe' : '#f1f5f9',
                        color: isEntered ? '#6d28d9' : '#64748b',
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      {isEntered ? '● Entered' : '○ Pending'}
                    </span>
                  </td>
                  <td>
                    <b style={{ color: isEntered ? '#059669' : '#94a3b8', fontSize: '14px' }}>
                      {isEntered ? `💊 ${record.totalQuantity.toLocaleString('en-IN')} Units` : '0 Units'}
                    </b>
                  </td>
                  <td>
                    <b style={{ color: isEntered ? '#7c3aed' : '#94a3b8', fontSize: '14px' }}>
                      {isEntered ? `₹${record.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                    </b>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onOpenProductEditor(doc)}
                      style={{
                        background: isEntered ? '#f5f3ff' : '#ffffff',
                        border: isEntered ? '1px solid #ddd6fe' : '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '12px',
                        color: isEntered ? '#6d28d9' : '#0f172a',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{isEntered ? '✏️' : '➕'}</span> {isEntered ? 'Edit Products' : 'Enter Products'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
