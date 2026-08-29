import React from 'react';
import type { Page } from '../../../../types';

interface AdminProfileHeroCardProps {
  fullName: string;
  role: string;
  empCode: string;
  designation: string;
  userMobile: string;
  userEmail: string;
  hqName: string;
  divisionName: string;
  reportingTo: string;
  logout: () => Promise<void>;
  go: (p: Page) => void;
}

export function AdminProfileHeroCard({
  fullName,
  role,
  empCode,
  designation,
  userMobile,
  userEmail,
  hqName,
  divisionName,
  reportingTo,
  logout,
  go,
}: AdminProfileHeroCardProps) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0b1329 0%, #0f172a 60%, #064e3b 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '32px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        {/* Avatar & Core Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
            }}
          >
            {fullName.charAt(0).toUpperCase()}
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '3px solid #0b1329',
              }}
              title="Online Live Session"
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                {fullName}
              </h1>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {role}
              </span>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                }}
              >
                {empCode}
              </span>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
              {designation}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📱</span> {userMobile}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✉️</span> {userEmail}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📍</span> HQ: <strong style={{ color: '#34d399' }}>{hqName}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💼</span> Division: <strong style={{ color: '#38bdf8' }}>{divisionName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => go('employees')}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>👥</span> Employee Directory
          </button>
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Are you sure you want to sign out?')) {
                await logout();
                window.location.reload();
              }
            }}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* Meta Footer Bar inside Hero Card */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12.5px',
          color: '#94a3b8',
        }}
      >
        <div>
          Hierarchical Superior: <strong style={{ color: '#ffffff' }}>{reportingTo}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Authenticated Session • Zero-Trust Cloudflare D1 Shield Active</span>
        </div>
      </div>
    </div>
  );
}
