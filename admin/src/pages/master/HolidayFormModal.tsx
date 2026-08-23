import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { Holiday } from '../../domain/master/fieldMaster.types';

export function HolidayFormModal({
  holiday,
  onSave,
  onClose,
}: {
  holiday: Holiday | null;
  onSave: (draft: Partial<Holiday>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const isEditing = !!holiday;

  const [holidayName, setHolidayName] = useState(holiday?.holidayName || '');
  const [date, setDate] = useState(holiday?.date || new Date().toISOString().substring(0, 10));
  const [type, setType] = useState<any>(holiday?.type || 'NATIONAL');
  const [isActive, setIsActive] = useState(holiday ? holiday.isActive : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim()) { setError('Holiday Name is required'); return; }
    if (!date) { setError('Date is required'); return; }

    setSaving(true);
    setError('');

    try {
      const draft: Partial<Holiday> = {
        id: holiday?.id,
        holidayName: holidayName.trim(),
        date,
        type,
        isActive,
      };

      const res = await onSave(draft);
      if (res.success) onClose();
      else setError(res.error || 'Failed to save Holiday record');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? '✏️ Edit Holiday Record' : '📅 Add New Company Holiday'}
            </h3>
            <small style={{ color: '#64748b' }}>Configure official company holiday calendar.</small>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <TextField
              label="Holiday Festival / Occasion Name *"
              value={holidayName}
              onChange={setHolidayName}
              placeholder="e.g. Diwali / Independence Day"
            />
            <TextField
              label="Date *"
              type="date"
              value={date}
              onChange={setDate}
            />
            <SelectField
              label="Holiday Type *"
              value={type}
              onChange={(v) => setType(v as any)}
              options={[
                { v: 'NATIONAL', l: '🇮🇳 NATIONAL HOLIDAY' },
                { v: 'STATE', l: '📍 STATE HOLIDAY' },
                { v: 'RESTRICTED', l: '⭐ RESTRICTED HOLIDAY' },
              ]}
            />
            <SelectField
              label="Status *"
              value={isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={(v) => setIsActive(v === 'ACTIVE')}
              options={[
                { v: 'ACTIVE', l: 'ACTIVE' },
                { v: 'INACTIVE', l: 'INACTIVE' },
              ]}
            />

            {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>⚠️ {error}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="secondary" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving} style={{ flex: 1, background: '#d97706', borderColor: '#d97706' }}>
              {saving ? 'Saving...' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
