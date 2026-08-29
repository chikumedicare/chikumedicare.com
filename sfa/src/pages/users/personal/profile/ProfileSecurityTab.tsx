import React from 'react';

interface ProfileSecurityTabProps {
  pwForm: { current: string; new: string; confirm: string };
  setPwForm: React.Dispatch<React.SetStateAction<{ current: string; new: string; confirm: string }>>;
  pwSaving: boolean;
  pwMsg: { type: 'success' | 'error'; text: string } | null;
  handlePasswordChange: (e: React.FormEvent) => Promise<void>;
  deviceInfo: any;
  handleResetDevice: () => Promise<void>;
  deviceResetting: boolean;
}

export function ProfileSecurityTab({
  pwForm,
  setPwForm,
  pwSaving,
  pwMsg,
  handlePasswordChange,
  deviceInfo,
  handleResetDevice,
  deviceResetting,
}: ProfileSecurityTabProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      {/* Change Password Card */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔑</span> <span>Change Account Password</span>
        </h3>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Current Password</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              placeholder="Enter current password"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>New Password</label>
            <input
              type="password"
              value={pwForm.new}
              onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
              placeholder="Minimum 6 characters"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="Re-enter new password"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              required
            />
          </div>

          {pwMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                background: pwMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
                color: pwMsg.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${pwMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              }}
            >
              {pwMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            style={{
              marginTop: '6px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#059669',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: pwSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {pwSaving ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Hardware Device Lock Card */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📱</span> <span>Hardware Device Lock</span>
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
          Your account is bound to a single primary mobile / tablet hardware device for field attendance and location tracking.
        </p>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>Registered Device:</span>
            <strong style={{ color: '#0f172a' }}>{deviceInfo.name} ({deviceInfo.model})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>Hardware ID:</span>
            <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{deviceInfo.id}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#64748b' }}>OS / App:</span>
            <span style={{ color: '#334155' }}>{deviceInfo.os} • v{deviceInfo.app}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDevice}
          disabled={deviceResetting}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #fca5a5',
            background: '#fef2f2',
            color: '#dc2626',
            fontWeight: 700,
            fontSize: '13px',
            cursor: deviceResetting ? 'not-allowed' : 'pointer',
          }}
        >
          {deviceResetting ? 'Resetting Device...' : '🔓 Unbind / Reset Hardware Device'}
        </button>
      </div>
    </div>
  );
}
