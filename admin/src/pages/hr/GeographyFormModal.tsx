import React from 'react';
import { Head } from '../../components/Head';
import { Section } from '../../components/Section';
import { TextField, SelectField } from '../../components/FormFields';
import { LocalityAutocompleteField } from '../../components/LocalityAutocompleteField';
import { HqFormSection } from './HqFormSection';
import { AreaBeatFormSection } from './AreaBeatFormSection';
import { useGeographyForm } from './useGeographyForm';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';
import type { TerritoryType } from '../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area } from '../../domain/hr/geography.types';

interface GeographyFormModalProps {
  type: TerritoryType;
  item: any | null;
  zones: Zone[];
  states: State[];
  hqs: Headquarter[];
  areas: Area[];
  onSave: (draft: any) => Promise<{ success: boolean; error?: string }>;
  back: () => void;
}

export function GeographyFormModal({
  type,
  item,
  zones,
  states,
  hqs,
  areas,
  onSave,
  back,
}: GeographyFormModalProps) {
  const { divisions } = useHeadOfficeStore();
  const f = useGeographyForm(type, item, zones, states, hqs, areas, onSave, back);

  const prefixHint: Record<TerritoryType, string> = {
    Zone: 'ZN### (e.g. ZN001, ZN002...)',
    State: 'ST### (e.g. ST001, ST002...)',
    HQ: 'HQ### (e.g. HQ001, HQ002...)',
    Area: 'AR### (e.g. AR001, AR002...)',
    Beat: 'BT### (e.g. BT001, BT002...)',
  };

  const filteredZones = zones.filter((z) => !f.divisionId || z.divisionId === f.divisionId);
  const filteredStates = states.filter((s) => !f.divisionId || s.divisionId === f.divisionId);
  const filteredHqs = hqs.filter((h) => (!f.divisionId || h.divisionId === f.divisionId) && !h.isSuperHq && h.code !== 'HQ000');
  const filteredAreas = areas.filter((a) => !f.divisionId || a.divisionId === f.divisionId);

  return (
    <>
      <Head
        title={item ? `Edit ${type}: ${item.name} (${item.code})` : `Add New ${type}`}
        sub={`Geography Territory Master • Full Configuration for ${type}`}
      />

      <div className="formGrid">
        <Section title="1. Marketing Division Assignment">
          <SelectField
            label={`Division * ${item ? '(Immutable in Edit Mode)' : ''}`}
            value={f.divisionId}
            onChange={(v) => f.setDivisionId(v)}
            disabled={!!item}
            options={[
              { v: '', l: '-- Select Division --' },
              ...divisions.map((d) => ({ v: d.id, l: `${d.code} - ${d.name}` })),
            ]}
          />
        </Section>

        {type !== 'Zone' && (
          <Section title="2. Parent Territory Hierarchy">
            {type === 'State' && (
              <SelectField
                label="Parent Zone *"
                value={f.parentId}
                onChange={(v) => { f.setParentId(v); f.setError(''); }}
                disabled={!f.divisionId}
                options={[
                  { v: '', l: '-- Select Parent Zone --' },
                  ...filteredZones.map((z) => ({ v: z.id, l: `${z.code} - ${z.name}` })),
                ]}
              />
            )}
            {type === 'HQ' && (
              <SelectField
                label="Parent State *"
                value={f.parentId}
                onChange={(v) => { f.setParentId(v); f.setError(''); }}
                disabled={!f.divisionId}
                options={[
                  { v: '', l: '-- Select Parent State --' },
                  ...filteredStates.map((s) => ({ v: s.id, l: `${s.code} - ${s.name}` })),
                ]}
              />
            )}
            {type === 'Area' && (
              <SelectField
                label="Parent Headquarter (HQ) *"
                value={f.parentId}
                onChange={(v) => { f.setParentId(v); f.setError(''); }}
                disabled={!f.divisionId}
                options={[
                  { v: '', l: '-- Select Parent HQ --' },
                  ...filteredHqs.map((h) => ({ v: h.id, l: `${h.code} - ${h.name}` })),
                ]}
              />
            )}
            {type === 'Beat' && (
              <SelectField
                label="Parent Area *"
                value={f.parentId}
                onChange={(v) => { f.setParentId(v); f.setError(''); }}
                disabled={!f.divisionId}
                options={[
                  { v: '', l: '-- Select Parent Area --' },
                  ...filteredAreas.map((a) => ({ v: a.id, l: `${a.code} - ${a.name}` })),
                ]}
              />
            )}
          </Section>
        )}

        <Section title={`${type === 'Zone' ? '2' : '3'}. ${type} Identity & Nomenclature`}>
          {!item && (
            <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: '#166534' }}>
              ℹ️ <b>Automatic Unique Code:</b> Code <code>{prefixHint[type]}</code> is auto-generated on save.
            </div>
          )}

          {item && (
            <div style={{ marginBottom: '14px' }}>
              <TextField label={`${type} Code (Immutable)`} value={f.code} disabled />
            </div>
          )}

          {type === 'Area' || type === 'Beat' ? (
            <LocalityAutocompleteField
              label={`${type} Name *`}
              value={f.name}
              onChange={(v) => { f.setName(v); f.setError(''); }}
              placeholder={`Pick from popular localities or type to search...`}
              contextLocation={f.contextLocation}
              isBeat={type === 'Beat'}
            />
          ) : (
            <TextField
              label={`${type} Name *`}
              value={f.name}
              onChange={(v) => { f.setName(v); f.setError(''); }}
              placeholder={`Enter ${type} Name (e.g. ${type === 'Zone' ? 'Central Zone' : type === 'State' ? 'Madhya Pradesh' : 'Bhopal HQ'})`}
            />
          )}
        </Section>

        {type === 'HQ' && (
          <HqFormSection
            hqType={f.hqType}
            setHqType={f.setHqType}
            city={f.city}
            setCity={f.setCity}
            district={f.district}
            setDistrict={f.setDistrict}
            pinCode={f.pinCode}
            setPinCode={f.setPinCode}
            isPoolHq={f.isPoolHq}
            setIsPoolHq={f.setIsPoolHq}
            parentPoolHqId={f.parentPoolHqId}
            setParentPoolHqId={f.setParentPoolHqId}
            latitude={f.latitude}
            setLatitude={f.setLatitude}
            longitude={f.longitude}
            setLongitude={f.setLongitude}
            displayOrder={f.displayOrder}
            setDisplayOrder={f.setDisplayOrder}
            description={f.description}
            setDescription={f.setDescription}
            hqs={filteredHqs}
          />
        )}

        {type !== 'HQ' && (
          <AreaBeatFormSection
            type={type}
            territoryType={f.territoryType}
            setTerritoryType={f.setTerritoryType}
            travelMode={f.travelMode}
            setTravelMode={f.setTravelMode}
            bothSideAllowed={f.bothSideAllowed}
            setBothSideAllowed={f.setBothSideAllowed}
            beatType={f.beatType}
            setBeatType={f.setBeatType}
            displayOrder={f.displayOrder}
            setDisplayOrder={f.setDisplayOrder}
            description={f.description}
            setDescription={f.setDescription}
          />
        )}

        <Section title="Final: Operational Lifecycle">
          <SelectField
            label="Lifecycle Status"
            value={f.isActive}
            onChange={f.setIsActive}
            options={[
              { v: 'ACTIVE', l: 'ACTIVE (Operational)' },
              { v: 'INACTIVE', l: 'INACTIVE (Disabled / Retired)' },
            ]}
          />
          {f.error && <small style={{ color: '#ef4444', display: 'block', marginTop: '8px' }}>⚠️ {f.error}</small>}
        </Section>
      </div>

      <div className="actions">
        <button className="secondary" onClick={back} disabled={f.saving}>Cancel</button>
        <button className="primary" onClick={f.handleSubmit} disabled={f.saving}>
          {f.saving ? 'Saving to Database...' : item ? `Save ${type} Changes` : `Create ${type}`}
        </button>
      </div>
    </>
  );
}
