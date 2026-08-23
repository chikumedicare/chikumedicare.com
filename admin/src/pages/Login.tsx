import React, { useState } from 'react';
import { HrGateway } from '../gateway/hr/hrGateway';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState('admin');
  const [pw, setPw] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await HrGateway.login(id.trim(), pw);
      onLogin();
    } catch (err: any) {
      console.error('[Login] Auth failure:', err);
      setError(err?.error || err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="loginbox">
        <div className="loginlogo">C</div>
        <h1>Chiku Medicare</h1>
        <p>Admin & Operations Portal</p>

        <div style={{ marginBottom: '14px', padding: '6px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '11px', color: '#166534', textAlign: 'center', fontWeight: 500 }}>
          🛡️ <strong>Restricted Access:</strong> ADMIN & OWNER Portal Only
        </div>

        {error && (
          <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '11px', marginBottom: '14px', lineHeight: 1.4 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            User ID / Admin ID
            <input
              type="text"
              value={id}
              placeholder="e.g. admin or OWNER"
              onChange={(e) => setId(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={pw}
              placeholder="••••••••"
              onChange={(e) => setPw(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <button type="submit" className="primary full" style={{ marginTop: '8px' }} disabled={loading}>
            {loading ? 'Authenticating with Backend...' : 'Sign In to Admin Console →'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #edf2f7', paddingTop: '15px' }}>
          <small style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
            🔐 <strong>Live Backend Auth:</strong> Connected to Cloudflare D1
          </small>
          <small style={{ color: '#94a3b8', fontSize: '10px', display: 'block', marginTop: '4px' }}>
            📱 Field representatives (MR, ASM, Managers) must use the SFA Mobile App.
          </small>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                window.location.href = 'http://localhost:8080/';
              } else {
                window.location.href = '/';
              }
            }}
            style={{ display: 'inline-block', marginTop: '10px', fontSize: '11px', color: '#166534', textDecoration: 'none', fontWeight: 600 }}
          >
            ← Return to Main Website
          </a>
        </div>
      </div>
    </div>
  );
}
