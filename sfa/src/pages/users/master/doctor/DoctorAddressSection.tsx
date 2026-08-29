import React from 'react';

interface DoctorAddressSectionProps {
  clinicAdd1: string;
  setClinicAdd1: (v: string) => void;
  clinicAdd2: string;
  setClinicAdd2: (v: string) => void;
  clinicCity: string;
  setClinicCity: (v: string) => void;
  clinicPin: string;
  setClinicPin: (v: string) => void;
  clinicState: string;
  setClinicState: (v: string) => void;
  INDIAN_STATES: string[];
  sameAsClinic: boolean;
  handleSameAsClinicToggle: (v: boolean) => void;
  permAdd1: string;
  setPermAdd1: (v: string) => void;
  permAdd2: string;
  setPermAdd2: (v: string) => void;
  permCity: string;
  setPermCity: (v: string) => void;
  permPin: string;
  setPermPin: (v: string) => void;
  permState: string;
  setPermState: (v: string) => void;
}

export function DoctorAddressSection({
  clinicAdd1,
  setClinicAdd1,
  clinicAdd2,
  setClinicAdd2,
  clinicCity,
  setClinicCity,
  clinicPin,
  setClinicPin,
  clinicState,
  setClinicState,
  INDIAN_STATES,
  sameAsClinic,
  handleSameAsClinicToggle,
  permAdd1,
  setPermAdd1,
  permAdd2,
  setPermAdd2,
  permCity,
  setPermCity,
  permPin,
  setPermPin,
  permState,
  setPermState,
}: DoctorAddressSectionProps) {
  return (
    <>
      {/* ─── SECTION 3: Clinic / Hospital Address ─── */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🏥</span> Clinic / Hospital Address
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Address Line 1 *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Clinic No. 104, Surya Complex"
              value={clinicAdd1}
              onChange={(e) => setClinicAdd1(e.target.value)}
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
              placeholder="e.g. Opposite City Hospital, M.G. Road"
              value={clinicAdd2}
              onChange={(e) => setClinicAdd2(e.target.value)}
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
                value={clinicCity}
                onChange={(e) => setClinicCity(e.target.value)}
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
                value={clinicPin}
                onChange={(e) => setClinicPin(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                State *
              </label>
              <select
                className="form-select"
                value={clinicState}
                onChange={(e) => setClinicState(e.target.value)}
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

      {/* ─── SECTION 4: Permanent Address ─── */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏠</span> Permanent Address
          </h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#059669', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={sameAsClinic}
              onChange={(e) => handleSameAsClinicToggle(e.target.checked)}
              style={{ accentColor: '#10b981', cursor: 'pointer' }}
            />
            <span>Same as Clinic Address</span>
          </label>
        </div>

        {!sameAsClinic && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Address Line 1
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Flat No. 402, Green Meadows"
                value={permAdd1}
                onChange={(e) => setPermAdd1(e.target.value)}
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
                placeholder="e.g. Near Rose Garden, Arera Colony"
                value={permAdd2}
                onChange={(e) => setPermAdd2(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  City
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bhopal"
                  value={permCity}
                  onChange={(e) => setPermCity(e.target.value)}
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
                  placeholder="e.g. 462016"
                  value={permPin}
                  onChange={(e) => setPermPin(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  State
                </label>
                <select
                  className="form-select"
                  value={permState}
                  onChange={(e) => setPermState(e.target.value)}
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
        )}
      </div>
    </>
  );
}
