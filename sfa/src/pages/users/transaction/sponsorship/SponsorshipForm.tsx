import React, { useState } from 'react';
import type { SponsorshipRecord, SponsorshipType } from '../../../../core/domain/transaction/sponsorship.types';
import { SponsorshipHeaderSection } from './SponsorshipHeaderSection';
import { SponsorshipDynamicFields } from './SponsorshipDynamicFields';

interface SponsorshipFormProps {
  initialRecord?: SponsorshipRecord | null;
  doctors: any[];
  chemists: any[];
  hqs: any[];
  currentFY: string;
  onCancel: () => void;
  onSave: (record: Partial<SponsorshipRecord>, isDraft: boolean) => void;
}

export function SponsorshipForm({
  initialRecord,
  doctors,
  chemists,
  hqs,
  currentFY,
  onCancel,
  onSave,
}: SponsorshipFormProps) {
  const [selectedHqId, setSelectedHqId] = useState<string>(initialRecord?.hqId || hqs[0]?.id || 'HQ-01');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialRecord?.doctorId || doctors[0]?.id || 'DOC-01');
  const [selectedChemistId, setSelectedChemistId] = useState<string>(initialRecord?.chemistIds?.[0] || chemists[0]?.id || 'CHM-01');
  const [sponsorshipDate, setSponsorshipDate] = useState<string>(initialRecord?.sponsorshipDate || new Date().toISOString().substring(0, 10));
  const [sponsorshipType, setSponsorshipType] = useState<SponsorshipType>(initialRecord?.sponsorshipType || 'Financial Support');
  const [amount, setAmount] = useState<number>(initialRecord?.amount || 15000);
  const [doctorRegNo, setDoctorRegNo] = useState<string>(initialRecord?.doctorRegNo || 'MP-MED-44218');

  // Dynamic Type Fields State
  const [programName, setProgramName] = useState<string>(initialRecord?.programName || '');
  const [institutionOrOrganizer, setInstitutionOrOrganizer] = useState<string>(initialRecord?.institutionOrOrganizer || '');
  const [locationCity, setLocationCity] = useState<string>(initialRecord?.locationCity || '');
  const [travelType, setTravelType] = useState<'Flight' | 'Train' | 'Bus' | 'Taxi' | 'Other'>(initialRecord?.travelType || 'Flight');
  const [fromLocation, setFromLocation] = useState<string>(initialRecord?.fromLocation || '');
  const [toLocation, setToLocation] = useState<string>(initialRecord?.toLocation || '');
  const [hotelName, setHotelName] = useState<string>(initialRecord?.hotelName || '');
  const [checkInDate, setCheckInDate] = useState<string>(initialRecord?.checkInDate || '');
  const [checkOutDate, setCheckOutDate] = useState<string>(initialRecord?.checkOutDate || '');
  const [selectedProduct, setSelectedProduct] = useState<string>('D-Cal 500 Tablet (15x10)');
  const [schemeType, setSchemeType] = useState<'Free Goods' | 'Net Rate'>('Free Goods');
  const [schemeValue, setSchemeValue] = useState<string>('10 + 1');

  // Reference & Remarks
  const [referenceIdType, setReferenceIdType] = useState<string>(initialRecord?.referenceIdType || 'Medical Council Reg No');
  const [referenceIdNumber, setReferenceIdNumber] = useState<string>(initialRecord?.referenceIdNumber || 'MPMC-99214');
  const [remark, setRemark] = useState<string>(initialRecord?.remark || '');

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const currentHq = hqs.find((h) => h.id === selectedHqId) || hqs[0];
  const currentChemist = chemists.find((c) => c.id === selectedChemistId) || chemists[0];

  const handleSubmit = (isDraft: boolean) => {
    if (!remark.trim() || amount <= 0) {
      alert('Support Amount and Purpose / Remark are required.');
      return;
    }

    const payload: Partial<SponsorshipRecord> = {
      hqId: currentHq?.id,
      hqName: currentHq?.name || currentHq?.hqName,
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      doctorDegree: currentDoctor.degree,
      doctorSpecialty: currentDoctor.specialty,
      doctorRegNo,
      chemistIds: [currentChemist?.id],
      chemistNames: [currentChemist?.name || currentChemist?.firmName],
      sponsorshipDate,
      monthYear: sponsorshipDate.substring(0, 7),
      financialYear: currentFY,
      sponsorshipType,
      amount,
      programName: programName.trim() || undefined,
      institutionOrOrganizer: institutionOrOrganizer.trim() || undefined,
      locationCity: locationCity.trim() || undefined,
      travelType,
      fromLocation: fromLocation.trim() || undefined,
      toLocation: toLocation.trim() || undefined,
      hotelName: hotelName.trim() || undefined,
      checkInDate: checkInDate || undefined,
      checkOutDate: checkOutDate || undefined,
      referenceIdType,
      referenceIdNumber,
      remark: remark.trim(),
    };

    onSave(payload, isDraft);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 14px', fontWeight: 800, fontSize: '13px', color: '#334155', cursor: 'pointer' }}
          >
            <span>←</span> Back to List
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
              {initialRecord ? 'Edit Sponsorship Request' : 'New Sponsorship Addition Request'}
            </h3>
            <small style={{ color: '#64748b', fontSize: '11.5px' }}>
              Doctor Academic, CME & Field Support • Logged FY {currentFY}
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            💾 Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              cursor: 'pointer',
            }}
          >
            🚀 Submit Approval
          </button>
        </div>
      </div>

      {/* 1. Header Information Section */}
      <SponsorshipHeaderSection
        selectedHqId={selectedHqId}
        setSelectedHqId={setSelectedHqId}
        selectedDoctorId={selectedDoctorId}
        setSelectedDoctorId={setSelectedDoctorId}
        doctorRegNo={doctorRegNo}
        setDoctorRegNo={setDoctorRegNo}
        selectedChemistId={selectedChemistId}
        setSelectedChemistId={setSelectedChemistId}
        sponsorshipDate={sponsorshipDate}
        setSponsorshipDate={setSponsorshipDate}
        sponsorshipType={sponsorshipType}
        setSponsorshipType={setSponsorshipType}
        hqs={hqs}
        doctors={doctors}
        chemists={chemists}
      />

      {/* 2. Dynamic Fields */}
      <SponsorshipDynamicFields
        sponsorshipType={sponsorshipType}
        amount={amount}
        setAmount={setAmount}
        programName={programName}
        setProgramName={setProgramName}
        institutionOrOrganizer={institutionOrOrganizer}
        setInstitutionOrOrganizer={setInstitutionOrOrganizer}
        locationCity={locationCity}
        setLocationCity={setLocationCity}
        travelType={travelType}
        setTravelType={setTravelType}
        fromLocation={fromLocation}
        setFromLocation={setFromLocation}
        toLocation={toLocation}
        setToLocation={setToLocation}
        hotelName={hotelName}
        setHotelName={setHotelName}
        checkInDate={checkInDate}
        setCheckInDate={setCheckInDate}
        checkOutDate={checkOutDate}
        setCheckOutDate={setCheckOutDate}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        schemeType={schemeType}
        setSchemeType={setSchemeType}
        schemeValue={schemeValue}
        setSchemeValue={setSchemeValue}
      />

      {/* 3. Reference ID & Purpose Remarks */}
      <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
          4. Reference ID & Remarks / Purpose
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Reference ID Type
            </label>
            <select
              value={referenceIdType}
              onChange={(e) => setReferenceIdType(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="Medical Council Reg No">Medical Council Reg No</option>
              <option value="PAN Number">PAN Card Number</option>
              <option value="Aadhaar ID">Aadhaar Card ID</option>
              <option value="Conference Invite ID">Conference Invite ID</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Reference ID Number
            </label>
            <input
              type="text"
              placeholder="e.g. MPMC-99214"
              value={referenceIdNumber}
              onChange={(e) => setReferenceIdNumber(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Purpose & Justification Remarks *
          </label>
          <textarea
            rows={3}
            placeholder="Provide specific objectives and expected prescription support details..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>
    </div>
  );
}
