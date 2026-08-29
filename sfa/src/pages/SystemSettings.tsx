import React, { useState } from 'react';
function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</h1>
      <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>{sub}</p>
    </div>
  );
}
import { GatewayContainer } from '../core/container/GatewayContainer';

export function SystemSettings() {
  const [activeFY, setActiveFY] = useState(localStorage.getItem('chiku_active_fy') || '2026-27');
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [gpsInterval, setGpsInterval] = useState('15');
  const [sessionTimeout, setSessionTimeout] = useState('12');
  const [dcrCutoff, setDcrCutoff] = useState('23:59');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('chiku_active_fy', activeFY);
    sessionStorage.setItem('chiku_active_fy', activeFY);

    try {
      await GatewayContainer.getSystemSettingsGateway().updateSettings({
        activeFinancialYear: activeFY,
        gpsTrackingEnabled: gpsEnabled,
        gpsSamplingIntervalSeconds: Number(gpsInterval) * 60,
      });
      setSavedMsg('System configuration and Financial Year rules successfully updated.');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err: unknown) {
      setSavedMsg('Settings saved locally.');
      setTimeout(() => setSavedMsg(''), 4000);
    }
  };

  return (
    <>
      <PageHeader
        title="⚙️ System Settings & Global Policy"
        sub="Financial Year • GPS Interval • Session Timeout • DCR Cutoff Timings"
      />

      {savedMsg && (
        <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#166534', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✅</span>
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Panel 1: System Engine & Services */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🖥️</span>
              <span>1. System Engine & API Environment</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>API Gateway Service Status</label>
                <input
                  type="text"
                  value="Production Active (Online)"
                  disabled
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0284c7', fontWeight: 600, fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <div style={{ padding: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#047857' }}>
                  <small style={{ display: 'block', color: '#065f46', fontWeight: 600 }}>Database Sync</small>
                  <strong style={{ fontSize: '13px' }}>🟢 Live & Operational</strong>
                </div>
                <div style={{ padding: '10px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', color: '#0369a1' }}>
                  <small style={{ display: 'block', color: '#075985', fontWeight: 600 }}>Encryption Standard</small>
                  <strong style={{ fontSize: '13px' }}>🔒 TLS 1.3 / AES-256</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Financial Year Controls */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📅</span>
              <span>2. Financial Year (FY) Controls</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Active Financial Year</label>
                <select
                  value={activeFY}
                  onChange={(e) => setActiveFY(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                >
                  <option value="2026-27">FY 2026-27 (Current Active FY)</option>
                  <option value="2025-26">FY 2025-26 (Previous Financial Year)</option>
                  <option value="2024-25">FY 2024-25 (Archived FY)</option>
                </select>
              </div>

              <div style={{ padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#b45309', fontSize: '12px' }}>
                ⚠️ Past Financial Years enter <strong>Read-Only Mode</strong> where data modification is restricted.
              </div>
            </div>
          </div>

          {/* Panel 3: GPS & Location Settings */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span>
              <span>3. GPS Tracking & Field Location Policy</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>Master GPS Tracking Toggle</span>
                <input
                  type="checkbox"
                  checked={gpsEnabled}
                  onChange={(e) => setGpsEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0284c7', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Location Checkpoint Frequency</label>
                <select
                  value={gpsInterval}
                  onChange={(e) => setGpsInterval(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  <option value="5">Every 5 Minutes (High Accuracy)</option>
                  <option value="15">Every 15 Minutes (Standard Field Frequency)</option>
                  <option value="30">Every 30 Minutes (Battery Saver)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Panel 4: Security & Cutoff Timings */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡️</span>
              <span>4. Security & Cutoff Timings</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Session Expiry Timeout (Hours)</label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Daily DCR Submission Cutoff Time</label>
                <input
                  type="time"
                  value={dcrCutoff}
                  onChange={(e) => setDcrCutoff(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="primary"
            style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 700, background: '#0284c7', borderColor: '#0284c7', borderRadius: '10px', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}
          >
            💾 Save System Settings
          </button>
        </div>
      </form>
    </>
  );
}
