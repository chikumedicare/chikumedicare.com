import React from 'react';
import type { SfaUser } from '../../../core/domain/hr/user.types';

interface CorporateLeadershipTabProps {
  users: SfaUser[];
}

export function CorporateLeadershipTab({ users }: CorporateLeadershipTabProps) {
  const corporateLeaders = users.filter(
    (u) => u.role === 'ADMIN' || u.role === 'OWNER' || u.hqId === 'hq_super_ho'
  );

  return (
    <div>
      <div style={{ padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>👑</span>
        <span><b>Corporate Apex Allocation:</b> Company <b>ADMIN</b>, <b>OWNER</b>, and Corporate Directors are appointed at <b>Head Office & Super HQ (HQ000)</b>. Regional managers (RSM, ASM, MR) are mapped to field territories.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {corporateLeaders.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            No corporate leadership appointed yet.
          </div>
        ) : (
          corporateLeaders.map((leader) => (
            <div
              key={leader.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px',
                background: '#ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', boxShadow: '0 2px 6px rgba(2,132,199,0.25)' }}>
                    {leader.fullName ? leader.fullName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{leader.fullName || 'Corporate User'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>User ID: <code style={{ color: '#0284c7', fontWeight: 600 }}>{leader.userId}</code></div>
                  </div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                  {leader.role === 'ADMIN' ? '🛡️ SYSTEM ADMIN' : '👑 OWNER'}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569' }}>
                <div><b>Appointed HQ:</b> HQ000 - Corporate Head Office (Super HQ)</div>
                <div><b>Mobile:</b> {leader.mobile || '-'}</div>
                <div><b>Email:</b> {leader.email || '-'}</div>
                <div><b>Status:</b> <span style={{ color: leader.isActive ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{leader.isActive ? '🟢 ACTIVE (Operational)' : '🔴 INACTIVE'}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
