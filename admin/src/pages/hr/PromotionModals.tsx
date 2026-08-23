import React from 'react';
import { Badge } from '../../components/Badge';
import type { SfaUser, SfaRole } from '../../domain/hr/user.types';

export function PromotionConfirmModal({
  user,
  actionType,
  targetRole,
  designation,
  effectiveDate,
  executing,
  onConfirm,
  onCancel,
}: {
  user: SfaUser;
  actionType: 'PROMOTION' | 'DEMOTION';
  targetRole: SfaRole;
  designation: string;
  effectiveDate: string;
  executing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: actionType === 'PROMOTION' ? '#dcfce7' : '#fee2e2', color: actionType === 'PROMOTION' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '22px' }}>
          🎖️
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a', textAlign: 'center' }}>
          Confirm {actionType === 'PROMOTION' ? 'Promotion' : 'Demotion'}
        </h3>
        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', margin: '14px 0', border: '1px solid #e2e8f0', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b' }}>Employee:</span>
            <b>{user.fullName} ({user.userId})</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b' }}>Role Transition:</span>
            <div>
              <Badge v={user.role} /> ➔ <Badge v={targetRole} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b' }}>New Designation:</span>
            <b>{designation}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Effective Date:</span>
            <b>{effectiveDate}</b>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button className="secondary" disabled={executing} onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="primary" disabled={executing} onClick={onConfirm} style={{ flex: 1, background: actionType === 'PROMOTION' ? '#16a34a' : '#dc2626', borderColor: actionType === 'PROMOTION' ? '#16a34a' : '#dc2626' }}>
            {executing ? 'Committing...' : 'Commit Role Transition'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PromotionDoneModal({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px' }}>
          ✓
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
          Role Transition Committed!
        </h3>
        <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
          {message}
        </p>
        <button className="primary" onClick={onDone} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#16a34a', borderColor: '#16a34a' }}>
          Done / Return to Users
        </button>
      </div>
    </div>
  );
}
