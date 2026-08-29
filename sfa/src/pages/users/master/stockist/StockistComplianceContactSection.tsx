import React from 'react';

interface StockistComplianceContactSectionProps {
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
  dl20b: string;
  setDl20b: (v: string) => void;
  dl21b: string;
  setDl21b: (v: string) => void;
  gstin: string;
  setGstin: (v: string) => void;
  panNumber: string;
  setPanNumber: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
}

export function StockistComplianceContactSection({
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
  dl20b,
  setDl20b,
  dl21b,
  setDl21b,
  gstin,
  setGstin,
  panNumber,
  setPanNumber,
  mobile,
  setMobile,
  phone,
  setPhone,
  email,
  setEmail,
}: StockistComplianceContactSectionProps) {
  return (
    <>
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
    </>
  );
}
