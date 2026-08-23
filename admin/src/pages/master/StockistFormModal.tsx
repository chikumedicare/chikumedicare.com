import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { Stockist } from '../../domain/master/fieldMaster.types';

export function StockistFormModal({
  stockist,
  hqs = [],
  areas = [],
  onSave,
  onClose,
}: {
  stockist: Stockist | null;
  hqs?: any[];
  areas?: any[];
  onSave: (draft: Partial<Stockist>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const isEditing = !!stockist;

  const [stockistName, setStockistName] = useState(stockist?.stockistName || '');
  const [contactPerson, setContactPerson] = useState(stockist?.contactPerson || '');
  const [hqId, setHqId] = useState(stockist?.hqId || hqs[0]?.id || '');
  const [areaId, setAreaId] = useState(stockist?.areaId || areas[0]?.id || '');
  const [address, setAddress] = useState(stockist?.address || '');
  const [city, setCity] = useState(stockist?.city || 'Bhopal');
  const [mobile, setMobile] = useState(stockist?.mobile || '');
  const [dl20b, setDl20b] = useState(stockist?.dl20b || '');
  const [dl21b, setDl21b] = useState(stockist?.dl21b || '');
  const [gstin, setGstin] = useState(stockist?.gstin || '');
  const [isActive, setIsActive] = useState(stockist ? stockist.isActive : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockistName.trim()) { setError('Stockist Firm Name is required'); return; }
    if (!hqId) { setError('Please select HQ'); return; }

    setSaving(true);
    setError('');

    try {
      const hqObj = hqs.find((h) => h.id === hqId);
      const areaObj = areas.find((a) => a.id === areaId);

      const draft: Partial<Stockist> = {
        id: stockist?.id,
        stockistName: stockistName.trim(),
        contactPerson: contactPerson.trim(),
        hqId,
        hqName: hqObj ? (hqObj.name || hqObj.hq_name) : hqId,
        areaId,
        areaName: areaObj ? (areaObj.name || areaObj.area_name) : areaId,
        address,
        city,
        mobile,
        dl20b,
        dl21b,
        gstin,
        isActive,
      };

      const res = await onSave(draft);
      if (res.success) onClose();
      else setError(res.error || 'Failed to save Stockist record');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? '✏️ Edit Stockist Master Record' : '🏬 Add New Stockist Distributor'}
            </h3>
            <small style={{ color: '#64748b' }}>Configure Wholesale Stockist distributor and DL 20B/21B details.</small>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <TextField
              label="Stockist Firm Name *"
              value={stockistName}
              onChange={setStockistName}
              placeholder="e.g. M/S Anand Pharma Distributors"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TextField
                label="Contact Person / Manager"
                value={contactPerson}
                onChange={setContactPerson}
                placeholder="e.g. Shri G. Anand"
              />
              <SelectField
                label="Base HQ *"
                value={hqId}
                onChange={setHqId}
                options={hqs.map((h) => ({ v: h.id, l: `📍 ${h.name || h.hq_name}` }))}
              />
            </div>

            <TextField
              label="Distributor Office Address"
              value={address}
              onChange={setAddress}
              placeholder="e.g. Shop No A-1/21, Shivani Complex, Bhopal"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <TextField
                label="Drug License 20B"
                value={dl20b}
                onChange={setDl20b}
                placeholder="20B/6742/27/2023"
              />
              <TextField
                label="Drug License 21B"
                value={dl21b}
                onChange={setDl21b}
                placeholder="21B/6742/27/2023"
              />
              <TextField
                label="GSTIN Number"
                value={gstin}
                onChange={setGstin}
                placeholder="23AAKCC7549M1Z5"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TextField
                label="Mobile Phone"
                value={mobile}
                onChange={setMobile}
                placeholder="+91 9009660201"
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
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>⚠️ {error}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="secondary" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving} style={{ flex: 1, background: '#7c3aed', borderColor: '#7c3aed' }}>
              {saving ? 'Saving...' : 'Save Stockist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
