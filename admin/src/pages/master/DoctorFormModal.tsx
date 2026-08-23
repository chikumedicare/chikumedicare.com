import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { Doctor } from '../../domain/master/fieldMaster.types';

export function DoctorFormModal({
  doctor,
  hqs = [],
  areas = [],
  onSave,
  onClose,
}: {
  doctor: Doctor | null;
  hqs?: any[];
  areas?: any[];
  onSave: (draft: Partial<Doctor>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const isEditing = !!doctor;

  const [doctorName, setDoctorName] = useState(doctor?.doctorName || '');
  const [qualification, setQualification] = useState(doctor?.qualification || 'MBBS, MD');
  const [speciality, setSpeciality] = useState(doctor?.speciality || 'General Physician');
  const [doctorClass, setDoctorClass] = useState<'A' | 'B' | 'C' | 'VIP'>(doctor?.doctorClass || 'A');
  const [hqId, setHqId] = useState(doctor?.hqId || hqs[0]?.id || '');
  const [areaId, setAreaId] = useState(doctor?.areaId || areas[0]?.id || '');
  const [clinicAddress, setClinicAddress] = useState(doctor?.clinicAddress || '');
  const [city, setCity] = useState(doctor?.city || 'Bhopal');
  const [mobile, setMobile] = useState(doctor?.mobile || '');
  const [visitFrequency, setVisitFrequency] = useState(String(doctor?.visitFrequency || 2));
  const [isActive, setIsActive] = useState(doctor ? doctor.isActive : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) { setError('Doctor Name is required'); return; }
    if (!hqId) { setError('Please select HQ'); return; }

    setSaving(true);
    setError('');

    try {
      const hqObj = hqs.find((h) => h.id === hqId);
      const areaObj = areas.find((a) => a.id === areaId);

      const draft: Partial<Doctor> = {
        id: doctor?.id,
        doctorName: doctorName.trim(),
        qualification,
        speciality,
        doctorClass,
        hqId,
        hqName: hqObj ? (hqObj.name || hqObj.hq_name) : hqId,
        areaId,
        areaName: areaObj ? (areaObj.name || areaObj.area_name) : areaId,
        clinicAddress,
        city,
        mobile,
        visitFrequency: Number(visitFrequency) || 2,
        isApproved: true,
        isActive,
      };

      const res = await onSave(draft);
      if (res.success) onClose();
      else setError(res.error || 'Failed to save Doctor record');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? '✏️ Edit Doctor Master Record' : '👨‍⚕️ Add New Doctor'}
            </h3>
            <small style={{ color: '#64748b' }}>Configure Doctor Master details and territory mapping.</small>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <TextField
              label="Doctor Name *"
              value={doctorName}
              onChange={setDoctorName}
              placeholder="e.g. Dr. Rajesh Kumar Sharma"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <TextField
                label="Qualification"
                value={qualification}
                onChange={setQualification}
                placeholder="e.g. MBBS, MD (Cardio)"
              />
              <TextField
                label="Speciality"
                value={speciality}
                onChange={setSpeciality}
                placeholder="e.g. Cardiologist"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <SelectField
                label="Doctor Class *"
                value={doctorClass}
                onChange={(v) => setDoctorClass(v as any)}
                options={[
                  { v: 'A', l: 'Class A (High Priority)' },
                  { v: 'B', l: 'Class B (Medium Priority)' },
                  { v: 'C', l: 'Class C (Standard)' },
                  { v: 'VIP', l: 'VIP Doctor' },
                ]}
              />
              <SelectField
                label="Base HQ *"
                value={hqId}
                onChange={setHqId}
                options={hqs.map((h) => ({ v: h.id, l: `📍 ${h.name || h.hq_name}` }))}
              />
              <SelectField
                label="Area / Town"
                value={areaId}
                onChange={setAreaId}
                options={areas.map((a) => ({ v: a.id, l: `📍 ${a.name || a.area_name}` }))}
              />
            </div>

            <TextField
              label="Clinic / Hospital Address"
              value={clinicAddress}
              onChange={setClinicAddress}
              placeholder="e.g. Clinic No. 12, Main Road, Vidhya Nagar"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <TextField
                label="City"
                value={city}
                onChange={setCity}
                placeholder="e.g. Bhopal"
              />
              <TextField
                label="Mobile Phone"
                value={mobile}
                onChange={setMobile}
                placeholder="e.g. +91 9826012345"
              />
              <TextField
                label="Monthly Visits"
                type="number"
                value={visitFrequency}
                onChange={setVisitFrequency}
              />
            </div>

            <SelectField
              label="Status *"
              value={isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={(v) => setIsActive(v === 'ACTIVE')}
              options={[
                { v: 'ACTIVE', l: 'ACTIVE' },
                { v: 'INACTIVE', l: 'INACTIVE' },
              ]}
            />

            {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>⚠️ {error}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="secondary" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving} style={{ flex: 1, background: '#0284c7', borderColor: '#0284c7' }}>
              {saving ? 'Saving...' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
