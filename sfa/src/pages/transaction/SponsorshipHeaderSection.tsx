import React from 'react';
import type { SponsorshipType } from '../../core/domain/transaction/sponsorship.types';

interface SponsorshipHeaderSectionProps {
  selectedHqId: string;
  setSelectedHqId: (h: string) => void;
  selectedDoctorId: string;
  setSelectedDoctorId: (d: string) => void;
  doctorRegNo: string;
  setDoctorRegNo: (r: string) => void;
  selectedChemistId: string;
  setSelectedChemistId: (c: string) => void;
  sponsorshipDate: string;
  setSponsorshipDate: (d: string) => void;
  sponsorshipType: SponsorshipType;
  setSponsorshipType: (t: SponsorshipType) => void;
  hqs: any[];
  doctors: any[];
  chemists: any[];
}

export function SponsorshipHeaderSection({
  selectedHqId,
  setSelectedHqId,
  selectedDoctorId,
  setSelectedDoctorId,
  doctorRegNo,
  setDoctorRegNo,
  selectedChemistId,
  setSelectedChemistId,
  sponsorshipDate,
  setSponsorshipDate,
  sponsorshipType,
  setSponsorshipType,
  hqs,
  doctors,
  chemists,
}: SponsorshipHeaderSectionProps) {
  return (
    <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
        1. Territory & Stakeholder Selection
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            HQ Territory *
          </label>
          <select
            value={selectedHqId}
            onChange={(e) => setSelectedHqId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 700 }}
          >
            {hqs.map((h) => (
              <option key={h.id} value={h.id}>{h.name || h.hqName}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Doctor Name & Degree *
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 700, color: '#0284c7' }}
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.degree || 'MBBS'} - {doc.specialty || 'GP'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Doctor Reg No.
          </label>
          <input
            type="text"
            value={doctorRegNo}
            onChange={(e) => setDoctorRegNo(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr 1.5fr', gap: '14px', marginTop: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Linked Chemist (Pharmacy)
          </label>
          <select
            value={selectedChemistId}
            onChange={(e) => setSelectedChemistId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {chemists.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.firmName}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Sponsorship Date *
          </label>
          <input
            type="date"
            value={sponsorshipDate}
            onChange={(e) => setSponsorshipDate(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            2. Sponsorship Category / Type *
          </label>
          <select
            value={sponsorshipType}
            onChange={(e) => setSponsorshipType(e.target.value as SponsorshipType)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '2px solid #0284c7', fontSize: '13.5px', background: '#f0f9ff', fontWeight: 800, color: '#0369a1' }}
          >
            <option value="Financial Support">💰 Financial Support</option>
            <option value="Product Scheme">🎁 Product Scheme</option>
            <option value="Educational Support">🎓 Educational Support</option>
            <option value="Travel Support">✈️ Travel Support</option>
            <option value="Accommodation Support">🏨 Accommodation Support</option>
            <option value="Registration Support">🎫 Registration Support</option>
            <option value="Others">📌 Others</option>
          </select>
        </div>
      </div>
    </div>
  );
}
