import React from 'react';

interface AdminProfileSecurityTabProps {
  pwSuccess: string;
  pwError: string;
  handlePasswordChange: (e: React.FormEvent) => Promise<void>;
  oldPassword: string;
  setOldPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  pwLoading: boolean;
}

export function AdminProfileSecurityTab({
  pwSuccess,
  pwError,
  handlePasswordChange,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  pwLoading,
}: AdminProfileSecurityTabProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
      {/* Change Password Form */}
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
          🔑 Change Password
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>
          Update your secret administrative login password.
        </p>

        {pwSuccess && (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px', fontWeight: 600 }}>
            {pwSuccess}
          </div>
        )}
        {pwError && (
          <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px', fontWeight: 600 }}>
            ⚠️ {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Current / Old Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              New Password (Min 6 chars)
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '11px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              marginTop: '4px',
            }}
          >
            {pwLoading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>

      {/* Zero-Trust Architecture Info */}
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
          🛡️ Zero-Trust Security Protocol
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>
          Active session security layers protecting your account.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <div>
              <strong style={{ display: 'block', color: '#0f172a' }}>Zero localStorage Token Storage</strong>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Tokens stored exclusively in-memory to prevent XSS extraction.</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '20px' }}>🍪</span>
            <div>
              <strong style={{ display: 'block', color: '#0f172a' }}>HttpOnly Secure Cookie</strong>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Automatic token renewal handled via hardened browser cookies.</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <strong style={{ display: 'block', color: '#0f172a' }}>Live D1 Database Guard</strong>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>Every write request validated server-side on Cloudflare Workers.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
