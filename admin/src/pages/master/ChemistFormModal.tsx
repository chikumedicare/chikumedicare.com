import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { Chemist } from '../../domain/master/fieldMaster.types';

export function ChemistFormModal({
  chemist,
  hqs = [],
  areas = [],
  onSave,
  onClose,
}: {
  chemist: Chemist | null;
  hqs?: any[];
  areas?: any[];
  onSave: (draft: Partial<Chemist>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const isEditing = !!chemist;

  const [chemistName, setChemistName] = useState(chemist?.chemistName || '');
  const [contactPerson, setContactPerson] = useState(chemist?.contactPerson || '');
  const [chemistClass, setChemistClass] = useState<'A' | 'B' | 'C'>(chemist?.chemistClass || 'A');
  const [hqId, setHqId] = useState(chemist?.hqId || hqs[0]?.id || '');
  const [areaId, setAreaId] = useState(chemist?.areaId || areas[0]?.id || '');
  const [address, setAddress] = useState(chemist?.address || '');
  const [city, setCity] = useState(chemist?.city || 'Bhopal');
  const [mobile, setMobile] = useState(chemist?.mobile || '');
  const [drugLicenseNumber, setDrugLicenseNumber] = useState(chemist?.drugLicenseNumber || '');
  const [gstin, setGstin] = useState(chemist?.gstin || '');
  const [isActive, setIsActive] = useState(chemist ? chemist.isActive : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemistName.trim()) { setError('Chemist Shop Name is required'); return; }
    if (!hqId) { setError('Please select HQ'); return; }

    setSaving(true);
    setError('');

    try {
      const hqObj = hqs.find((h) => h.id === hqId);
      const areaObj = areas.find((a) => a.id === areaId);

      const draft: Partial<Chemist> = {
        id: chemist?.id,
        chemistName: chemistName.trim(),
        contactPerson: contactPerson.trim(),
        chemistClass,
        hqId,
        hqName: hqObj ? (hqObj.name || hqObj.hq_name) : hqId,
        areaId,
        areaName: areaObj ? (areaObj.name || areaObj.area_name) : areaId,
        address,
        city,
        mobile,
        drugLicenseNumber,
        gstin,
        isActive,
      };

      const res = await onSave(draft);
      if (res.success) onClose();
      else setError(res.error || 'Failed to save Chemist record');
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
              {isEditing ? '✏️ Edit Chemist Master Record' : '💊 Add New Chemist Counter'}
            </h3>
            <small style={{ color: '#64748b' }}>Configure Retail Chemist counter and DL details.</small>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <TextField
              label="Chemist Shop Name *"
              value={chemistName}
              onChange={setChemistName}
              placeholder="e.g. Apollo Pharmacy / Sharma Medical Store"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TextField
                label="Owner / Contact Person"
                value={contactPerson}
                onChange={setContactPerson}
                placeholder="e.g. Shri Rajesh Sharma"
              />
              <SelectField
                label="Chemist Class *"
                value={chemistClass}
                onChange={(v) => setChemistClass(v as any)}
                options={[
                  { v: 'A', l: 'Class A (High Volume)' },
                  { v: 'B', l: 'Class B (Medium)' },
                  { v: 'C', l: 'Class C (Standard)' },
                ]}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <SelectField
                label="Base HQ *"
                value={hqId}
                onChange={setHqId}
                options={hqs.map((h) => ({ v: h.id, l: `📍 ${h.name || h.hq_name}` }))}
              />
              <SelectField
                label="Area / Beat"
                value={areaId}
                onChange={setAreaId}
                options={areas.map((a) => ({ v: a.id, l: `📍 ${a.name || a.area_name}` }))}
              />
            </div>

            <TextField
              label="Shop Address"
              value={address}
              onChange={setAddress}
              placeholder="e.g. Shop No. 5, New Market"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TextField
                label="Drug License (DL 20B/21B)"
                value={drugLicenseNumber}
                onChange={setDrugLicenseNumber}
                placeholder="e.g. 20B/1234/MP/2023"
              />
              <TextField
                label="GSTIN Number"
                value={gstin}
                onChange={setGstin}
                placeholder="e.g. 23AAAC1234F1Z5"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TextField
                label="Mobile Phone"
                value={mobile}
                onChange={setMobile}
                placeholder="e.g. +91 9826012345"
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
            <button type="submit" className="primary" disabled={saving} style={{ flex: 1, background: '#16a34a', borderColor: '#16a34a' }}>
              {saving ? 'Saving...' : 'Save Chemist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
