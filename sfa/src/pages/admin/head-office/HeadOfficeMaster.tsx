import React, { useState, useEffect } from 'react';
import { Head } from '../../../components/Head';
import { TextField } from '../../../components/FormFields';
import { useHeadOfficeStore, type HeadOfficeProfile } from '../../../store/hr/useHeadOfficeStore';

export function HeadOfficeMaster() {
  const { profile, loading, saveProfile } = useHeadOfficeStore();

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
      setFormData((prev: any) => ({ ...prev, ...profile }));
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

    const res = await saveProfile(payload);
    if (res.success) {
      setSuccessMsg('Company Profile saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
        ⏳ Loading Company Profile data...
      </div>
    );
  }

  return (
    <>
      <Head
        title="Company Profile"
        sub="Corporate Legal Identity • Registered Office Address • Statutory Drug Licenses & Invoicing Tax Identifiers"
      />
      {/* Linked Corporate Head Office Governance Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🏛️</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#0369a1' }}>
              Apex Corporate Head Office (Root of All Divisions & Geography)
            </div>
            <div style={{ fontSize: '11.5px', color: '#0284c7' }}>
              Linked directly to Cloudflare D1 table and Field Geography Master.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { window.location.hash = 'geography'; }}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #0284c7',
            background: '#ffffff',
            color: '#0284c7',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🗺️ View in Field Geography Master ➔
        </button>
      </div>

      {/* Unified Single Form Container */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
        {/* Top Header Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '20px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            🏢
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
              Company Master Profile
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Corporate Identity, Statutory Drug Licenses, Registered Address & Support Helpline Rules
            </p>
          </div>
        </div>

        {/* Success / Error Banners */}
        {successMsg && (
          <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#166534', fontSize: '13px', fontWeight: 600, marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', fontSize: '13px', fontWeight: 600, marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1: Basic Identity */}
            <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏢</span> <span>1. Corporate Identity & Nomenclature</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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

            {/* Section 2: Address */}
            <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span> <span>2. Registered Office Address</span>
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

            {/* Section 3: Statutory Licenses */}
            <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜</span> <span>3. Statutory Wholesale Drug Licenses & Invoicing Tax Identifiers</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px' }}>
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
                <TextField
                  label="FSSAI License"
                  value={formData.fssaiLicenseNo || ''}
                  onChange={(v) => update('fssaiLicenseNo', v)}
                  placeholder="e.g. 10020026000142"
                />
              </div>
            </div>

            {/* Section 4: Operational Policies & Support */}
            <div style={{ background: '#f8fafc', padding: '22px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> <span>4. Operational Policies & Official Helpline</span>
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
          </div>

          {/* Footer Action Bar */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="submit"
              className="primary"
              disabled={loading}
              style={{
                padding: '12px 36px',
                fontSize: '14px',
                fontWeight: 700,
                background: '#0284c7',
                borderColor: '#0284c7',
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving Profile...' : '💾 Save Company Profile'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
