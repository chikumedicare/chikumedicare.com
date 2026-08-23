import React, { useState, useEffect } from 'react';
import { Section } from '../../../components/Section';
import { TextField } from '../../../components/FormFields';
import type { HeadOfficeTab } from '../../../store/hr/useHeadOfficeStore';
import type { HeadOfficeProfile } from '../../../domain/hr/headOffice.types';

interface SuperHqProfileFormProps {
  activeTab: HeadOfficeTab;
  profile: HeadOfficeProfile | null;
  saving: boolean;
  onSave: (updates: Partial<HeadOfficeProfile>) => Promise<{ success: boolean; error?: string }>;
}

export function SuperHqProfileForm({
  activeTab,
  profile,
  saving,
  onSave,
}: SuperHqProfileFormProps) {
  const [formData, setFormData] = useState<Partial<HeadOfficeProfile>>({
    companyName: 'CHIKU MEDICARE PRIVATE LIMITED',
    brandName: 'CHIKU MEDICARE',
    gstin: '23AAKCC7549M1Z5',
    panNumber: 'AAKCC7549M',
    drugLicenseNo20b: '20B/6742/27/2023',
    drugLicenseNo21b: '21B/6742/27/2023',
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
      setFormData((prev) => ({ ...profile, ...prev }));
    }
  }, [profile]);

  const update = (key: keyof HeadOfficeProfile, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async () => {
    const payload = { ...profile, ...formData };
    if (!payload.companyName?.trim()) {
      setErrorMsg('Company Legal Name is required. Please check Profile tab.');
      return;
    }
    const res = await onSave(payload);
    if (res.success) {
      setSuccessMsg('Corporate Head Office & Super HQ profile saved successfully to Cloudflare D1!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to save profile');
    }
  };

  return (
    <div className="formGrid">
      {activeTab === 'profile' && (
        <>
          <Section title="1. Super HQ Apex Identity & Nomenclature">
            <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: '#b45309' }}>
              ℹ️ <b>Corporate Super HQ Code:</b> <code>HQ000</code> - Apex Headquarter for Admin/Owner and Global Company Meetings.
            </div>

            <div className="two">
              <TextField
                label="Company Legal Name *"
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
            <div className="two" style={{ marginTop: '12px' }}>
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
          </Section>

          <Section title="2. Registered Corporate Head Office Address">
            <div className="two">
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
            <div className="three" style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
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
          </Section>
        </>
      )}

      {activeTab === 'statutory' && (
        <Section title="1. Statutory Drug Licenses & Invoicing Tax Identifiers">
          <div className="two">
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
          <div className="two" style={{ marginTop: '12px' }}>
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
          <div className="two" style={{ marginTop: '12px' }}>
            <TextField
              label="FSSAI Food & Nutraceutical License"
              value={formData.fssaiLicenseNo || ''}
              onChange={(v) => update('fssaiLicenseNo', v)}
              placeholder="e.g. 10020026000142"
            />
          </div>
        </Section>
      )}

      {activeTab === 'policies' && (
        <Section title="1. Global Operational Policies & Support Helpline">
          <div className="two">
            <TextField
              label="Active Financial Year"
              value={formData.activeFinancialYear || '2026-27'}
              onChange={(v) => update('activeFinancialYear', v)}
              placeholder="e.g. 2026-27"
            />
            <TextField
              label="Standard Field Working Days / Month"
              value={String(formData.workingDaysPerMonth || 26)}
              onChange={(v) => update('workingDaysPerMonth', Number(v) || 26)}
              type="number"
            />
          </div>
          <div className="two" style={{ marginTop: '12px' }}>
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
        </Section>
      )}

      {successMsg && <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '13px' }}>✅ {successMsg}</div>}
      {errorMsg && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px' }}>⚠️ {errorMsg}</div>}

      <div className="actions" style={{ marginTop: '16px' }}>
        <button className="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving to Database...' : 'Save Corporate Profile'}
        </button>
      </div>
    </div>
  );
}
