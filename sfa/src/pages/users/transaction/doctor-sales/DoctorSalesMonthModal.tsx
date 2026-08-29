import React from 'react';
import type { FYMonthOption } from '../primary-sales/PrimarySalesForm';

interface DoctorSalesMonthModalProps {
  monthYear: string;
  setMonthYear: (m: string) => void;
  currentFY: string;
  fyMonthOptions: FYMonthOption[];
  onProceed: () => void;
  onCancel: () => void;
}

export function DoctorSalesMonthModal({
  monthYear,
  setMonthYear,
  currentFY,
  fyMonthOptions,
  onProceed,
  onCancel,
}: DoctorSalesMonthModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
          maxWidth: '520px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              🗓️ Select Sales Month
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Choose month to load your territory's Doctor list
            </small>
          </div>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, fontSize: '12px', color: '#475569', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Sales Month (FY {currentFY}) *
          </label>
          <select
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '8px',
              border: '2px solid #8b5cf6',
              fontSize: '14px',
              background: '#f5f3ff',
              fontWeight: 800,
              color: '#6d28d9',
            }}
          >
            {fyMonthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                🗓️ {opt.label}
              </option>
            ))}
          </select>
          <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '11.5px' }}>
            Only current and previous months of active financial year are available.
          </small>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
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
            <span>➡️</span> Proceed to Doctor List
          </button>
        </div>
      </div>
    </div>
  );
}
