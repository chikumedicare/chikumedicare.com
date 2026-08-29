import { ChemistBasicInfoSection } from './ChemistBasicInfoSection';
import { ChemistTerritorySection } from './ChemistTerritorySection';
import { ChemistComplianceContactSection } from './ChemistComplianceContactSection';
import React, { useState } from 'react';
import type { Headquarter, Area, Beat } from '../../../../core/domain/hr/geography.types';
import type { Chemist } from '../../../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../../../utils/dataIntegrity';

interface ChemistFormModalProps {
  chemist: Chemist | null;
  hqs?: Headquarter[];
  areas?: Area[];
  beats?: Beat[];
  onSave: (draft: Partial<Chemist>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

const INDIAN_STATES = [
  'Madhya Pradesh',
  'Maharashtra',
  'Uttar Pradesh',
  'Rajasthan',
  'Gujarat',
  'Chhattisgarh',
  'Delhi',
  'Bihar',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Kerala',
  'Odisha',
  'Assam',
  'Jharkhand',
  'Uttarakhand',
  'Himachal Pradesh',
  'Goa',
  'Other',
];

export function ChemistFormModal({
  chemist,
  hqs = [],
  areas = [],
  beats = [],
  onSave,
  onClose,
}: ChemistFormModalProps) {
  const isEditing = Boolean(chemist);

  // 1. Chemist Identification
  const [chemistName, setChemistName] = useState(chemist?.chemistName || '');
  const [contactPerson, setContactPerson] = useState(chemist?.contactPerson || '');
  const [chemistClass, setChemistClass] = useState<'A' | 'B' | 'C'>(chemist?.chemistClass || 'A');
  const [visits, setVisits] = useState<number>(Number(chemist?.visitFrequency) || 2);

  // 2. Territory Mapping
  const [hqId, setHqId] = useState(chemist?.hqId || hqs[0]?.id || '');
  const filteredAreas = areas.filter((a) => !hqId || a.hqId === hqId || (a as any).hq_id === hqId);
  const [areaId, setAreaId] = useState(chemist?.areaId || filteredAreas[0]?.id || areas[0]?.id || '');
  const filteredBeats = beats.filter((b) => !areaId || b.areaId === areaId || (b as any).area_id === areaId);
  const [beatId, setBeatId] = useState(chemist?.beatId || filteredBeats[0]?.id || beats[0]?.id || '');

  // 3. Shop Address
  const [add1, setAdd1] = useState(chemist?.addressLine1 || chemist?.address || '');
  const [add2, setAdd2] = useState(chemist?.addressLine2 || '');
  const [city, setCity] = useState(chemist?.city || 'Bhopal');
  const [pinCode, setPinCode] = useState(chemist?.pinCode || '');
  const [state, setState] = useState(chemist?.state || 'Madhya Pradesh');

  // 4. Compliance
  const [drugLicenseNumber, setDrugLicenseNumber] = useState(chemist?.drugLicenseNumber || '');
  const [gstin, setGstin] = useState(chemist?.gstin || '');

  // 5. Contact Info
  const [mobile, setMobile] = useState(chemist?.mobile || '');
  const [email, setEmail] = useState(chemist?.email || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chemistName.trim()) {
      setError('Chemist Shop / Counter Name is required.');
      return;
    }
    if (!hqId) {
      setError('Please select Base HQ.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const hqObj = hqs.find((h) => h.id === hqId);
      const areaObj = areas.find((a) => a.id === areaId);
      const beatObj = beats.find((b) => b.id === beatId);

      const draft: Partial<Chemist> = {
        id: chemist?.id,
        chemistName: chemistName.trim(),
        contactPerson: contactPerson.trim() || undefined,
        chemistClass,
        visitFrequency: Number(visits) || 2,
        hqId,
        hqName: hqObj ? ((hqObj as any).name || (hqObj as any).hq_name) : hqId,
        areaId,
        areaName: areaObj ? ((areaObj as any).name || (areaObj as any).area_name) : areaId,
        beatId,
        beatName: beatObj ? ((beatObj as any).name || (beatObj as any).beat_name) : beatId,

        addressLine1: add1,
        addressLine2: add2,
        city,
        pinCode,
        state,
        address: [add1, add2, city, state, pinCode].filter(Boolean).join(', '),

        drugLicenseNumber: drugLicenseNumber.trim() || undefined,
        gstin: gstin.trim() || undefined,
        mobile: mobile.trim() || undefined,
        email: email.trim() || undefined,
        isActive: true,
      };

      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save Chemist record.');
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
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
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
          borderRadius: '20px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #0b1329 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>💊</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                {isEditing ? 'Edit Chemist Master Record' : 'Add New Chemist'}
              </h3>
              <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                Configure retail pharmacy counter, DL compliance, territory mapping, and address.
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ChemistBasicInfoSection
              chemistName={chemistName}
              setChemistName={setChemistName}
              contactPerson={contactPerson}
              setContactPerson={setContactPerson}
            />

            <ChemistTerritorySection
              hqId={hqId}
              setHqId={setHqId}
              hqs={hqs}
              areaId={areaId}
              setAreaId={setAreaId}
              filteredAreas={filteredAreas}
              beatId={beatId}
              setBeatId={setBeatId}
              filteredBeats={filteredBeats}
            />

            <ChemistComplianceContactSection
              add1={add1}
              setAdd1={setAdd1}
              add2={add2}
              setAdd2={setAdd2}
              city={city}
              setCity={setCity}
              pinCode={pinCode}
              setPinCode={setPinCode}
              state={state}
              setState={setState}
              INDIAN_STATES={INDIAN_STATES}
              drugLicenseNumber={drugLicenseNumber}
              setDrugLicenseNumber={setDrugLicenseNumber}
              gstin={gstin}
              setGstin={setGstin}
              mobile={mobile}
              setMobile={setMobile}
              email={email}
              setEmail={setEmail}
            />
          </div>

          {/* Sticky Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontWeight: 700,
                fontSize: '13.5px',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: '11px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontWeight: 700,
                fontSize: '13.5px',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                cursor: 'pointer',
              }}
            >
              {saving ? 'Saving Chemist Record...' : isEditing ? 'Update Chemist Details' : 'Save & Register Chemist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ChemistFormModal;
