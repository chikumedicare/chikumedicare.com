import React from 'react';

interface ApprovalKpiBarProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  title: string;
}

export function ApprovalKpiBar({ pendingCount, approvedCount, rejectedCount, title }: ApprovalKpiBarProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          ⏳
        </div>
        <div>
          <small style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Pending Approvals</small>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#d97706' }}>{pendingCount} Requests</div>
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          ✅
        </div>
        <div>
          <small style={{ fontSize: '11px', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>Approved ({title})</small>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>{approvedCount} Records</div>
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          ❌
        </div>
        <div>
          <small style={{ fontSize: '11px', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase' }}>Rejected Requests</small>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#dc2626' }}>{rejectedCount} Records</div>
        </div>
      </div>
    </div>
  );
}
