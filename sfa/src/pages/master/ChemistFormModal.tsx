import React, { useState } from 'react';
import type { Headquarter, Area, Beat } from '../../core/domain/hr/geography.types';
import type { Chemist } from '../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../utils/dataIntegrity';

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
            {/* ─── SECTION 1: Chemist Info ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏪</span> Chemist & Shop Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Chemist / Shop Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Apollo Pharmacy / Sharma Medical Stores"
                    value={chemistName}
                    onChange={(e) => setChemistName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Contact Person / Owner Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shri Rajesh Sharma"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* ─── SECTION 2: Territory Mapping ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🗺️</span> Territory & Route Mapping
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Base HQ *
                  </label>
                  <select
                    className="form-select"
                    value={hqId}
                    onChange={(e) => setHqId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {hqs.length === 0 && <option value="">No HQs Found</option>}
                    {hqs.map((h) => (
                      <option key={h.id} value={h.id}>
                        📍 {(h as any).name || (h as any).hq_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Area / Town *
                  </label>
                  <select
                    className="form-select"
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {filteredAreas.length === 0 && <option value="">General Area</option>}
                    {filteredAreas.map((a) => (
                      <option key={a.id} value={a.id}>
                        🏘️ {(a as any).name || (a as any).area_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Beat / Patch *
                  </label>
                  <select
                    className="form-select"
                    value={beatId}
                    onChange={(e) => setBeatId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {filteredBeats.length === 0 && <option value="">Main Market Route</option>}
                    {filteredBeats.map((b) => (
                      <option key={b.id} value={b.id}>
                        🛣️ {(b as any).name || (b as any).beat_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ─── SECTION 3: Shop / Counter Address ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📍</span> Shop / Counter Address
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shop No. 12, Commercial Plaza"
                    value={add1}
                    onChange={(e) => setAdd1(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Opposite Government Hospital, Main Road"
                    value={add2}
                    onChange={(e) => setAdd2(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Bhopal"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      PIN Code
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 462001"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      State *
                    </label>
                    <select
                      className="form-select"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── SECTION 4: Licenses & Compliance ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📜</span> Drug License & GST Compliance
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Drug License No. (DL 20B / 21B)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 20B/1234/MP/2023"
                    value={drugLicenseNumber}
                    onChange={(e) => setDrugLicenseNumber(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 23AAAC1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* ─── SECTION 5: Contact Information ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📞</span> Contact Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98260 12345"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. apollo.bhopal@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
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
