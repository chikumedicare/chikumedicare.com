import React from 'react';
import type { LeaveBalance } from '../../core/domain/transaction/leaveApplication.types';

interface LeaveApplicationBalanceCardsProps {
  balance: LeaveBalance;
  pendingCount: number;
}

export function LeaveApplicationBalanceCards({ balance, pendingCount }: LeaveApplicationBalanceCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          🌴
        </div>
        <div>
          <small style={{ fontSize: '11px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>Casual Leave (CL)</small>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#0284c7' }}>
            {balance.clAvailable} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>/ {balance.clAllocated} Days</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          💊
        </div>
        <div>
          <small style={{ fontSize: '11px', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>Sick Leave (SL)</small>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>
            {balance.slAvailable} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>/ {balance.slAllocated} Days</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          🏖️
        </div>
        <div>
          <small style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 800, textTransform: 'uppercase' }}>Privilege Leave (PL)</small>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed' }}>
            {balance.plAvailable} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>/ {balance.plAllocated} Days</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
          ⏳
        </div>
        <div>
          <small style={{ fontSize: '11px', color: '#92400e', fontWeight: 800, textTransform: 'uppercase' }}>Pending Approvals</small>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#d97706' }}>
            {pendingCount} Requests
          </div>
        </div>
      </div>
    </div>
  );
}
