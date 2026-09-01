import React from 'react';

interface DaRatesHeaderProps {
  rolesCount: number;
  avgHq: number;
  avgOutstation: number;
  avgKmRate: number;
  isReadOnly: boolean;
  onOpenAdd: () => void;
}

export function DaRatesHeader({
  rolesCount,
  avgHq,
  avgOutstation,
  avgKmRate,
  isReadOnly,
  onOpenAdd,
}: DaRatesHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>💵</span>
          <span>DA Rates & Travel Allowance Master</span>
        </h2>

        {/* Inline Metrics Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ padding: '3px 8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            👥 {rolesCount} Roles Configured
          </span>
          <span style={{ padding: '3px 8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            🔵 Avg ₹{avgHq}/d Local DA
          </span>
          <span style={{ padding: '3px 8px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            🟠 Avg ₹{avgOutstation}/d Outstation
          </span>
          <span style={{ padding: '3px 8px', background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            🟣 ₹{avgKmRate}/KM Base Fare
          </span>
        </div>
      </div>

      {/* Header Action Button */}
      {!isReadOnly && (
        <button
          type="button"
          onClick={onOpenAdd}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
          }}
        >
          <span>+</span>
          <span>Add Role Policy Slab</span>
        </button>
      )}
    </div>
  );
}
