import React, { useState, useEffect } from 'react';
import { GatewayContainer } from '../../../core/container/GatewayContainer';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { getErrorMessage } from '../../../utils/dataIntegrity';

export function Login({
  onLogin,
}: {
  onLogin: (user: SfaUser, rememberMe: boolean, selectedFy: string) => void;
}) {
  const [id, setId] = useState(() => localStorage.getItem('chiku_remembered_userid') || 'CHIKU00001');
  const [pw, setPw] = useState('owner123');
  const [selectedFy, setSelectedFy] = useState('2026-27');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  const fyOptions = [
    { fy: '2026-27', label: 'FY 2026-27 (Current Active FY)' },
    { fy: '2025-26', label: 'FY 2025-26 (Previous Financial Year)' },
    { fy: '2024-25', label: 'FY 2024-25 (Archived FY)' },
  ];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (lockoutTimeLeft > 0) {
      timer = setInterval(() => {
        setLockoutTimeLeft((prev) => {
          if (prev <= 1) {
            setError('');
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTimeLeft > 0) {
      setError('🔒 Security Lockout Active: Please wait ' + lockoutTimeLeft + ' seconds before trying again.');
      return;
    }

    if (!id.trim()) {
      setError('Please enter your User ID, Mobile Number, or Email');
      return;
    }
    if (!pw) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      sessionStorage.setItem('chiku_active_fy', selectedFy);

      const authSession = await GatewayContainer.getAuthGateway().login(id.trim(), pw);
      const user = authSession.user;

      if (user && (user.isActive === false || user.status === 'INACTIVE' || user.status === 'RESIGNED')) {
        setError('🚫 Account Deactivated / Inactive. Please contact Corporate HQ Administrator.');
        setLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('chiku_remembered_userid', id.trim());
      } else {
        localStorage.removeItem('chiku_remembered_userid');
      }

      setFailedAttempts(0);
      sessionStorage.setItem('chiku_auth_user', JSON.stringify(user));
      onLogin(user, rememberMe, selectedFy);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('locked')) {
        setLockoutTimeLeft(15 * 60);
      }
      setFailedAttempts((prev) => prev + 1);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card-container">
        <div className="login-header-section">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img src="/chiku-full-logo.png" alt="Chiku Medicare" style={{ maxHeight: '64px', maxWidth: '240px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.2))' }} />
          </div>
          <h2>Chiku Medicare SFA</h2>
          <p className="login-subtitle">Enterprise Sales Force Automation & Governance Portal</p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form-body">
          <div className="form-group-item">
            <label htmlFor="userIdInput">Corporate User ID / Mobile / Email</label>
            <input
              id="userIdInput"
              type="text"
              className="login-input-field"
              placeholder="e.g. CHIKU00001, 9876543210"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={loading || lockoutTimeLeft > 0}
              required
            />
          </div>

          <div className="form-group-item">
            <label htmlFor="passwordInput">Secret Access Password</label>
            <div className="password-input-wrapper">
              <input
                id="passwordInput"
                type={showPassword ? 'text' : 'password'}
                className="login-input-field"
                placeholder="Enter password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={loading || lockoutTimeLeft > 0}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <div className="form-group-item">
            <label htmlFor="fySelect">Financial Year Context</label>
            <select
              id="fySelect"
              className="login-select-field"
              value={selectedFy}
              onChange={(e) => setSelectedFy(e.target.value)}
              disabled={loading || lockoutTimeLeft > 0}
            >
              {fyOptions.map((opt) => (
                <option key={opt.fy} value={opt.fy}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-checkbox-row">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading || lockoutTimeLeft > 0}
              />
              <span>Remember User ID on this device</span>
            </label>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading || lockoutTimeLeft > 0}
          >
            {loading ? 'Authenticating Live Cloud Session...' : 'Sign In to Workspace →'}
          </button>
        </form>

        <div className="login-footer-notes">
          <p>🔒 Protected by Enterprise Zero-Trust Architecture</p>
          <small>© 2026-27 Chiku Medicare Pvt. Ltd. All rights reserved.</small>
        </div>
      </div>
    </div>
  );
}
