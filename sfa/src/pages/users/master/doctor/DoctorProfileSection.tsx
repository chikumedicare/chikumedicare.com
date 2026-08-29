import React from 'react';

interface DoctorProfileSectionProps {
  doctorName: string;
  setDoctorName: (v: string) => void;
  gender: 'Male' | 'Female' | 'Other';
  setGender: (v: 'Male' | 'Female' | 'Other') => void;
  selectedQualifications: string[];
  toggleQualification: (q: string) => void;
  otherQualification: string;
  setOtherQualification: (v: string) => void;
  QUALIFICATION_OPTIONS: string[];
  speciality: string;
  setSpeciality: (v: string) => void;
  otherSpeciality: string;
  setOtherSpeciality: (v: string) => void;
  SPECIALITY_OPTIONS: string[];
  doctorClass: 'A' | 'B' | 'C';
  setDoctorClass: (v: 'A' | 'B' | 'C') => void;
  visits: number;
  setVisits: (v: number) => void;
}

export function DoctorProfileSection({
  doctorName,
  setDoctorName,
  gender,
  setGender,
  selectedQualifications,
  toggleQualification,
  otherQualification,
  setOtherQualification,
  QUALIFICATION_OPTIONS,
  speciality,
  setSpeciality,
  otherSpeciality,
  setOtherSpeciality,
  SPECIALITY_OPTIONS,
  doctorClass,
  setDoctorClass,
  visits,
  setVisits,
}: DoctorProfileSectionProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>👤</span> Basic Profile & Credentials
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Doctor Name *
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Dr. Rajesh Kumar Sharma"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Gender *
          </label>
          <select
            className="form-select"
            value={gender}
            onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Qualification Multi-Select */}
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
          Qualification (Select Multiple) *
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {QUALIFICATION_OPTIONS.map((qual) => {
            const isSelected = selectedQualifications.includes(qual);
            return (
              <button
                key={qual}
                type="button"
                onClick={() => toggleQualification(qual)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #10b981' : '1px solid #cbd5e1',
                  background: isSelected ? '#ecfdf5' : '#ffffff',
                  color: isSelected ? '#065f46' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected ? '✓ ' : '+ '}
                {qual}
              </button>
            );
          })}
        </div>

        {selectedQualifications.includes('Other') && (
          <div style={{ marginTop: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter custom qualification (e.g. D.Card, FRCS, PGDCC)"
              value={otherQualification}
              onChange={(e) => setOtherQualification(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', fontSize: '13px', background: '#f0fdf4' }}
            />
          </div>
        )}
      </div>

      {/* Speciality, Doctor Class & Visits */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Speciality *
          </label>
          <select
            className="form-select"
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {SPECIALITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {speciality === 'Other' && (
            <div style={{ marginTop: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Specify custom speciality (e.g. Pulmonologist, Nephrologist)"
                value={otherSpeciality}
                onChange={(e) => setOtherSpeciality(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #10b981', fontSize: '13px', background: '#f0fdf4' }}
              />
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Doctor Class *
          </label>
          <select
            className="form-select"
            value={doctorClass}
            onChange={(e) => setDoctorClass(e.target.value as 'A' | 'B' | 'C')}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Visits *
          </label>
          <select
            className="form-select"
            value={visits}
            onChange={(e) => setVisits(Number(e.target.value))}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
      </div>
    </div>
  );
}
