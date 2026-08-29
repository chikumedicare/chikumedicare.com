import React, { useState } from 'react';
import type { Headquarter, Area } from '../../core/domain/hr/geography.types';
import type { Stockist } from '../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../utils/dataIntegrity';

interface StockistFormModalProps {
  stockist: Stockist | null;
  hqs?: Headquarter[];
  areas?: Area[];
  onSave: (draft: Partial<Stockist>) => Promise<{ success: boolean; error?: string }>;
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

export function StockistFormModal({
  stockist,
  hqs = [],
  areas = [],
  onSave,
  onClose,
}: StockistFormModalProps) {
  const isEditing = Boolean(stockist);

  // 1. Stockist Firm Info
  const [stockistName, setStockistName] = useState(stockist?.stockistName || '');
  const [contactPerson, setContactPerson] = useState(stockist?.contactPerson || '');

  // 2. Territory Mapping
  const [hqId, setHqId] = useState(stockist?.hqId || hqs[0]?.id || '');
  const filteredAreas = areas.filter((a) => !hqId || a.hqId === hqId || (a as any).hq_id === hqId);
  const [areaId, setAreaId] = useState(stockist?.areaId || filteredAreas[0]?.id || areas[0]?.id || '');

  // 3. Office Address
  const [add1, setAdd1] = useState(stockist?.addressLine1 || stockist?.address || '');
  const [add2, setAdd2] = useState(stockist?.addressLine2 || '');
  const [city, setCity] = useState(stockist?.city || 'Bhopal');
  const [pinCode, setPinCode] = useState(stockist?.pinCode || '');
  const [state, setState] = useState(stockist?.state || 'Madhya Pradesh');

  // 4. Compliance & Licenses
  const [dl20b, setDl20b] = useState(stockist?.dl20b || '');
  const [dl21b, setDl21b] = useState(stockist?.dl21b || '');
  const [gstin, setGstin] = useState(stockist?.gstin || '');
  const [panNumber, setPanNumber] = useState(stockist?.panNumber || '');

  // 5. Contact Info
  const [mobile, setMobile] = useState(stockist?.mobile || '');
  const [phone, setPhone] = useState(stockist?.phone || '');
  const [email, setEmail] = useState(stockist?.email || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockistName.trim()) {
      setError('Stockist Firm Name is required.');
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

      const draft: Partial<Stockist> = {
        id: stockist?.id,
        stockistName: stockistName.trim(),
        contactPerson: contactPerson.trim() || undefined,
        hqId,
        hqName: hqObj ? ((hqObj as any).name || (hqObj as any).hq_name) : hqId,
        areaId,
        areaName: areaObj ? ((areaObj as any).name || (areaObj as any).area_name) : areaId,

        addressLine1: add1,
        addressLine2: add2,
        city,
        pinCode,
        state,
        address: [add1, add2, city, state, pinCode].filter(Boolean).join(', '),

        dl20b: dl20b.trim() || undefined,
        dl21b: dl21b.trim() || undefined,
        gstin: gstin.trim() || undefined,
        panNumber: panNumber.trim() || undefined,
        mobile: mobile.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        isActive: true,
      };

      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save Stockist record.');
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
            <span style={{ fontSize: '24px' }}>🏢</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                {isEditing ? 'Edit Stockist Distributor Record' : 'Add New Stockist'}
              </h3>
              <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                Configure wholesale distributor, DL 20B/21B compliance, GST, and territory mapping.
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
            {/* ─── SECTION 1: Firm Identification ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏢</span> Distributor Firm Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Stockist Firm Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. M/S Anand Pharma Distributors"
                    value={stockistName}
                    onChange={(e) => setStockistName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Contact Person / Proprietor
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shri Anand Gupta"
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
                <span>🗺️</span> Territory Mapping
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                    Area / Town
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
              </div>
            </div>

            {/* ─── SECTION 3: Office / Godown Address ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📍</span> Office & Godown Address
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shop No. A-1/21, Wholesale Market"
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
                    placeholder="e.g. Near Transport Nagar, Main Road"
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

            {/* ─── SECTION 4: Licenses & Legal ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📜</span> Drug Licenses (20B / 21B) & GSTIN
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Drug License 20B
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 20B/6742/27/2023"
                    value={dl20b}
                    onChange={(e) => setDl20b(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Drug License 21B
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 21B/6742/27/2023"
                    value={dl21b}
                    onChange={(e) => setDl21b(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 23AAKCC7549M1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    PAN Number
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AAKCC7549M"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* ─── SECTION 5: Contact Details ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📞</span> Contact Numbers & Email
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 90096 60201"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Office / Landline Phone
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 0755-2554433"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    placeholder="e.g. anand.pharma@gmail.com"
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
              {saving ? 'Saving Stockist Record...' : isEditing ? 'Update Stockist Details' : 'Save & Register Stockist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default StockistFormModal;
