import React from 'react';
import type { Page } from '../../../../types';

interface ProfileHeroCardProps {
  fullName: string;
  role: string;
  roleBadgeColor: string;
  employeeId: string;
  status: string;
  statusColor: string;
  joiningDate: string;
  divisionName: string;
  mobile: string;
  email: string;
  hqName: string;
  reportingToName: string;
  reportingToRole: string;
  go?: (p: Page) => void;
  isAdminOrOwner: boolean;
}

export function ProfileHeroCard({
  fullName,
  role,
  roleBadgeColor,
  employeeId,
  status,
  statusColor,
  joiningDate,
  divisionName,
  mobile,
  email,
  hqName,
  reportingToName,
  reportingToRole,
  go,
  isAdminOrOwner,
}: ProfileHeroCardProps) {
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
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
                {fullName}
              </h1>
              <span
                style={{
                  background: roleBadgeColor,
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {role}
              </span>
              <span
                style={{
                  background: statusColor,
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {status}
              </span>
            </div>

            <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
              Employee ID: <strong style={{ color: '#e2e8f0' }}>{employeeId}</strong> • Joined: {joiningDate} • Division: {divisionName}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '13px', color: '#cbd5e1' }}>
              <span>📱 {mobile}</span>
              <span>✉️ {email}</span>
            </div>
          </div>
        </div>

        {/* Reporting Chain & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(8px)',
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Headquarter Base</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>📍 {hqName}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Reports To: <strong style={{ color: '#f1f5f9' }}>{reportingToName}</strong> ({reportingToRole})
            </div>
          </div>

          {isAdminOrOwner && go && (
            <button
              type="button"
              onClick={() => go('employees')}
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              👥 Open Employee Directory ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
