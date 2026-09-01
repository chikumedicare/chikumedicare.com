import React from 'react';

interface DoctorMasterHeaderProps {
  totalDoctors: number;
  classACount: number;
  activeCount: number;
  onOpenAdd: () => void;
}

export function DoctorMasterHeader({
  totalDoctors,
  classACount,
  activeCount,
  onOpenAdd,
}: DoctorMasterHeaderProps) {
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
          <span>🩺</span>
          <span>Doctor Master (List & Management)</span>
        </h2>

        {/* Inline Metric Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ padding: '3px 8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            👥 {totalDoctors} Registered
          </span>
          <span style={{ padding: '3px 8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            ⭐ {classACount} Class A / VIP
          </span>
          <span style={{ padding: '3px 8px', background: '#faf5ff', color: '#7c3aed', border: '1px solid #e9d5ff', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            🟢 {activeCount} Active
          </span>
        </div>
      </div>

      {/* Header Action Button */}
      <button
        type="button"
        onClick={onOpenAdd}
        style={{
          padding: '6px 14px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          fontSize: '12.5px',
          fontWeight: 700,
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
        }}
      >
        <span>+</span>
        <span>Add New Doctor</span>
      </button>
    </div>
  );
}
