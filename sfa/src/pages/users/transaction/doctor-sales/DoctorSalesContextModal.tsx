import React from 'react';
import type { FYMonthOption } from '../primary-sales/PrimarySalesForm';

interface DoctorSalesContextModalProps {
  selectedDoctorId: string;
  setSelectedDoctorId: (id: string) => void;
  monthYear: string;
  setMonthYear: (m: string) => void;
  doctors: any[];
  currentDoctor: any;
  currentFY: string;
  fyMonthOptions: FYMonthOption[];
  isAlreadyEntered: boolean;
  existingUnits?: number;
  onProceed: () => void;
  onCancel: () => void;
}

export function DoctorSalesContextModal({
  selectedDoctorId,
  setSelectedDoctorId,
  monthYear,
  setMonthYear,
  doctors,
  currentDoctor,
  currentFY,
  fyMonthOptions,
  isAlreadyEntered,
  existingUnits,
  onProceed,
  onCancel,
}: DoctorSalesContextModalProps) {
  return (
    <div style={{ maxWidth: '620px', margin: '24px auto', width: '100%' }}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              🩺 Doctor Sales Entry — Select Month
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Doctor-wise Monthly Prescription Support & Product Units
            </small>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, fontSize: '12px', color: '#475569', cursor: 'pointer' }}
          >
            ✕ Cancel
          </button>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            1. Select Doctor *
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff', fontWeight: 700, color: '#7c3aed' }}
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.degree || 'MBBS'} - {doc.specialty || 'GP'}) - {doc.hqName}
              </option>
            ))}
          </select>
          <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#64748b' }}>
            📍 HQ: <b>{currentDoctor.hqName}</b> • Patch: <b>{currentDoctor.patchName || 'General'}</b>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            2. Select Sales Month (FY {currentFY}) *
          </label>
          <select
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: isAlreadyEntered ? '2px solid #7c3aed' : '1px solid #cbd5e1',
              fontSize: '13.5px',
              background: isAlreadyEntered ? '#f5f3ff' : '#fff',
              fontWeight: 700,
              color: isAlreadyEntered ? '#6d28d9' : '#059669',
            }}
          >
            {fyMonthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div style={{ marginTop: '8px' }}>
            {isAlreadyEntered ? (
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#6d28d9', background: '#ede9fe', border: '1px solid #ddd6fe', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✅</span> Doctor Rx already recorded: <b>{existingUnits?.toLocaleString('en-IN')} Units</b>. Proceeding will load data for update.
              </div>
            ) : (
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✨</span> Fresh Month: No prescription record found for this month.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ flex: '1', padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onProceed}
            style={{
              flex: '2',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13.5px',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>➡️</span> Proceed to Enter Doctor Rx Quantities
          </button>
        </div>
      </div>
    </div>
  );
}
