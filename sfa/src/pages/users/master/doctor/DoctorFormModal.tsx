import React from 'react';
import type { Headquarter, Area, Beat } from '../../../../core/domain/hr/geography.types';
import type { Doctor } from '../../../../core/domain/master/fieldMaster.types';
import { QUALIFICATION_OPTIONS, SPECIALITY_OPTIONS, INDIAN_STATES } from './doctorConstants';
import { useDoctorForm } from './useDoctorForm';
import { DoctorProfileSection } from './DoctorProfileSection';
import { DoctorTerritorySection } from './DoctorTerritorySection';
import { DoctorAddressSection } from './DoctorAddressSection';
import { DoctorPersonalContactSection } from './DoctorPersonalContactSection';

interface DoctorFormModalProps {
  doctor: Doctor | null;
  hqs?: Headquarter[];
  areas?: Area[];
  beats?: Beat[];
  onSave: (draft: Partial<Doctor>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function DoctorFormModal(props: DoctorFormModalProps) {
  const { doctor, hqs = [], onClose } = props;
  const isEditing = Boolean(doctor);
  const form = useDoctorForm(props);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
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
                {isEditing ? 'Edit Doctor Master Record' : 'Add New Medical Practitioner'}
              </h3>
              <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                Configure clinical qualifications, territory beat tagging and visitation metrics.
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

        {/* Form Body */}
        <form onSubmit={form.handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {form.error && (
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
              <span>⚠️</span> {form.error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* ─── SECTION 1: Doctor Profile & Credentials ─── */}
            <DoctorProfileSection
              doctorName={form.doctorName}
              setDoctorName={form.setDoctorName}
              gender={form.gender}
              setGender={form.setGender}
              selectedQualifications={form.selectedQualifications}
              toggleQualification={form.toggleQualification}
              otherQualification={form.otherQualification}
              setOtherQualification={form.setOtherQualification}
              QUALIFICATION_OPTIONS={QUALIFICATION_OPTIONS}
              speciality={form.speciality}
              setSpeciality={form.setSpeciality}
              otherSpeciality={form.otherSpeciality}
              setOtherSpeciality={form.setOtherSpeciality}
              SPECIALITY_OPTIONS={SPECIALITY_OPTIONS}
              doctorClass={form.doctorClass}
              setDoctorClass={form.setDoctorClass}
              visits={form.visits}
              setVisits={form.setVisits}
            />

            {/* ─── SECTION 2: Territory & Route Mapping ─── */}
            <DoctorTerritorySection
              hqId={form.hqId}
              setHqId={form.setHqId}
              hqs={hqs}
              areaId={form.areaId}
              setAreaId={form.setAreaId}
              filteredAreas={form.filteredAreas}
              beatId={form.beatId}
              setBeatId={form.setBeatId}
              filteredBeats={form.filteredBeats}
            />

            {/* ─── SECTION 3 & 4: Addresses ─── */}
            <DoctorAddressSection
              clinicAdd1={form.clinicAdd1}
              setClinicAdd1={form.setClinicAdd1}
              clinicAdd2={form.clinicAdd2}
              setClinicAdd2={form.setClinicAdd2}
              clinicCity={form.clinicCity}
              setClinicCity={form.setClinicCity}
              clinicPin={form.clinicPin}
              setClinicPin={form.setClinicPin}
              clinicState={form.clinicState}
              setClinicState={form.setClinicState}
              INDIAN_STATES={INDIAN_STATES}
              sameAsClinic={form.sameAsClinic}
              handleSameAsClinicToggle={form.handleSameAsClinicToggle}
              permAdd1={form.permAdd1}
              setPermAdd1={form.setPermAdd1}
              permAdd2={form.permAdd2}
              setPermAdd2={form.setPermAdd2}
              permCity={form.permCity}
              setPermCity={form.setPermCity}
              permPin={form.permPin}
              setPermPin={form.setPermPin}
              permState={form.permState}
              setPermState={form.setPermState}
            />

            {/* ─── SECTION 5: Personal Dates & Contact Info ─── */}
            <DoctorPersonalContactSection
              dob={form.dob}
              setDob={form.setDob}
              anniversaryDate={form.anniversaryDate}
              setAnniversaryDate={form.setAnniversaryDate}
              mobile={form.mobile}
              setMobile={form.setMobile}
              email={form.email}
              setEmail={form.setEmail}
            />
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
              disabled={form.saving}
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={form.saving}
              style={{
                flex: 2,
                padding: '11px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              {form.saving ? 'Saving...' : isEditing ? 'Update Practitioner' : 'Save Doctor Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default DoctorFormModal;
