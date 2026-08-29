import { getErrorMessage } from '../../utils/dataIntegrity';
import React, { useState } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { SfaUser } from '../../core/domain/hr/user.types';
import type { LoginAudit } from '../../core/domain/hr/lifecycle.types';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../store/hr/useAuthSessionStore';
import { LoginHistoryModal } from './LoginHistoryModal';

export function DeviceManagement({
  users,
  onResetDevice,
  onFetchAudit,
  onUnlockUser,
}: {
  users: SfaUser[];
  onResetDevice: (u: SfaUser) => Promise<{ success: boolean; error?: string }>;
  onFetchAudit: (userId: string) => Promise<LoginAudit[]>;
  onUnlockUser?: (userId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [q, setQ] = useState('');
  const [selectedUser, setSelectedUser] = useState<SfaUser | null>(null);
  const [auditLogs, setAuditLogs] = useState<LoginAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Reset Modals
  const [resetTargetUser, setResetTargetUser] = useState<SfaUser | null>(null);
  const [resetDoneMessage, setResetDoneMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const { divisions } = useHeadOfficeStore();
  const { role } = useAuthSessionStore();

  const getDivisionName = (divId?: string) => {
    if (!divId) return '-';
    return divisions.find((d) => d.id === divId)?.name || divId;
  };

  const list = users.filter((u) =>
    `${u.fullName} ${u.userId} ${u.empCode} ${u.deviceModel || ''} ${u.deviceName || ''} ${u.osVersion || ''}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const totalUsers = users.length;
  const boundDevices = users.filter((u) => !!u.deviceId).length;
  const unboundDevices = totalUsers - boundDevices;
  const lockedUsers = users.filter((u) => (u.failedLoginAttempts && u.failedLoginAttempts > 0) || !!u.lockedUntil).length;

  const canResetDevice = (target: SfaUser): boolean => {
    // System Admins & Owners have authority to reset mobile device bindings for all roles (including OWNER)
    if (role === 'OWNER' || role === 'ADMIN') return true;
    return false;
  };

  const handleOpenAudit = async (u: SfaUser) => {
    setSelectedUser(u);
    setAuditLoading(true);
    try {
      const logs = await onFetchAudit(u.id);
      setAuditLogs(logs || []);
    } catch (e) {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetTargetUser || !onResetDevice) return;
    setIsResetting(true);
    try {
      const res = await onResetDevice(resetTargetUser);
      if (res && res.success) {
        const u = resetTargetUser;
        setResetTargetUser(null);
        setResetDoneMessage(
          `Registered mobile device for "${u.fullName}" (${u.userId}) has been successfully unbound. The user can now log in and bind a new mobile handset on their next login.`
        );
      } else {
        alert(res?.error || 'Failed to reset device');
      }
    } catch (err: unknown) { alert(getErrorMessage(err)); } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Head
        title="Device & Session Management"
        sub="Complete visibility into registered handsets, mobile OS, app versions, and web & mobile login history."
      />

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Users</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{totalUsers}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Bound Handsets</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>📱 {boundDevices}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Unbound / Web Only</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>⚪ {unboundDevices}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: lockedUsers > 0 ? '#ef4444' : '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Security Alerts</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: lockedUsers > 0 ? '#ef4444' : '#0f172a', marginTop: '4px' }}>
            {lockedUsers > 0 ? `⚠️ ${lockedUsers} Locked` : '✅ Clean'}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <input
          placeholder="Search by Employee, User ID, Device Model, OS or Code..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>Employee & User ID</th>
              <th>Role & Division</th>
              <th>Registered Handset Model</th>
              <th>OS & App Version</th>
              <th>Login & Security Status</th>
              <th>Session & Device Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => {
              const hasDevice = !!u.deviceId;
              const deviceModelDisplay = u.deviceModel || u.deviceName || (hasDevice ? 'Mobile Handset Bound' : 'No Mobile Bound');
              const isLocked = !!u.lockedUntil && new Date(u.lockedUntil) > new Date();

              return (
                <tr key={u.id}>
                  <td>
                    <b>{u.fullName}</b>
                    <small>User ID: <code>{u.userId}</code> | Emp: {u.empCode || '-'}</small>
                  </td>
                  <td>
                    <Badge v={u.role} />
                    <small style={{ color: '#0284c7', fontWeight: 500, display: 'block', marginTop: '2px' }}>
                      {getDivisionName(u.divisionId)}
                    </small>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: hasDevice ? '#0f172a' : '#94a3b8' }}>
                      {hasDevice ? '📱 ' : '⚪ '}{deviceModelDisplay}
                    </div>
                    {hasDevice && u.deviceId && (
                      <small style={{ color: '#64748b', fontFamily: 'monospace' }}>
                        UUID: {u.deviceId.length > 14 ? `${u.deviceId.slice(0, 14)}...` : u.deviceId}
                      </small>
                    )}
                    {u.registeredOn && (
                      <small style={{ color: '#94a3b8', display: 'block' }}>
                        Reg: {new Date(u.registeredOn).toLocaleDateString()}
                      </small>
                    )}
                  </td>
                  <td>
                    <div>OS: <b>{u.osVersion || '-'}</b></div>
                    <small style={{ color: '#64748b' }}>App: <b>{u.appVersion || '-'}</b></small>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Badge v={hasDevice ? 'ACTIVE' : 'INACTIVE'} />
                      {u.lastLogin && (
                        <small style={{ color: '#64748b' }}>
                          Last: {new Date(u.lastLogin).toLocaleDateString()}
                        </small>
                      )}
                      {isLocked ? (
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>🔒 Account Locked</span>
                      ) : (u.failedLoginAttempts && u.failedLoginAttempts > 0) ? (
                        <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>⚠️ {u.failedLoginAttempts} Failed Attempts</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="links" style={{ gap: '8px' }}>
                      <button
                        className="link"
                        style={{ color: '#0284c7', fontWeight: 500 }}
                        title="View complete Web and Mobile login activity history"
                        onClick={() => handleOpenAudit(u)}
                      >
                        🌐 Login History
                      </button>
                      {canResetDevice(u) && (
                        <button
                          className="link"
                          style={{ color: '#ef4444', fontWeight: 500 }}
                          title="Unbind registered mobile device so user can log in on a new handset"
                          onClick={() => setResetTargetUser(u)}
                        >
                          📱 Reset Device
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No user records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 1. Login History Modal */}
      {selectedUser && (
        <LoginHistoryModal
          user={selectedUser}
          auditLogs={auditLogs}
          loading={auditLoading}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* 2. Device Reset Confirmation Modal */}
      {resetTargetUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '26px'
            }}>
              📱
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              Reset Mobile Device?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
              Reset registered mobile device for <b>{resetTargetUser.fullName}</b> (<code>{resetTargetUser.userId}</code>)?
              <br /><br />
              The existing mobile device UUID & FCM binding will be removed. The user will be able to log in on a new handset.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="secondary"
                disabled={isResetting}
                onClick={() => setResetTargetUser(null)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                className="primary"
                disabled={isResetting}
                onClick={handleConfirmReset}
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: '#0284c7', borderColor: '#0284c7' }}
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Device Reset Success Modal */}
      {resetDoneMessage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px'
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              Device Reset Successful!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
              {resetDoneMessage}
            </p>
            <button
              className="primary"
              onClick={() => setResetDoneMessage(null)}
              style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', background: '#16a34a', borderColor: '#16a34a' }}
            >
              Done / OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
