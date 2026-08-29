import React, { useState, useEffect } from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { getErrorMessage } from '../../../utils/dataIntegrity';

export interface DivisionModalProps {
  division?: Division | null;
  item?: Division | null;
  onSave: (draft: Partial<Division>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function DivisionModal({ division, item, onSave, onClose }: DivisionModalProps) {
  const current = division || item || null;
  const { headOffices } = useGeographyStore();
  const defaultHoId = headOffices.length > 0 ? headOffices[0].id : '';

  const [code, setCode] = useState(current?.code || '');
  const [name, setName] = useState(current?.name || '');
  const [headOfficeId, setHeadOfficeId] = useState(current?.headOfficeId || defaultHoId);
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
      setHeadOfficeId(current.headOfficeId || defaultHoId);
      setHeadUserName(current.headUserName || '');
      setDisplayOrder(String(current.displayOrder || 0));
      setDescription(current.description || '');
      setIsActive(current.isActive ? 'ACTIVE' : 'INACTIVE');
    } else {
      setCode('');
      setName('');
      setHeadOfficeId(defaultHoId);
      setHeadUserName('');
      setDisplayOrder('0');
      setDescription('');
      setIsActive('ACTIVE');
    }
  }, [current, defaultHoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Division Name is required');
      return;
    }

    setSaving(true);
    setError('');

    const draft: Partial<Division> = {
      ...(current?.id ? { id: current.id, code: current.code } : {}),
      name: name.trim(),
      headOfficeId: headOfficeId || undefined,
      headUserName: headUserName.trim() || undefined,
      displayOrder: Number(displayOrder) || 0,
      description: description.trim() || undefined,
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

  const hoOptions = headOffices.map((ho) => ({
    v: ho.id,
    l: `🏢 ${ho.name} (${ho.city}, ${ho.state || ''})`,
  }));

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
        {/* Header */}
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
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {current ? `Edit Division: ${current.name}` : '➕ Add Marketing Division'}
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Strategic Business Unit (SBU) Configuration under Corporate Head Office
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '18px',
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section 1: Parent Head Office Governance */}
            <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0369a1', marginBottom: '8px' }}>
                🏢 Parent Corporate Head Office (HO)
              </div>
              {hoOptions.length > 0 ? (
                <SelectField
                  label="Governing Head Office *"
                  value={headOfficeId}
                  onChange={setHeadOfficeId}
                  options={hoOptions}
                />
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  🏢 CHIKU MEDICARE PRIVATE LIMITED (Corporate Apex HQ)
                </div>
              )}
            </div>

            {!current ? (
              <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12.5px', color: '#166534' }}>
                ℹ️ <b>Automatic Code:</b> Unique division code <code>DIV-##</code> is auto-allocated upon creation.
              </div>
            ) : (
              <TextField label="Division Code (Immutable)" value={code} disabled />
            )}

            <TextField
              label="Division Name *"
              value={name}
              onChange={(v) => { setName(v); setError(''); }}
              placeholder="e.g. Chiku Healthcare, Chiku Pharma, Cardio-Diabetic"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextField
                label="Division Lead / Head (VP / NSM)"
                value={headUserName}
                onChange={setHeadUserName}
                placeholder="e.g. Dr. Rajesh Sharma"
              />
              <TextField
                label="Display Sequence Order"
                value={displayOrder}
                onChange={setDisplayOrder}
                placeholder="e.g. 1"
                type="number"
              />
            </div>

            <SelectField
              label="Operational Status *"
              value={isActive}
              onChange={setIsActive}
              options={[
                { v: 'ACTIVE', l: '🟢 Active & Functional' },
                { v: 'INACTIVE', l: '🔴 Inactive / Disabled' },
              ]}
            />

            <TextField
              label="Therapeutic Segment & Product Portfolio"
              value={description}
              onChange={setDescription}
              placeholder="e.g. General pharmaceuticals, antibiotics, analgesics, multivitamins"
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '9px 18px',
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
              type="submit"
              disabled={saving}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              {saving ? 'Saving...' : current ? 'Update Division' : 'Create Division'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
