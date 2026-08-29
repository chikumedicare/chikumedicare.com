import React from 'react';
import { Section } from '../../components/Section';
import { TextField, SelectField } from '../../components/FormFields';
import type { Headquarter } from '../../core/domain/hr/geography.types';

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
  const isHo = hqType === 'HO';

  return (
    <>
      <Section title="3. Headquarter Type Classification">
        <SelectField
          label="Headquarter Type *"
          value={hqType}
          onChange={setHqType}
          options={[
            { v: 'HQ', l: 'HQ - Field Headquarter' },
            { v: 'HO', l: '🏢 HO - Head Office' },
          ]}
        />
        {isHo && (
          <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginTop: '12px', fontSize: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏢</span>
            <span><b>HO (Head Office):</b> Corporate Head Office. Division, Parent State, and Postal fields are automatically disabled for HO.</span>
          </div>
        )}
      </Section>

      {!isHo && (
        <>
          <Section title="4. Postal & Location Details">
            <div className="two">
              <TextField
                label="City / Town Name"
                value={city}
                onChange={setCity}
                placeholder="e.g. Bhopal"
              />
              <TextField
                label="District Name"
                value={district}
                onChange={setDistrict}
                placeholder="e.g. Bhopal District"
              />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <TextField
                label="PIN Code (6 Digits)"
                value={pinCode}
                onChange={setPinCode}
                placeholder="e.g. 462001"
              />
              <TextField
                label="Display Sequence Order"
                value={displayOrder}
                onChange={setDisplayOrder}
                placeholder="e.g. 1"
                type="number"
              />
            </div>
          </Section>

          <Section title="5. Shared / Pool HQ & Geolocation">
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
              {isPoolHq === '1' && (
                <SelectField
                  label="Parent Pool Headquarter"
                  value={parentPoolHqId}
                  onChange={setParentPoolHqId}
                  options={hqs.map((h) => ({ v: h.id, l: h.code + ' - ' + h.name }))}
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

          <Section title="6. Territory Scope & Notes">
            <TextField
              label="Territory Description & Boundaries"
              value={description}
              onChange={setDescription}
              placeholder="e.g. Covers Bhopal North, South, and Mandideep industrial belt."
            />
          </Section>
        </>
      )}
    </>
  );
}
