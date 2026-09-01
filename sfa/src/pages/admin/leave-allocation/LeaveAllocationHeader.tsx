import React from 'react';

interface LeaveAllocationHeaderProps {
  allocatedCount: number;
  totalPoolDays: number;
  avgDays: number;
  pendingAppsCount: number;
  isReadOnly: boolean;
  onOpenBulk: () => void;
  onOpenAdd: () => void;
}

export function LeaveAllocationHeader({
  allocatedCount,
  totalPoolDays,
  avgDays,
  pendingAppsCount,
  isReadOnly,
  onOpenBulk,
  onOpenAdd,
}: LeaveAllocationHeaderProps) {
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
          <span>🏖️</span>
          <span>Leave Allocation & Entitlement Ledger</span>
        </h2>

        {/* Inline Metrics Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ padding: '3px 8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            👥 {allocatedCount} Staff Allocated
          </span>
          <span style={{ padding: '3px 8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            🟢 {totalPoolDays} Pool Days (Avg {avgDays}d)
          </span>
          {pendingAppsCount > 0 && (
            <span style={{ padding: '3px 8px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
              ⚠️ {pendingAppsCount} Pending
            </span>
          )}
        </div>
      </div>

      {/* Header Action Buttons */}
      {!isReadOnly && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onOpenBulk}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span>⚡</span>
            <span>Bulk Allocation</span>
          </button>
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
            <span>Add Allocation</span>
          </button>
        </div>
      )}
    </div>
  );
}
