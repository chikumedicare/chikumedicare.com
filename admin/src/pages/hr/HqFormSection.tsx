import React from 'react';
import { Section } from '../../components/Section';
import { TextField, SelectField } from '../../components/FormFields';
import type { Headquarter } from '../../domain/hr/geography.types';

interface HqFormSectionProps {
  hqType: string;
  setHqType: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  pinCode: string;
  setPinCode: (v: string) => void;
  isPoolHq: string;
  setIsPoolHq: (v: string) => void;
  parentPoolHqId: string;
  setParentPoolHqId: (v: string) => void;
  latitude: string;
  setLatitude: (v: string) => void;
  longitude: string;
  setLongitude: (v: string) => void;
  displayOrder: string;
  setDisplayOrder: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  hqs: Headquarter[];
}

export function HqFormSection({
  hqType,
  setHqType,
  city,
  setCity,
  district,
  setDistrict,
  pinCode,
  setPinCode,
  isPoolHq,
  setIsPoolHq,
  parentPoolHqId,
  setParentPoolHqId,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  displayOrder,
  setDisplayOrder,
  description,
  setDescription,
  hqs,
}: HqFormSectionProps) {
  return (
    <>
      <Section title="3. HQ Classification & Postal Details">
        <div className="two">
          <SelectField
            label="Headquarter Type"
            value={hqType}
            onChange={setHqType}
            options={[
              { v: 'HQ', l: 'HQ — Standard Field Headquarter' },
              { v: 'SUPER_HQ', l: '👑 SUPER_HQ — Corporate Apex Super Headquarter' },
              { v: 'EX_HQ', l: 'EX-HQ — Outstation Ex-Headquarter' },
              { v: 'METRO', l: 'METRO — High Density Metro Territory' },
              { v: 'DIRECT', l: 'DIRECT — Direct Corporate Territory' },
            ]}
          />
          <TextField
            label="City / Town Name"
            value={city}
            onChange={setCity}
            placeholder="e.g. Bhopal"
          />
        </div>
        <div className="two" style={{ marginTop: '12px' }}>
          <TextField
            label="District Name"
            value={district}
            onChange={setDistrict}
            placeholder="e.g. Bhopal District"
          />
          <TextField
            label="PIN Code (6 Digits)"
            value={pinCode}
            onChange={setPinCode}
            placeholder="e.g. 462001"
          />
        </div>
      </Section>

      <Section title="4. Shared / Pool HQ & Geolocation">
        <div className="two">
          <SelectField
            label="Pool / Shared HQ Structure"
            value={isPoolHq}
            onChange={setIsPoolHq}
            options={[
              { v: '0', l: 'Standalone Independent HQ' },
              { v: '1', l: 'Shared / Pool Headquarter' },
            ]}
          />
          {isPoolHq === '1' ? (
            <SelectField
              label="Parent Pool Headquarter"
              value={parentPoolHqId}
              onChange={setParentPoolHqId}
              options={hqs.map((h) => ({ v: h.id, l: `${h.code} — ${h.name}` }))}
            />
          ) : (
            <TextField
              label="Display Sequence Order"
              value={displayOrder}
              onChange={setDisplayOrder}
              placeholder="e.g. 1"
              type="number"
            />
          )}
        </div>
        <div className="two" style={{ marginTop: '12px' }}>
          <TextField
            label="GPS Latitude (Optional)"
            value={latitude}
            onChange={setLatitude}
            placeholder="e.g. 23.2599"
          />
          <TextField
            label="GPS Longitude (Optional)"
            value={longitude}
            onChange={setLongitude}
            placeholder="e.g. 77.4126"
          />
        </div>
      </Section>

      <Section title="5. Territory Scope & Notes">
        <TextField
          label="Territory Description & Boundaries"
          value={description}
          onChange={setDescription}
          placeholder="e.g. Covers Bhopal North, South, and Mandideep industrial hospital belt."
        />
      </Section>
    </>
  );
}
