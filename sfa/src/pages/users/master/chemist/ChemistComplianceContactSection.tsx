import React from 'react';

interface ChemistComplianceContactSectionProps {
  add1: string;
  setAdd1: (v: string) => void;
  add2: string;
  setAdd2: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  pinCode: string;
  setPinCode: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  INDIAN_STATES: string[];
  drugLicenseNumber: string;
  setDrugLicenseNumber: (v: string) => void;
  gstin: string;
  setGstin: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
}

export function ChemistComplianceContactSection({
  add1,
  setAdd1,
  add2,
  setAdd2,
  city,
  setCity,
  pinCode,
  setPinCode,
  state,
  setState,
  INDIAN_STATES,
  drugLicenseNumber,
  setDrugLicenseNumber,
  gstin,
  setGstin,
  mobile,
  setMobile,
  email,
  setEmail,
}: ChemistComplianceContactSectionProps) {
  return (
    <>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Drug License (DL) No. *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MP-BHO-20B-12345"
              value={drugLicenseNumber}
              onChange={(e) => setDrugLicenseNumber(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              GSTIN (Tax ID)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 23AAAAA0000A1Z5"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Mobile Number *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 9876543210"
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
              placeholder="e.g. chemist@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
