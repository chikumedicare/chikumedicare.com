import React, { useState } from 'react';
import type { SfaUser } from '../../core/domain/hr/user.types';
import type { LoginAudit } from '../../core/domain/hr/lifecycle.types';

export function LoginHistoryModal({
  user,
  auditLogs,
  loading,
  onClose,
}: {
  user: SfaUser;
  auditLogs: LoginAudit[];
  loading: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'WEB' | 'MOBILE'>('ALL');

  const parseBrowserInfo = (userAgent?: string) => {
    if (!userAgent) return { browser: 'Web Browser / Client', os: 'Desktop/Web' };
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (userAgent.includes('Edg/')) browser = 'Microsoft Edge';
    else if (userAgent.includes('Chrome/')) browser = 'Google Chrome';
    else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Apple Safari';
    else if (userAgent.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (userAgent.includes('node')) browser = 'API / Automated Client';

    if (userAgent.includes('Windows NT 10.0') || userAgent.includes('Windows NT 11.0')) os = 'Windows 10/11';
    else if (userAgent.includes('Windows')) os = 'Windows OS';
    else if (userAgent.includes('Mac OS X')) os = 'macOS';
    else if (userAgent.includes('Android')) os = 'Android OS';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Linux')) os = 'Linux';

    return { browser, os };
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (activeTab === 'WEB') return log.clientType === 'web-admin';
    if (activeTab === 'MOBILE') return log.clientType !== 'web-admin';
    return true;
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '820px', width: '95%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '88vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              🌐 Web & Mobile Login History Audit
            </h3>
            <small style={{ color: '#64748b' }}>
              User: <b>{user.fullName}</b> (<code>{user.userId}</code>) | Role: <b>{user.role}</b> | Emp Code: <b>{user.empCode || 'N/A'}</b>
            </small>
          </div>
          <button
            className="secondary"
            onClick={onClose}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', marginBottom: '12px' }}>
          <button
            className={activeTab === 'ALL' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('ALL')}
            style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px' }}
          >
            All Sessions ({auditLogs.length})
          </button>
          <button
            className={activeTab === 'WEB' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('WEB')}
            style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px' }}
          >
            🌐 Web Admin Logins
          </button>
          <button
            className={activeTab === 'MOBILE' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('MOBILE')}
            style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px' }}
          >
            📱 Mobile App Logins
          </button>
        </div>

        {/* Logs Table */}
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading session history...</div>
          ) : (
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Client & Channel</th>
                  <th style={{ padding: '10px 12px' }}>Browser & OS Details</th>
                  <th style={{ padding: '10px 12px' }}>IP Address</th>
                  <th style={{ padding: '10px 12px' }}>Action / Event</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const bInfo = parseBrowserInfo(log.userAgent);
                  const isWeb = log.clientType === 'web-admin';
                  return (
                    <tr key={log.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <b>{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : '-'}</b>
                        <small style={{ color: '#64748b', display: 'block' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                        </small>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isWeb ? (
                          <span style={{ color: '#0284c7', fontWeight: 600 }}>🌐 Web Admin</span>
                        ) : (
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>📱 Mobile SFA</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isWeb ? (
                          <>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>{bInfo.browser}</div>
                            <small style={{ color: '#64748b' }}>{bInfo.os}</small>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: 500, color: '#0f172a' }}>
                              {log.deviceModel || user.deviceModel || 'Mobile Handset'}
                            </div>
                            <small style={{ color: '#64748b' }}>
                              {user.osVersion ? `OS: ${user.osVersion}` : (log.deviceId ? `UUID: ${log.deviceId.slice(0, 10)}...` : 'Registered App')}
                            </small>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px' }}>
                        {log.ipAddress || '-'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 500, color: '#334155' }}>
                          {log.action || 'LOGIN'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          background: log.result === 'SUCCESS' ? '#dcfce7' : '#fee2e2',
                          color: log.result === 'SUCCESS' ? '#15803d' : '#b91c1c'
                        }}>
                          {log.result || 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No login audit records found for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button
            className="secondary"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '8px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
