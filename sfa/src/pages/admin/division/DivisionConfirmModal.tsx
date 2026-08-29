import React from 'react';
import type { Division } from '../../../core/domain/hr/headOffice.types';

export type DivisionConfirmAction = 'DEACTIVATE' | 'DELETE';

interface DivisionConfirmModalProps {
  action: DivisionConfirmAction;
  division: Division | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DivisionConfirmModal({
  action,
  division,
  loading = false,
  onConfirm,
  onCancel,
}: DivisionConfirmModalProps) {
  if (!division) return null;

  const isDelete = action === 'DELETE';
  const title = isDelete ? 'Delete Division?' : 'Deactivate Division?';
  const icon = isDelete ? '🗑️' : '⚠️';
  const confirmBtnText = isDelete
    ? (loading ? 'Deleting...' : '🗑️ Yes, Delete')
    : (loading ? 'Deactivating...' : '🔴 Yes, Deactivate');

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
        zIndex: 10000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isDelete ? '#fef2f2' : '#fffbeb',
              border: `1px solid ${isDelete ? '#fee2e2' : '#fef3c7'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: isDelete ? '#991b1b' : '#92400e' }}>
              {title}
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Corporate Business Unit & Portfolio Status
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            background: isDelete ? '#fff1f2' : '#fefce8',
            border: `1px solid ${isDelete ? '#fecdd3' : '#fef08a'}`,
            borderRadius: '10px',
            fontSize: '13px',
            color: isDelete ? '#881337' : '#713f12',
            lineHeight: 1.5,
            marginBottom: '20px',
          }}
        >
          {isDelete ? (
            <>
              Are you sure you want to permanently delete division <b>{division.name} ({division.code})</b>?
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#9f1239' }}>
                ⚠️ Linked master data or field representatives associated with this division may become unlinked.
              </div>
            </>
          ) : (
            <>
              Are you sure you want to deactivate division <b>{division.name} ({division.code})</b>?
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#854d0e' }}>
                Field operations, targets, and product mappings under this division will be marked inactive.
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '8px 18px',
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
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isDelete
                ? (loading ? '#fda4af' : '#dc2626')
                : (loading ? '#fcd34d' : '#d97706'),
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: isDelete
                ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                : '0 4px 12px rgba(217, 119, 6, 0.3)',
            }}
          >
            {confirmBtnText}
          </button>
        </div>
      </div>
    </div>
  );
}
