import { getErrorMessage } from '../../../utils/dataIntegrity';
import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../../components/Badge';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import type { LoginAudit } from '../../../core/domain/hr/lifecycle.types';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../../store/hr/useAuthSessionStore';
import { useHrStore } from '../../../store/hr/useHrStore';
import { CloudflareUserGateway } from '../../../infrastructure/providers/cloudflare/CloudflareUserGateway';
import { LoginHistoryModal } from '../user/LoginHistoryModal';
import { DeviceResetModals } from './DeviceResetModals';

export function DeviceManagement({
  users: propUsers,
  onResetDevice,
  onFetchAudit,
  onUnlockUser,
}: {
  users?: SfaUser[];
  onResetDevice?: (u: SfaUser) => Promise<{ success: boolean; error?: string }>;
  onFetchAudit?: (userId: string) => Promise<LoginAudit[]>;
  onUnlockUser?: (userId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const userGateway = useMemo(() => new CloudflareUserGateway(), []);
  const { users: storeUsers, refresh: refreshHr } = useHrStore();
  const { divisions, refresh: refreshHo } = useHeadOfficeStore();
  const { role } = useAuthSessionStore();

  const users = propUsers || storeUsers;

  const [q, setQ] = useState('');
  const [selectedUser, setSelectedUser] = useState<SfaUser | null>(null);
  const [auditLogs, setAuditLogs] = useState<LoginAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Reset Modals
  const [resetTargetUser, setResetTargetUser] = useState<SfaUser | null>(null);
  const [resetDoneMessage, setResetDoneMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    refreshHr(true);
    refreshHo(true);
  }, [refreshHr, refreshHo]);

  const getDivisionName = (divId?: string) => {
    if (!divId) return '-';
    return divisions.find((d) => d.id === divId)?.name || divId;
  };

  const list = users.filter((u) => `${u.fullName} ${u.userId} ${u.empCode} ${u.deviceModel || ''} ${u.deviceName || ''} ${u.osVersion || ''}`.toLowerCase().includes(q.toLowerCase()));

  const totalUsers = users.length;
  const boundDevices = users.filter((u) => !!u.deviceId).length;
  const unboundDevices = totalUsers - boundDevices;
  const lockedUsers = users.filter((u) => (u.failedLoginAttempts && u.failedLoginAttempts > 0) || !!u.lockedUntil).length;

  const canResetDevice = (target: SfaUser): boolean => role === 'OWNER' || role === 'ADMIN';

  const handleOpenAudit = async (u: SfaUser) => {
    setSelectedUser(u);
    setAuditLoading(true);
    try {
      if (onFetchAudit) {
        const logs = await onFetchAudit(u.id);
        setAuditLogs(logs || []);
      } else {
        const logs = await userGateway.getUserLoginAudit(u.id);
        setAuditLogs(logs || []);
      }
    } catch (e) {
      setAuditLogs([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetTargetUser) return;
    setIsResetting(true);
    try {
      if (onResetDevice) {
        const res = await onResetDevice(resetTargetUser);
        if (res && res.success) {
          const u = resetTargetUser;
          setResetTargetUser(null);
          setResetDoneMessage(
            `Registered mobile device for "${u.fullName}" (${u.userId}) has been successfully unbound. The user can now log in and bind a new mobile handset on their next login.`
          );
          await refreshHr(true);
        } else {
          alert(`Failed to reset device: ${res?.error || 'Unknown error'}`);
        }
      } else {
        await userGateway.resetDevice(resetTargetUser.id);
        const u = resetTargetUser;
        setResetTargetUser(null);
        setResetDoneMessage(`Registered mobile device for "${u.fullName}" (${u.userId}) has been successfully unbound. The user can now log in on a new handset.`);
        await refreshHr(true);
      }
    } catch (err: unknown) {
      alert(`Error resetting device: ${getErrorMessage(err)}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleUnlock = async (u: SfaUser) => {
    if (!window.confirm(`Unlock account for ${u.fullName} (${u.userId})?`)) return;
    try {
      if (onUnlockUser) {
        await onUnlockUser(u.id);
      } else {
        await userGateway.unlockAccount(u.id);
      }
      await refreshHr(true);
      alert(`Account for ${u.fullName} has been unlocked successfully!`);
    } catch (err: unknown) {
      alert(`Failed to unlock user: ${getErrorMessage(err)}`);
    }
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Compact Header: Title + Inline Metrics */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📱</span>
            <span>Device & Session Management</span>
          </h2>

          {/* Inline Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ padding: '3px 8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
              👥 {totalUsers} Users
            </span>
            <span style={{ padding: '3px 8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
              📱 {boundDevices} Mobile Bound
            </span>
            <span style={{ padding: '3px 8px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
              ⚪ {unboundDevices} Unbound
            </span>
            {lockedUsers > 0 && (
              <span style={{ padding: '3px 8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
                🔒 {lockedUsers} Locked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Single-Row Search Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '10px',
        }}
      >
        <input
          placeholder="Search representative name, user ID, emp code, device model, or OS..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
          }}
        />
      </div>

      {/* High-Density Device Table */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Representative & Code</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Role & Division</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Bound Mobile Device</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Device Specs</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Security Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => {
              const hasDevice = !!u.deviceId;
              const deviceModelDisplay = u.deviceModel || u.deviceName || (hasDevice ? 'Mobile Handset Bound' : 'No Mobile Bound');
              const isLocked = !!u.lockedUntil && new Date(u.lockedUntil) > new Date();

              return (
                <tr
                  key={u.id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.12s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <b style={{ color: '#0f172a' }}>{u.fullName}</b>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>
                      <code>{u.userId}</code> {u.empCode ? `• ${u.empCode}` : ''}
                    </small>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <Badge v={u.role} />
                    <small style={{ color: '#0284c7', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                      {getDivisionName(u.divisionId)}
                    </small>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ fontWeight: 600, color: hasDevice ? '#0f172a' : '#94a3b8' }}>
                      {hasDevice ? '📱 ' : '⚪ '}{deviceModelDisplay}
                    </div>
                    {hasDevice && u.deviceId && (
                      <small style={{ color: '#64748b', fontFamily: 'monospace', display: 'block', fontSize: '10.5px' }}>
                        UUID: {u.deviceId.length > 14 ? `${u.deviceId.slice(0, 14)}...` : u.deviceId}
                      </small>
                    )}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div>OS: <b>{u.osVersion || '-'}</b></div>
                    <small style={{ color: '#64748b' }}>App: <b>{u.appVersion || '-'}</b></small>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <Badge v={hasDevice ? 'ACTIVE' : 'INACTIVE'} />
                      {isLocked ? (
                        <span style={{ fontSize: '10.5px', color: '#ef4444', fontWeight: 700 }}>🔒 Account Locked</span>
                      ) : (u.failedLoginAttempts && u.failedLoginAttempts > 0) ? (
                        <span style={{ fontSize: '10.5px', color: '#f59e0b', fontWeight: 700 }}>⚠️ {u.failedLoginAttempts} Failed Attempts</span>
                      ) : null}
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenAudit(u)}
                        style={{
                          padding: '3px 8px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          color: '#0284c7',
                        }}
                      >
                        🌐 History
                      </button>

                      {isLocked && (
                        <button
                          type="button"
                          onClick={() => handleUnlock(u)}
                          style={{
                            padding: '3px 8px',
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            color: '#16a34a',
                          }}
                        >
                          🔓 Unlock
                        </button>
                      )}

                      {canResetDevice(u) && hasDevice && (
                        <button
                          type="button"
                          onClick={() => setResetTargetUser(u)}
                          style={{
                            padding: '3px 8px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '11.5px',
                            cursor: 'pointer',
                            color: '#dc2626',
                          }}
                        >
                          📱 Reset
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

      {/* 2. Device Reset Modals */}
      <DeviceResetModals
        resetTargetUser={resetTargetUser}
        isResetting={isResetting}
        onCancel={() => setResetTargetUser(null)}
        onConfirm={handleConfirmReset}
        resetDoneMessage={resetDoneMessage}
        onCloseDone={() => setResetDoneMessage(null)}
      />
    </div>
  );
}
