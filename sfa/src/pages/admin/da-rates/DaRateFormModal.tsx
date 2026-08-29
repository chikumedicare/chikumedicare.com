import { getErrorMessage } from '../../../utils/dataIntegrity';
import React, { useState } from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { RoleDaSummary } from '../../../core/domain/hr/leave.types';

export function DaRateFormModal({
  roleSummary,
  existingRoles = [],
  onSave,
  onClose,
}: {
  roleSummary: RoleDaSummary | null;
  existingRoles?: string[];
  onSave: (
    role: string,
    hq: number,
    exhq: number,
    outstation: number,
    transit: number,
    effectiveFrom?: string,
    isActive?: boolean,
    existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
    taPolicy?: {
      fareType?: 'ONE_WAY' | 'TWO_WAY';
      kmRate0_199?: number;
      kmRate200_299?: number;
      travelMode299_599?: string;
      travelMode600Plus?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const isEditing = !!roleSummary;

  const [role, setRole] = useState(roleSummary?.role || 'MR');
  const [customRole, setCustomRole] = useState('');

  // Form Section Tab: 'DA' or 'TA'
  const [formSection, setFormSection] = useState<'DA' | 'TA'>('DA');
  
  // DA Slabs (₹/Day)
  const [hq, setHq] = useState(roleSummary?.hq != null ? String(roleSummary.hq) : '250');
  const [exhq, setExhq] = useState(roleSummary?.exhq != null ? String(roleSummary.exhq) : '350');
  const [outstation, setOutstation] = useState(roleSummary?.outstation != null ? String(roleSummary.outstation) : '600');
  const [transit, setTransit] = useState(roleSummary?.transit != null ? String(roleSummary.transit) : '200');
  
  // Fare Policy (TA / KM per Rupees) Slabs
  const [fareType, setFareType] = useState<'ONE_WAY' | 'TWO_WAY'>(roleSummary?.fareType || 'TWO_WAY');
  const [kmRate0_199, setKmRate0_199] = useState(roleSummary?.kmRate0_199 != null ? String(roleSummary.kmRate0_199) : '3.50');
  const [kmRate200_299, setKmRate200_299] = useState(roleSummary?.kmRate200_299 != null ? String(roleSummary.kmRate200_299) : '4.50');
  const [travelMode299_599, setTravelMode299_599] = useState(roleSummary?.travelMode299_599 || 'required sleeper tickit');
  const [travelMode600Plus, setTravelMode600Plus] = useState(roleSummary?.travelMode600Plus || 'required 3rd ac tickit');

  const [effectiveFrom, setEffectiveFrom] = useState(roleSummary?.effectiveFrom || '2024-04-01');
  const [isActive, setIsActive] = useState(roleSummary ? roleSummary.active : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const finalRole = role === 'CUSTOM' ? customRole.trim().toUpperCase() : role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalRole) {
      setError('Please select or specify a role designation');
      return;
    }
    if (!isEditing && existingRoles.includes(finalRole)) {
      setError(`Rates for role ${finalRole} already exist. Please edit the existing slab.`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await onSave(
        finalRole,
        Number(hq) || 0,
        Number(exhq) || 0,
        Number(outstation) || 0,
        Number(transit) || 0,
        effectiveFrom,
        isActive,
        roleSummary?.ids,
        {
          fareType,
          kmRate0_199: Number(kmRate0_199) || 0,
          kmRate200_299: Number(kmRate200_299) || 0,
          travelMode299_599,
          travelMode600Plus,
        }
      );

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save DA/TA rates');
      }
    } catch (err: unknown) { setError(getErrorMessage(err)); } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? `✏️ Edit Policy Slab: ${roleSummary.role}` : '➕ Add Policy Slab'}
            </h3>
            <small style={{ color: '#64748b' }}>Configure Daily Allowance (DA Rate) & KM per Rupees (TA Policy).</small>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Designation Role Selection */}
            {!isEditing ? (
              <>
                <SelectField
                  label="Select Designation (drop down) *"
                  value={role}
                  onChange={(v) => { setRole(v); setError(''); }}
                  options={[
                    { v: 'MR', l: 'MR - Medical Representative' },
                    { v: 'SR_MR', l: 'SR_MR - Senior MR' },
                    { v: 'ASM', l: 'ASM - Area Sales Manager' },
                    { v: 'SR_ASM', l: 'SR_ASM - Senior ASM' },
                    { v: 'RSM', l: 'RSM - Regional Sales Manager' },
                    { v: 'ZSM', l: 'ZSM - Zonal Sales Manager' },
                    { v: 'NSM', l: 'NSM - National Sales Manager' },
                    { v: 'VP', l: 'VP - Vice President' },
                    { v: 'CUSTOM', l: '+ Add Custom Designation...' },
                  ]}
                />
                {role === 'CUSTOM' && (
                  <TextField
                    label="Custom Role Designation Name *"
                    value={customRole}
                    onChange={setCustomRole}
                    placeholder="e.g. DIRECTOR / EXECUTOR"
                  />
                )}
              </>
            ) : (
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', display: 'block' }}>Editing Policy Slab for Designation:</small>
                <b style={{ fontSize: '16px', color: '#0f172a' }}>{roleSummary.role}</b>
              </div>
            )}

            {/* Section Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setFormSection('DA')}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  background: formSection === 'DA' ? '#e0f2fe' : '#f1f5f9', color: formSection === 'DA' ? '#0369a1' : '#475569'
                }}
              >
                💰 Section 1: Daily Allowance (DA Rates)
              </button>
              <button
                type="button"
                onClick={() => setFormSection('TA')}
                style={{
                  flex: 1, padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  background: formSection === 'TA' ? '#f3e8ff' : '#f1f5f9', color: formSection === 'TA' ? '#6b21a8' : '#475569'
                }}
              >
                🚗 Section 2: KM per Rupees (TA Policy)
              </button>
            </div>

            {/* SECTION 1: DAILY ALLOWANCE (DA RATES) */}
            {formSection === 'DA' && (
              <div style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', border: '1px solid #bae6fd', display: 'grid', gap: '12px' }}>
                <b style={{ color: '#0369a1', fontSize: '14px' }}>💰 Daily Allowance (DA Rates in ₹ / Day)</b>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <TextField
                    label="Local HQ DA Rate (₹/Day)"
                    type="number"
                    value={hq}
                    onChange={setHq}
                  />
                  <TextField
                    label="EX-HQ DA Rate (₹/Day)"
                    type="number"
                    value={exhq}
                    onChange={setExhq}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <TextField
                    label="Outstation DA Rate (₹/Day)"
                    type="number"
                    value={outstation}
                    onChange={setOutstation}
                  />
                  <TextField
                    label="Transit DA Rate (₹/Day)"
                    type="number"
                    value={transit}
                    onChange={setTransit}
                  />
                </div>
              </div>
            )}

            {/* SECTION 2: KM PER RUPEES (TRAVEL ALLOWANCE & FARE POLICY) */}
            {formSection === 'TA' && (
              <div style={{ background: '#faf5ff', padding: '14px', borderRadius: '10px', border: '1px solid #e9d5ff', display: 'grid', gap: '12px' }}>
                <b style={{ color: '#6b21a8', fontSize: '14px' }}>🚗 KM per Rupees (Travel Allowance & Fare Policy)</b>
                <SelectField
                  label="Fare Calculation Mode *"
                  value={fareType}
                  onChange={(v) => setFareType(v as 'ONE_WAY' | 'TWO_WAY')}
                  options={[
                    { v: 'TWO_WAY', l: 'TWO_WAY (Round Trip fare: 2 × Distance KM)' },
                    { v: 'ONE_WAY', l: 'ONE_WAY (Single Side fare: 1 × Distance KM)' },
                  ]}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <TextField
                    label="0 - 199 KM Rate (₹/KM)"
                    type="number"
                    value={kmRate0_199}
                    onChange={setKmRate0_199}
                  />
                  <TextField
                    label="200 - 299 KM Rate (₹/KM)"
                    type="number"
                    value={kmRate200_299}
                    onChange={setKmRate200_299}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <TextField
                    label="299 - 599 KM Policy"
                    value={travelMode299_599}
                    onChange={setTravelMode299_599}
                  />
                  <TextField
                    label="600+ KM Policy"
                    value={travelMode600Plus}
                    onChange={setTravelMode600Plus}
                  />
                </div>
              </div>
            )}

            {/* Common Status & Effective Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              <TextField
                label="Effective From Date *"
                type="date"
                value={effectiveFrom}
                onChange={setEffectiveFrom}
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
              {saving ? 'Saving Slabs...' : 'Save Policy Slabs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
