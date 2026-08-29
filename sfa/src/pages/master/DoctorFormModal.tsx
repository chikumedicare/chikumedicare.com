import React, { useState } from 'react';
import type { Headquarter, Area, Beat } from '../../core/domain/hr/geography.types';
import type { Doctor } from '../../core/domain/master/fieldMaster.types';
import { getErrorMessage } from '../../utils/dataIntegrity';

interface DoctorFormModalProps {
  doctor: Doctor | null;
  hqs?: Headquarter[];
  areas?: Area[];
  beats?: Beat[];
  onSave: (draft: Partial<Doctor>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

const QUALIFICATION_OPTIONS = [
  'MBBS',
  'MD',
  'MD (DVL)',
  'DDVL',
  'DVD',
  'DDV',
  'DNB (DVL)',
  'PGDC (Cosmetology)',
  'FAM (Aesthetic Med)',
  'MS',
  'DNB',
  'DM',
  'MCh',
  'BAMS',
  'BHMS',
  'BUMS',
  'BDS',
  'MDS',
  'DGO',
  'DCH',
  'Diploma',
  'Other',
];

const SPECIALITY_OPTIONS = [
  'Dermatologist',
  'Cosmetologist',
  'Trichologist',
  'General Physician (GP)',
  'Aesthetic Physician',
  'Cardiologist',
  'Pediatrician',
  'Gynecologist',
  'Orthopedic Surgeon',
  'ENT Specialist',
  'Neurologist',
  'Gastroenterologist',
  'Diabetologist',
  'Dentist',
  'Ayurvedic Practitioner',
  'Homeopathic Practitioner',
  'Other',
];

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

export function DoctorFormModal({
  doctor,
  hqs = [],
  areas = [],
  beats = [],
  onSave,
  onClose,
}: DoctorFormModalProps) {
  const isEditing = Boolean(doctor);

  // 1. Doctor Name & Gender
  const [doctorName, setDoctorName] = useState(doctor?.doctorName || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(doctor?.gender || 'Male');

  // 2. Qualifications (Multi-select with 'Other')
  const initialQualifications: string[] = doctor?.qualification
    ? doctor.qualification.split(',').map((q) => q.trim()).filter(Boolean)
    : ['MBBS'];
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>(initialQualifications);
  const [otherQualification, setOtherQualification] = useState(doctor?.otherQualification || '');
  const [showQualDropdown, setShowQualDropdown] = useState(false);

  // 3. Speciality (Dropdown with 'Other')
  const isInitialSpecialityOther = Boolean(doctor?.speciality && !SPECIALITY_OPTIONS.includes(doctor.speciality));
  const [speciality, setSpeciality] = useState<string>(
    isInitialSpecialityOther ? 'Other' : (doctor?.speciality || 'General Physician')
  );
  const [otherSpeciality, setOtherSpeciality] = useState<string>(
    isInitialSpecialityOther ? (doctor?.speciality || '') : (doctor?.otherSpeciality || '')
  );

  // 4. Doctor Class (A, B, C)
  const [doctorClass, setDoctorClass] = useState<'A' | 'B' | 'C'>(
    (doctor?.doctorClass === 'B' || doctor?.doctorClass === 'C') ? doctor.doctorClass : 'A'
  );

  // 5. Territory & Geography
  const [hqId, setHqId] = useState(doctor?.hqId || hqs[0]?.id || '');
  const filteredAreas = areas.filter((a) => !hqId || a.hqId === hqId || (a as any).hq_id === hqId);
  const [areaId, setAreaId] = useState(doctor?.areaId || filteredAreas[0]?.id || areas[0]?.id || '');
  const filteredBeats = beats.filter((b) => !areaId || b.areaId === areaId || (b as any).area_id === areaId);
  const [beatId, setBeatId] = useState(doctor?.beatId || filteredBeats[0]?.id || beats[0]?.id || '');

  // 6. Clinic / Hospital Address
  const [clinicAdd1, setClinicAdd1] = useState(doctor?.clinicAddressLine1 || doctor?.clinicAddress || '');
  const [clinicAdd2, setClinicAdd2] = useState(doctor?.clinicAddressLine2 || '');
  const [clinicCity, setClinicCity] = useState(doctor?.clinicCity || doctor?.city || 'Bhopal');
  const [clinicPin, setClinicPin] = useState(doctor?.clinicPin || doctor?.pinCode || '');
  const [clinicState, setClinicState] = useState(doctor?.clinicState || doctor?.state || 'Madhya Pradesh');

  // 7. Permanent Address
  const [sameAsClinic, setSameAsClinic] = useState(false);
  const [permAdd1, setPermAdd1] = useState(doctor?.permAddressLine1 || '');
  const [permAdd2, setPermAdd2] = useState(doctor?.permAddressLine2 || '');
  const [permCity, setPermCity] = useState(doctor?.permCity || 'Bhopal');
  const [permPin, setPermPin] = useState(doctor?.permPin || '');
  const [permState, setPermState] = useState(doctor?.permState || 'Madhya Pradesh');

  // 8. Personal & Contact
  const [dob, setDob] = useState(doctor?.dob || '');
  const [anniversaryDate, setAnniversaryDate] = useState(doctor?.anniversaryDate || '');
  const [mobile, setMobile] = useState(doctor?.mobile || '');
  const [email, setEmail] = useState(doctor?.email || '');

  // 9. Visits (1, 2, 3)
  const [visits, setVisits] = useState<number>(Number(doctor?.visitFrequency) || 2);
  const isActive = true;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Handle Qualification Multi-Select toggle
  const toggleQualification = (qual: string) => {
    setSelectedQualifications((prev) =>
      prev.includes(qual) ? prev.filter((q) => q !== qual) : [...prev, qual]
    );
  };

  // Handle Same as Clinic Toggle
  const handleSameAsClinicToggle = (checked: boolean) => {
    setSameAsClinic(checked);
    if (checked) {
      setPermAdd1(clinicAdd1);
      setPermAdd2(clinicAdd2);
      setPermCity(clinicCity);
      setPermPin(clinicPin);
      setPermState(clinicState);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setError('Doctor Name is required.');
      return;
    }
    if (!hqId) {
      setError('Please select Base HQ.');
      return;
    }
    if (speciality === 'Other' && !otherSpeciality.trim()) {
      setError('Please specify the custom speciality.');
      return;
    }
    if (selectedQualifications.includes('Other') && !otherQualification.trim()) {
      setError('Please specify the custom qualification.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const hqObj = hqs.find((h) => h.id === hqId);
      const areaObj = areas.find((a) => a.id === areaId);
      const beatObj = beats.find((b) => b.id === beatId);

      // Build consolidated qualification string
      const qualList = selectedQualifications.filter((q) => q !== 'Other');
      if (selectedQualifications.includes('Other') && otherQualification.trim()) {
        qualList.push(otherQualification.trim());
      }
      const finalQualString = qualList.join(', ');

      const finalSpecialityString = speciality === 'Other' ? otherSpeciality.trim() : speciality;

      const draft: Partial<Doctor> = {
        id: doctor?.id,
        doctorName: doctorName.trim(),
        gender,
        qualification: finalQualString,
        otherQualification: selectedQualifications.includes('Other') ? otherQualification.trim() : undefined,
        speciality: finalSpecialityString,
        otherSpeciality: speciality === 'Other' ? otherSpeciality.trim() : undefined,
        doctorClass,
        hqId,
        hqName: hqObj ? ((hqObj as any).name || (hqObj as any).hq_name) : hqId,
        areaId,
        areaName: areaObj ? ((areaObj as any).name || (areaObj as any).area_name) : areaId,
        beatId,
        beatName: beatObj ? ((beatObj as any).name || (beatObj as any).beat_name) : beatId,

        // Clinic Address
        clinicAddressLine1: clinicAdd1,
        clinicAddressLine2: clinicAdd2,
        clinicCity,
        clinicPin,
        clinicState,
        clinicAddress: [clinicAdd1, clinicAdd2, clinicCity, clinicState, clinicPin].filter(Boolean).join(', '),

        // Permanent Address
        permAddressLine1: sameAsClinic ? clinicAdd1 : permAdd1,
        permAddressLine2: sameAsClinic ? clinicAdd2 : permAdd2,
        permCity: sameAsClinic ? clinicCity : permCity,
        permPin: sameAsClinic ? clinicPin : permPin,
        permState: sameAsClinic ? clinicState : permState,
        permAddress: sameAsClinic
          ? [clinicAdd1, clinicAdd2, clinicCity, clinicState, clinicPin].filter(Boolean).join(', ')
          : [permAdd1, permAdd2, permCity, permState, permPin].filter(Boolean).join(', '),

        dob: dob || undefined,
        anniversaryDate: anniversaryDate || undefined,
        mobile: mobile.trim() || undefined,
        email: email.trim() || undefined,
        visitFrequency: Number(visits) || 2,
        isApproved: true,
        isActive,
      };

      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save Doctor record.');
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
          maxWidth: '780px',
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
        {/* Modal Header */}
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
            <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                {isEditing ? 'Edit Doctor Master Record' : 'Add New Doctor'}
              </h3>
              <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                Enter practitioner credentials, classification, territory mapping, and clinic details.
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

        {/* Scrollable Form Body */}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* ─── SECTION 1: Doctor Profile & Credentials ─── */}
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

            {/* ─── SECTION 2: Territory & Route Mapping ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🗺️</span> Territory & Field Mapping
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
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
                    Area / Town *
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

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Beat / Patch *
                  </label>
                  <select
                    className="form-select"
                    value={beatId}
                    onChange={(e) => setBeatId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {filteredBeats.length === 0 && <option value="">Main Market Route</option>}
                    {filteredBeats.map((b) => (
                      <option key={b.id} value={b.id}>
                        🛣️ {(b as any).name || (b as any).beat_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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

            {/* ─── SECTION 5: Personal Dates & Contact Info ─── */}
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
              {saving ? 'Saving Doctor Record...' : isEditing ? 'Update Doctor Details' : 'Save & Register Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default DoctorFormModal;
