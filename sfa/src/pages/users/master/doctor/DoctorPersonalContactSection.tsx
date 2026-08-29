import React from 'react';

interface DoctorPersonalContactSectionProps {
  dob: string;
  setDob: (v: string) => void;
  anniversaryDate: string;
  setAnniversaryDate: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
}

export function DoctorPersonalContactSection({
  dob,
  setDob,
  anniversaryDate,
  setAnniversaryDate,
  mobile,
  setMobile,
  email,
  setEmail,
}: DoctorPersonalContactSectionProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>📅</span> Important Dates & Contact Info
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Date of Birth
          </label>
          <input
            type="date"
            className="form-input"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Anniversary Date
          </label>
          <input
            type="date"
            className="form-input"
            value={anniversaryDate}
            onChange={(e) => setAnniversaryDate(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Mobile Phone
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
            placeholder="e.g. dr.rajesh@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>
    </div>
  );
}
