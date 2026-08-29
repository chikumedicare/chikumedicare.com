import React, { useState, useEffect } from 'react';
import { TextField } from '../../../components/FormFields';
import type { HeadOfficeProfile, HeadOfficeTab } from '../../../store/hr/useHeadOfficeStore';

interface SuperHqProfileFormProps {
  activeTab: HeadOfficeTab;
  profile: HeadOfficeProfile | null;
  saving: boolean;
  onSave: (profile: HeadOfficeProfile) => Promise<{ success: boolean; error?: string }>;
}

export function SuperHqProfileForm({
  activeTab,
  profile,
  saving,
  onSave,
}: SuperHqProfileFormProps) {
  const [formData, setFormData] = useState<HeadOfficeProfile>({
    companyName: 'CHIKU MEDICARE PRIVATE LIMITED',
    brandName: 'CHIKU MEDICARE',
    cinNumber: 'U24232MP2026PTC012345',
    gstin: '23AAKCC7549M1Z5',
    panNumber: 'AAKCC7549M',
    drugLicenseNo20b: '20B/6742/27/2023',
    drugLicenseNo21b: '21B/6742/27/2023',
    fssaiLicenseNo: '',
    addressLine1: 'Shop No / Plot No A-1/21, Shivani Complex',
    addressLine2: 'Vidhya Nagar',
    city: 'Bhopal',
    stateName: 'Madhya Pradesh',
    pinCode: '462026',
    email: 'GANAND.BPL@GMAIL.COM',
    helplineNumber: '+91 9009660201',
    website: 'https://chikumedicare.com',
    activeFinancialYear: '2026-27',
    workingDaysPerMonth: 26,
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData((prev: any) => ({ ...profile, ...prev }));
    }
  }, [profile]);

  const update = <K extends keyof HeadOfficeProfile>(key: K, val: HeadOfficeProfile[K]) => {
    setFormData((prev: any) => ({ ...prev, [key]: val }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      ...profile,
      ...formData,
      companyName: formData.companyName?.trim() || profile?.companyName || 'CHIKU MEDICARE PRIVATE LIMITED',
    };

    const res = await onSave(payload);
    if (res.success) {
      setSuccessMsg('Company Profile & Head Office details saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to save profile');
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Success / Error Messages */}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#166534', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab 1: Profile & Address */}
      {(activeTab as string) === 'profile' || (activeTab as string) === 'PROFILE' && (
        <>
          {/* Section 1: Corporate Identity */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏢</span> <span>1. Super HQ Apex Identity & Nomenclature</span>
            </div>

            <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ℹ️</span>
              <span><b>Corporate Super HQ Code:</b> <code>HQ000</code> — Apex Headquarter for Admin/Owner and Global Company Meetings.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextField
                label="Company Legal Name"
                value={formData.companyName || ''}
                onChange={(v) => update('companyName', v)}
                placeholder="e.g. Chiku Medicare Private Limited"
              />
              <TextField
                label="Trade Brand / Marketing Name"
                value={formData.brandName || ''}
                onChange={(v) => update('brandName', v)}
                placeholder="e.g. Chiku Healthcare"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
              <TextField
                label="Corporate Identification Number (CIN)"
                value={formData.cinNumber || ''}
                onChange={(v) => update('cinNumber', v)}
                placeholder="e.g. U24232MP2026PTC012345"
              />
              <TextField
                label="Official Website"
                value={formData.website || ''}
                onChange={(v) => update('website', v)}
                placeholder="e.g. https://chikumedicare.com"
              />
            </div>
          </div>

          {/* Section 2: Registered Address */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍</span> <span>2. Registered Corporate Head Office Address</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <TextField
                label="Address Line 1"
                value={formData.addressLine1 || ''}
                onChange={(v) => update('addressLine1', v)}
                placeholder="e.g. Corporate Tower, Plot 42, Commercial Complex"
              />
              <TextField
                label="Address Line 2"
                value={formData.addressLine2 || ''}
                onChange={(v) => update('addressLine2', v)}
                placeholder="e.g. MP Nagar Zone 1"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
              <TextField
                label="City"
                value={formData.city || ''}
                onChange={(v) => update('city', v)}
                placeholder="e.g. Bhopal"
              />
              <TextField
                label="State"
                value={formData.stateName || ''}
                onChange={(v) => update('stateName', v)}
                placeholder="e.g. Madhya Pradesh"
              />
              <TextField
                label="PIN Code"
                value={formData.pinCode || ''}
                onChange={(v) => update('pinCode', v)}
                placeholder="e.g. 462011"
              />
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Statutory Licenses */}
      {(activeTab as string) === 'statutory' || (activeTab as string) === 'STATUTORY' && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📜</span> <span>1. Statutory Wholesale Drug Licenses & Invoicing Tax Identifiers</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <TextField
              label="Central Drug License No. (Form 20B - Allopathic Wholesale)"
              value={formData.drugLicenseNo20b || ''}
              onChange={(v) => update('drugLicenseNo20b', v)}
              placeholder="e.g. 20B/MP/BPL/2026/00142"
            />
            <TextField
              label="Central Drug License No. (Form 21B - Biological Wholesale)"
              value={formData.drugLicenseNo21b || ''}
              onChange={(v) => update('drugLicenseNo21b', v)}
              placeholder="e.g. 21B/MP/BPL/2026/00143"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <TextField
              label="Central GSTIN Number"
              value={formData.gstin || ''}
              onChange={(v) => update('gstin', v)}
              placeholder="e.g. 23AABCC1234F1Z5"
            />
            <TextField
              label="Company Permanent Account Number (PAN)"
              value={formData.panNumber || ''}
              onChange={(v) => update('panNumber', v)}
              placeholder="e.g. AABCC1234F"
            />
          </div>

          <div style={{ marginTop: '14px' }}>
            <TextField
              label="FSSAI Food & Nutraceutical License"
              value={formData.fssaiLicenseNo || ''}
              onChange={(v) => update('fssaiLicenseNo', v)}
              placeholder="e.g. 10020026000142"
            />
          </div>
        </div>
      )}

      {/* Tab 5: Policies & Support */}
      {(activeTab as string) === 'policies' || (activeTab as string) === 'POLICIES' && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> <span>1. Global Operational Policies & Support Helpline</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <TextField
              label="Active Financial Year"
              value={formData.activeFinancialYear || '2026-27'}
              onChange={(v) => update('activeFinancialYear', v)}
              placeholder="e.g. 2026-27"
            />
            <TextField
              label="Standard Field Working Days / Month"
              value={String(formData.workingDaysPerMonth || 26)}
              onChange={(v) => update('workingDaysPerMonth', Number(v) || 0)}
              placeholder="e.g. 26"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <TextField
              label="Corporate Support Helpline Phone"
              value={formData.helplineNumber || ''}
              onChange={(v) => update('helplineNumber', v)}
              placeholder="e.g. +91 755 2420000"
            />
            <TextField
              label="Official Support Email"
              value={formData.email || ''}
              onChange={(v) => update('email', v)}
              placeholder="e.g. support@chikumedicare.com"
            />
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '10px 28px',
            fontSize: '13px',
            fontWeight: 700,
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          {saving ? 'Saving Profile...' : '💾 Save Company Profile'}
        </button>
      </div>
    </form>
  );
}
