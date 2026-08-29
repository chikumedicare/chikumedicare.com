import React, { useState, useEffect } from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { HeadOfficeRecord } from '../../../core/domain/hr/headOfficeTerritory.types';

interface HeadOfficeFormModalProps {
  item: HeadOfficeRecord | null;
  onSave: (draft: Partial<HeadOfficeRecord>) => Promise<{ success: boolean; error?: string }>;
  back: () => void;
}

export function HeadOfficeFormModal({ item, onSave, back }: HeadOfficeFormModalProps) {
  const [code, setCode] = useState(item?.code || '');
  const [name, setName] = useState(item?.name || '');
  const [city, setCity] = useState(item?.city || '');
  const [state, setState] = useState(item?.state || '');
  const [address, setAddress] = useState(item?.address || '');
  const [pincode, setPincode] = useState(item?.pincode || '');
  const [contactPerson, setContactPerson] = useState(item?.contact_person || '');
  const [contactPhone, setContactPhone] = useState(item?.contact_phone || '');
  const [isActive, setIsActive] = useState<string>(item?.is_active ? 'ACTIVE' : 'ACTIVE');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setCode(item.code || '');
      setName(item.name || '');
      setCity(item.city || '');
      setState(item.state || '');
      setAddress(item.address || '');
      setPincode(item.pincode || '');
      setContactPerson(item.contact_person || '');
      setContactPhone(item.contact_phone || '');
      setIsActive(item.is_active ? 'ACTIVE' : 'INACTIVE');
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Head Office Name is required');
      return;
    }

    setSaving(true);
    setError('');

    const draft: Partial<HeadOfficeRecord> = {
      ...(item?.id ? { id: item.id } : {}),
      code: code.trim() || undefined,
      name: name.trim(),
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      address: address.trim() || undefined,
      pincode: pincode.trim() || undefined,
      contact_person: contactPerson.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
      is_active: isActive === 'ACTIVE',
    };

    try {
      const res = await onSave(draft);
      if (res.success) {
        back();
      } else if (res.error) {
        setError(res.error);
      }
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
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '14px',
            marginBottom: '16px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              🏢 {item ? 'Edit Head Office' : 'Create New Head Office (HO)'}
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Apex Corporate HQ for Admin & Owner (separate from field geography)
            </p>
          </div>
          <button
            type="button"
            onClick={back}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#dc2626',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <TextField
            label="Head Office Name *"
            placeholder="e.g. Chiku Medicare Corporate Super HQ"
            value={name}
            onChange={(v) => { setName(v); setError(''); }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TextField
              label="City"
              placeholder="e.g. Gorakhpur"
              value={city}
              onChange={(v) => setCity(v)}
            />
            <TextField
              label="State"
              placeholder="e.g. Uttar Pradesh"
              value={state}
              onChange={(v) => setState(v)}
            />
          </div>

          <TextField
            label="Office Address"
            placeholder="e.g. Medical College Road, Commercial Hub"
            value={address}
            onChange={(v) => setAddress(v)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TextField
              label="Pincode"
              placeholder="e.g. 273001"
              value={pincode}
              onChange={(v) => setPincode(v)}
            />
            <TextField
              label="HO Code"
              placeholder="Auto-generated if blank (e.g. HO001)"
              value={code}
              onChange={(v) => setCode(v)}
              disabled={!!item}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TextField
              label="Contact Person (Optional)"
              placeholder="e.g. Executive Director"
              value={contactPerson}
              onChange={(v) => setContactPerson(v)}
            />
            <TextField
              label="Contact Phone (Optional)"
              placeholder="e.g. +91 9876543210"
              value={contactPhone}
              onChange={(v) => setContactPhone(v)}
            />
          </div>

          <SelectField
            label="Status *"
            value={isActive}
            onChange={(v) => setIsActive(v)}
            options={[
              { v: 'ACTIVE', l: '🟢 Active & Functional' },
              { v: 'INACTIVE', l: '🔴 Inactive' },
            ]}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '14px',
              borderTop: '1px solid #e2e8f0',
              marginTop: '6px',
            }}
          >
            <button
              type="button"
              onClick={back}
              disabled={saving}
              style={{
                padding: '8px 16px',
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
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              {saving ? 'Saving...' : item ? 'Update Head Office' : 'Save Head Office'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
