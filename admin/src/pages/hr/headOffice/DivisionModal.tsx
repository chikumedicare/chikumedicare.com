import React, { useState, useEffect } from 'react';
import { Head } from '../../../components/Head';
import { Section } from '../../../components/Section';
import { TextField, SelectField } from '../../../components/FormFields';
import type { Division } from '../../../domain/hr/headOffice.types';

interface DivisionModalProps {
  item: Division | null;
  onSave: (draft: Partial<Division>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function DivisionModal({ item, onSave, onClose }: DivisionModalProps) {
  const [code, setCode] = useState(item?.code || '');
  const [name, setName] = useState(item?.name || '');
  const [headUserName, setHeadUserName] = useState(item?.headUserName || '');
  const [displayOrder, setDisplayOrder] = useState(String(item?.displayOrder || 0));
  const [description, setDescription] = useState(item?.description || '');
  const [isActive, setIsActive] = useState(item ? (item.isActive ? 'ACTIVE' : 'INACTIVE') : 'ACTIVE');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setCode(item.code || '');
      setName(item.name || '');
      setHeadUserName(item.headUserName || '');
      setDisplayOrder(String(item.displayOrder || 0));
      setDescription(item.description || '');
      setIsActive(item.isActive ? 'ACTIVE' : 'INACTIVE');
    } else {
      setCode('');
      setName('');
      setHeadUserName('');
      setDisplayOrder('0');
      setDescription('');
      setIsActive('ACTIVE');
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Division Name is required');
      return;
    }

    setSaving(true);
    setError('');

    const draft: Partial<Division> = {
      ...(item?.id ? { id: item.id, code: item.code } : {}),
      name: name.trim(),
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head
        title={item ? `Edit Division: ${item.name} (${item.code})` : 'Add Marketing Division'}
        sub="Strategic Business Unit (SBU) Configuration"
      />

      <div className="formGrid">
        <Section title="1. Division Identity & Structure">
          {!item ? (
            <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: '#166534' }}>
              ⚡ <b>Automatic Unique Code:</b> Permanent division code <code>DIV## (e.g. DIV01, DIV02)</code> is auto-allocated.
            </div>
          ) : (
            <div style={{ marginBottom: '14px' }}>
              <TextField label="Division Code (Immutable)" value={code} disabled />
            </div>
          )}

          <div className="two">
            <TextField
              label="Division Name *"
              value={name}
              onChange={(v) => { setName(v); setError(''); }}
              placeholder="e.g. General Healthcare, Cardio-Diabetic, Derma Care"
            />
            <TextField
              label="Division Head / Lead Name"
              value={headUserName}
              onChange={setHeadUserName}
              placeholder="e.g. Dr. Rajesh Sharma (VP / NSM)"
            />
          </div>

          <div className="two" style={{ marginTop: '12px' }}>
            <TextField
              label="Display Sequence Order"
              value={displayOrder}
              onChange={setDisplayOrder}
              type="number"
              placeholder="e.g. 1"
            />
            <SelectField
              label="Operational Status"
              value={isActive}
              onChange={setIsActive}
              options={[
                { v: 'ACTIVE', l: 'ACTIVE (Marketing & Sales Active)' },
                { v: 'INACTIVE', l: 'INACTIVE (Disabled / Retired)' },
              ]}
            />
          </div>
        </Section>

        <Section title="2. Therapeutic Portfolio & Scope">
          <TextField
            label="Therapeutic Segment & Product Line Description"
            value={description}
            onChange={setDescription}
            placeholder="e.g. Focuses on antibiotics, analgesics, multivitamins, and respiratory products."
          />
          {error && <small style={{ color: '#ef4444', display: 'block', marginTop: '8px' }}>⚠️ {error}</small>}
        </Section>
      </div>

      <div className="actions">
        <button className="secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving to Database...' : item ? 'Save Division Changes' : 'Create Division'}
        </button>
      </div>
    </>
  );
}
