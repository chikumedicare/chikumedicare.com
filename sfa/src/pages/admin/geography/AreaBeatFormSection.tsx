import React from 'react';
import { Section } from '../../../components/Section';
import { TextField, SelectField } from '../../../components/FormFields';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';

interface AreaBeatFormSectionProps {
  type: TerritoryType;
  territoryType: string;
  setTerritoryType: (v: string) => void;
  travelMode: string;
  setTravelMode: (v: string) => void;
  bothSideAllowed: string;
  setBothSideAllowed: (v: string) => void;
  beatType: string;
  setBeatType: (v: string) => void;
  displayOrder: string;
  setDisplayOrder: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
}

export function AreaBeatFormSection({
  type,
  territoryType,
  setTerritoryType,
  travelMode,
  setTravelMode,
  bothSideAllowed,
  setBothSideAllowed,
  beatType,
  setBeatType,
  displayOrder,
  setDisplayOrder,
  description,
  setDescription,
}: AreaBeatFormSectionProps) {
  if (type !== 'Area' && type !== 'Beat' && type !== 'Zone' && type !== 'State') {
    return null;
  }

  return (
    <>
      {type === 'Area' && (
        <Section title="3. Travel Allowance & Territory Logistics">
          <div className="two">
            <SelectField
              label="Territory Logistics Type"
              value={territoryType}
              onChange={setTerritoryType}
              options={[
                { v: 'LOCAL', l: 'LOCAL — Within HQ City Limits' },
                { v: 'EX_HQ', l: 'EX_HQ — Ex-Headquarter Outskirt' },
                { v: 'OUTSTATION', l: 'OUTSTATION — Distant Territory' },
              ]}
            />
            <SelectField
              label="Default Travel Fare Mode"
              value={travelMode}
              onChange={setTravelMode}
              options={[
                { v: 'TWO_SIDE', l: 'TWO_SIDE — Return Fare (Both Sides)' },
                { v: 'ONE_SIDE', l: 'ONE_SIDE — Single Side Fare' },
                { v: 'FIXED_DA', l: 'FIXED_DA — Daily Allowance Fixed' },
              ]}
            />
          </div>
          <div className="two" style={{ marginTop: '12px' }}>
            <SelectField
              label="Both Side Travel Allowed"
              value={bothSideAllowed}
              onChange={setBothSideAllowed}
              options={[
                { v: '1', l: 'YES — Both sides travel allowed' },
                { v: '0', l: 'NO — Single side travel only' },
              ]}
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
      )}

      {type === 'Beat' && (
        <Section title="3. Beat Route Classification">
          <div className="two">
            <SelectField
              label="Beat Classification"
              value={beatType}
              onChange={setBeatType}
              options={[
                { v: 'CORE', l: 'CORE — High Frequency Main Route' },
                { v: 'NON_CORE', l: 'NON_CORE — Secondary Route' },
                { v: 'EXPANSION', l: 'EXPANSION — New / Expansion Market' },
              ]}
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
      )}

      {(type === 'Zone' || type === 'State' || type === 'Area' || type === 'Beat') && (
        <Section title="4. Territory Notes & Scope">
          <TextField
            label="Description / Scope Remarks"
            value={description}
            onChange={setDescription}
            placeholder={`Enter details / boundaries for this ${type}...`}
          />
        </Section>
      )}
    </>
  );
}
