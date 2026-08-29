import React, { useState, useEffect } from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import { getErrorMessage } from '../../../utils/dataIntegrity';

export interface DivisionModalProps {
  division?: Division | null;
  item?: Division | null;
  onSave: (draft: Partial<Division>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function DivisionModal({ division, item, onSave, onClose }: DivisionModalProps) {
  const current = division || item || null;
  const [code, setCode] = useState(current?.code || '');
  const [name, setName] = useState(current?.name || '');
  const [headUserName, setHeadUserName] = useState(current?.headUserName || '');
  const [displayOrder, setDisplayOrder] = useState(String(current?.displayOrder || 0));
  const [description, setDescription] = useState(current?.description || '');
  const [isActive, setIsActive] = useState(current ? (current.isActive ? 'ACTIVE' : 'INACTIVE') : 'ACTIVE');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (current) {
      setCode(current.code || '');
      setName(current.name || '');
      setHeadUserName(current.headUserName || '');
      setDisplayOrder(String(current.displayOrder || 0));
      setDescription(current.description || '');
      setIsActive(current.isActive ? 'ACTIVE' : 'INACTIVE');
    } else {
      setCode('');
      setName('');
      setHeadUserName('');
      setDisplayOrder('0');
      setDescription('');
      setIsActive('ACTIVE');
    }
  }, [current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const draft: Partial<Division> = {
      ...(current?.id ? { id: current.id, code: current.code } : {}),
      name: name?.trim() || current?.name || 'Marketing Division',
      headUserName: headUserName || undefined,
      displayOrder: Number(displayOrder) || 0,
      description: description || undefined,
      isActive: isActive === 'ACTIVE',
    };

    try {
      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

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
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            marginBottom: '20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {current ? 'Edit Division: ' + current.name : '➕ Add Marketing Division'}
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Strategic Business Unit (SBU) Configuration & Portfolio
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!current ? (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#166534' }}>
                ℹ️ <b>Automatic Code:</b> Permanent division code <code>DIV##</code> is auto-allocated upon creation.
              </div>
            ) : (
              <TextField label="Division Code" value={code} onChange={setCode} />
            )}

            <TextField
              label="Division Name"
              value={name}
              onChange={(v) => { setName(v); setError(''); }}
              placeholder="e.g. General Healthcare, Cardio-Diabetic"
            />

            <TextField
              label="Division Lead / Head Name"
              value={headUserName}
              onChange={setHeadUserName}
              placeholder="e.g. Dr. Rajesh Sharma"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextField
                label="Display Sequence Order"
                value={displayOrder}
                onChange={setDisplayOrder}
                placeholder="e.g. 1"
              />
              <SelectField
                label="Operational Status"
                value={isActive}
                onChange={setIsActive}
                options={[
                  { v: 'ACTIVE', l: '🟢 ACTIVE (Marketing Active)' },
                  { v: 'INACTIVE', l: '🔴 INACTIVE (Disabled)' },
                ]}
              />
            </div>

            <TextField
              label="Therapeutic Segment & Product Portfolio"
              value={description}
              onChange={setDescription}
              placeholder="e.g. Focuses on antibiotics, analgesics, multivitamins"
            />

            {error && (
              <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="secondary"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '9px 20px', fontSize: '13px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary"
              disabled={saving}
              style={{ padding: '9px 24px', fontSize: '13px', fontWeight: 700, background: '#0284c7', borderColor: '#0284c7' }}
            >
              {saving ? 'Saving...' : current ? 'Save Division Changes' : 'Create Division'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
