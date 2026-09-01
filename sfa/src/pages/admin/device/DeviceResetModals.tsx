import React from 'react';
import type { SfaUser } from '../../../core/domain/hr/user.types';

interface DeviceResetModalsProps {
  resetTargetUser: SfaUser | null;
  isResetting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  resetDoneMessage: string | null;
  onCloseDone: () => void;
}

export function DeviceResetModals({
  resetTargetUser,
  isResetting,
  onCancel,
  onConfirm,
  resetDoneMessage,
  onCloseDone,
}: DeviceResetModalsProps) {
  return (
    <>
      {/* 1. Device Reset Confirmation Modal */}
      {resetTargetUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '24px',
              }}
            >
              📱
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
              Reset Mobile Device?
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Reset registered mobile device for <b>{resetTargetUser.fullName}</b> (<code>{resetTargetUser.userId}</code>)?
              <br />
              <br />
              The existing mobile device UUID & FCM token will be unbound so the user can log in on a new handset.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="secondary"
                disabled={isResetting}
                onClick={onCancel}
                style={{ flex: 1, padding: '9px 16px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                disabled={isResetting}
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#0284c7',
                  borderColor: '#0284c7',
                }}
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Device Reset Success Modal */}
      {resetDoneMessage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '26px',
              }}
            >
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
              Device Reset Successful!
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              {resetDoneMessage}
            </p>
            <button
              type="button"
              className="primary"
              onClick={onCloseDone}
              style={{
                width: '100%',
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#16a34a',
                borderColor: '#16a34a',
              }}
            >
              Done / OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
