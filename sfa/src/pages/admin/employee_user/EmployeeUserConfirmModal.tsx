import React from 'react';
import type { EmployeeUserRecord } from './employeeUser.types';

export type ConfirmActionType = 'DEACTIVATE' | 'ACTIVATE' | 'DELETE' | 'RESET_DEVICE';

interface EmployeeUserConfirmModalProps {
  item: EmployeeUserRecord;
  actionType: ConfirmActionType;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function EmployeeUserConfirmModal({
  item,
  actionType,
  onConfirm,
  onCancel,
}: EmployeeUserConfirmModalProps) {
  const [loading, setLoading] = React.useState(false);

  const getDetails = () => {
    switch (actionType) {
      case 'DEACTIVATE':
        return {
          icon: '🚫',
          title: 'Deactivate Employee & User Access?',
          description: `Are you sure you want to deactivate ${item.fullName || item.firstName} (${item.userId})? They will no longer be able to log in to the SFA mobile application or web portal.`,
          confirmText: 'Deactivate User',
          confirmBg: '#e11d48',
        };
      case 'ACTIVATE':
        return {
          icon: '🟢',
          title: 'Activate Employee & User Access?',
          description: `Restore full operational SFA app login and field reporting access for ${item.fullName || item.firstName} (${item.userId}).`,
          confirmText: 'Activate User',
          confirmBg: '#10b981',
        };
      case 'DELETE':
        return {
          icon: '🗑️',
          title: 'Permanently Delete Record?',
          description: `Warning: This will permanently remove ${item.fullName || item.firstName} (${item.userId}) from both Employee Master and User Database. This action cannot be undone.`,
          confirmText: 'Delete Permanently',
          confirmBg: '#dc2626',
        };
      case 'RESET_DEVICE':
        return {
          icon: '📱',
          title: 'Reset Device Binding?',
          description: `Unbind registered device ID for ${item.fullName || item.firstName} (${item.userId}). They will be required to log in and register from a new device.`,
          confirmText: 'Reset Device',
          confirmBg: '#2563eb',
        };
    }
  };

  const info = getDetails();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 16px auto',
            border: '1px solid #e2e8f0',
          }}
        >
          {info.icon}
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
          {info.title}
        </h3>

        <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
          {info.description}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '9px 22px',
              borderRadius: '8px',
              border: 'none',
              background: info.confirmBg,
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {loading ? 'Processing...' : info.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
