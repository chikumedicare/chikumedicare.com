import React from 'react';
import { Badge } from '../../../components/Badge';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { getUpwardChain } from './RoleHierarchy';

export function HierarchyChainInspectorModal({
  user,
  allUsers,
  onClose,
  onAssignManager,
}: {
  user: SfaUser;
  allUsers: SfaUser[];
  onClose: () => void;
  onAssignManager: (u: SfaUser) => void;
}) {
  const { getHqName } = useGeographyStore();

  const upwardChain = getUpwardChain(user, allUsers);
  const directSubordinates = allUsers.filter((u) => u.reportsToId === user.id && u.id !== user.id);
  const isApexUser = user.role === 'OWNER' || user.role === 'ADMIN';

  // Apex Governance Leads
  const ownerUser = allUsers.find((u) => u.role === 'OWNER');
  const adminUser = allUsers.find((u) => u.role === 'ADMIN');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              👁️ Hierarchy Chain Inspector
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Multi-Level Escalation Line & Subordinate Team for <b>{user.fullName}</b>
            </p>
          </div>
          <button type="button" className="secondary" onClick={onClose} style={{ padding: '4px 10px', fontSize: '12px' }}>
            ✕
          </button>
        </div>

        {/* User Card */}
        <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: isApexUser ? '#f59e0b' : '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
            {isApexUser ? '👑' : user.fullName.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <b style={{ fontSize: '16px', color: '#0f172a' }}>{user.fullName}</b>
              <Badge v={user.role} />
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Code: <code>{user.empCode || user.userId}</code> • HQ: <b>{getHqName(user.hqId) || 'Head Office'}</b>
            </div>
          </div>
          {!isApexUser && (
            <button
              type="button"
              className="primary"
              onClick={() => {
                onClose();
                onAssignManager(user);
              }}
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
            >
              ⚡ Change Manager
            </button>
          )}
        </div>

        {/* 1. Upward Approval Chain */}
        <div style={{ marginTop: '20px' }}>
          <b style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
            ⬆️ Upward Escalation & Reporting Chain:
          </b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Level 1: Target User */}
            <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b>1. {user.fullName}</b> <small>({user.role} - Target User)</small>
              </div>
              <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Level 1 Target</span>
            </div>

            {/* Intermediary Assigned Managers */}
            {upwardChain.map((mgr, idx) => (
              <div key={mgr.id} style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b>{idx + 2}. {mgr.fullName}</b> <small>({mgr.role} • Code: <code>{mgr.empCode || mgr.userId}</code>)</small>
                </div>
                <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Level {idx + 2} Supervisor</span>
              </div>
            ))}

            {/* Apex Level 1 Authority: Owner & Admin */}
            <div style={{ padding: '12px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <b style={{ color: '#92400e' }}>👑 Top Apex Governance Board:</b>
                <div style={{ fontSize: '12px', color: '#78350f', marginTop: '2px' }}>
                  {ownerUser ? `👑 ${ownerUser.fullName} (${ownerUser.userId})` : '👑 Company Owner'} & {adminUser ? `🛡️ ${adminUser.fullName} (${adminUser.userId})` : '🛡️ System Admin'}
                </div>
              </div>
              <span style={{ fontSize: '11px', background: '#f59e0b', color: '#ffffff', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>Dual Apex Authority</span>
            </div>
          </div>
        </div>

        {/* 2. Downward Subordinate Team */}
        <div style={{ marginTop: '24px' }}>
          <b style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
            ⬇️ Direct Downward Reporting Subordinates ({directSubordinates.length}):
          </b>
          {directSubordinates.length === 0 ? (
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
              No direct subordinates currently reporting to {user.fullName}.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {directSubordinates.map((sub) => (
                <div key={sub.id} style={{ padding: '10px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b>{sub.fullName}</b>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{sub.role} • HQ: {getHqName(sub.hqId)}</div>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      onClose();
                      onAssignManager(sub);
                    }}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                  >
                    Change Boss
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="primary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
