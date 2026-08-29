import React from 'react';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';
import type { TerritoryItem } from './GeographyTable';

interface DeactivateConfirmModalProps {
  type: TerritoryType;
  item: TerritoryItem | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DeactivateConfirmModal({
  type,
  item,
  onConfirm,
  onCancel,
  loading = false,
}: DeactivateConfirmModalProps) {
  if (!item) return null;

  const typeLabels: Record<TerritoryType, string> = {
    HO: 'Head Office',
    Zone: 'Zone',
    State: 'State',
    HQ: 'Field Headquarter',
    Area: 'Area',
    Beat: 'Beat / Route',
  };

  const entityName = item.name || 'this record';
  const entityCode = item.code ? ` (${item.code})` : '';

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
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#991b1b' }}>
              Deactivate {typeLabels[type]}?
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              This operational change affects linked operations
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#881337',
            lineHeight: 1.5,
            marginBottom: '20px',
          }}
        >
          Are you sure you want to deactivate <b>{entityName}{entityCode}</b>?
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#9f1239' }}>
            Field force personnel, subordinate hierarchies, and daily reporting mapped to this {typeLabels[type].toLowerCase()} will be marked inactive.
          </div>
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
              background: loading ? '#fda4af' : '#e11d48',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
            }}
          >
            {loading ? 'Deactivating...' : '🔴 Yes, Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}
