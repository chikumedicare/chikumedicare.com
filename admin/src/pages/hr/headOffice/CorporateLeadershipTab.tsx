import React from 'react';
import type { SfaUser } from '../../../domain/hr/user.types';

interface CorporateLeadershipTabProps {
  users: SfaUser[];
}

export function CorporateLeadershipTab({ users }: CorporateLeadershipTabProps) {
  // Filter for ADMIN and OWNER users or users appointed to Super HQ
  const corporateLeaders = users.filter(
    (u) => u.role === 'ADMIN' || u.role === 'OWNER' || u.hqId === 'hq_super_ho'
  );

  return (
    <div>
      <div style={{ padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', color: '#1e40af' }}>
        ℹ️ <b>Corporate Apex Allocation:</b> Only Company <b>ADMIN</b>, <b>OWNER</b>, and Corporate Directors are appointed at <b>Head Office & Super HQ (HQ000)</b>. Field sales representatives (MR, ASM, RSM) are assigned to regional field territories.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {corporateLeaders.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            No corporate leadership appointed yet.
          </div>
        ) : (
          corporateLeaders.map((leader) => (
            <div
              key={leader.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}>
                    {leader.fullName ? leader.fullName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{leader.fullName || 'Corporate User'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>User ID: <code>{leader.userId}</code></div>
                  </div>
                </div>
                <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, background: '#fef3c7', color: '#b45309' }}>
                  {leader.role === 'ADMIN' ? '👑 SYSTEM ADMIN' : '⭐ OWNER'}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#475569' }}>
                <div><b>Appointed HQ:</b> HQ000 — Corporate Head Office (Super HQ)</div>
                <div><b>Mobile:</b> {leader.mobile || '—'}</div>
                <div><b>Email:</b> {leader.email || '—'}</div>
                <div><b>Status:</b> <span style={{ color: leader.isActive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{leader.isActive ? 'ACTIVE (Operational)' : 'INACTIVE'}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
