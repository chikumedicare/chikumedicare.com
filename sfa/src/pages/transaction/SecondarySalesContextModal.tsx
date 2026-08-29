import React from 'react';
import type { FYMonthOption } from './PrimarySalesForm';

interface SecondarySalesContextModalProps {
  selectedStockistId: string;
  setSelectedStockistId: (id: string) => void;
  monthYear: string;
  setMonthYear: (m: string) => void;
  stockists: any[];
  currentStockist: any;
  currentFY: string;
  fyMonthOptions: FYMonthOption[];
  isAlreadyEntered: boolean;
  existingUnits?: number;
  onProceed: () => void;
  onCancel: () => void;
}

export function SecondarySalesContextModal({
  selectedStockistId,
  setSelectedStockistId,
  monthYear,
  setMonthYear,
  stockists,
  currentStockist,
  currentFY,
  fyMonthOptions,
  isAlreadyEntered,
  existingUnits,
  onProceed,
  onCancel,
}: SecondarySalesContextModalProps) {
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
              🏪 Secondary Sales Entry — Select Month
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Stockist ➔ Chemist Market Secondary Sales Statement
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
            1. Select Stockist Firm *
          </label>
          <select
            value={selectedStockistId}
            onChange={(e) => setSelectedStockistId(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff', fontWeight: 700, color: '#0284c7' }}
          >
            {stockists.map((stk) => (
              <option key={stk.id} value={stk.id}>
                {stk.firmName} ({stk.hqName})
              </option>
            ))}
          </select>
          <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#64748b' }}>
            📍 HQ: <b>{currentStockist.hqName}</b> • Proprietor: {currentStockist.proprietor}
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
              border: isAlreadyEntered ? '2px solid #0284c7' : '1px solid #cbd5e1',
              fontSize: '13.5px',
              background: isAlreadyEntered ? '#f0f9ff' : '#fff',
              fontWeight: 700,
              color: isAlreadyEntered ? '#0369a1' : '#059669',
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
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✅</span> Secondary statement already recorded: <b>{existingUnits?.toLocaleString('en-IN')} Units</b>.
              </div>
            ) : (
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✨</span> Fresh Month: No secondary statement found for this month.
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
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13.5px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>➡️</span> Proceed to Enter Secondary Quantities
          </button>
        </div>
      </div>
    </div>
  );
}
