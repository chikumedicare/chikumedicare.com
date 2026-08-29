import type { Beat } from '../../../core/domain/hr/geography.types';
import React from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import { LocalityAutocompleteField } from '../../../components/LocalityAutocompleteField';
import { HqFormSection } from './HqFormSection';
import { AreaBeatFormSection } from './AreaBeatFormSection';
import { DivisionAndParentHierarchySection } from './DivisionAndParentHierarchySection';
import { useGeographyForm } from './useGeographyForm';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area } from '../../../core/domain/hr/geography.types';

interface GeographyFormModalProps {
  type: TerritoryType;
  item: Zone | State | Headquarter | Area | Beat | null;
  zones: Zone[];
  states: State[];
  hqs: Headquarter[];
  areas: Area[];
  onSave: (draft: Partial<Zone | State | Headquarter | Area | Beat>) => Promise<{ success: boolean; error?: string }>;
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
  const filteredHqs = hqs.filter((h) => !f.divisionId || h.divisionId === f.divisionId);
  const filteredAreas = areas.filter((a) => !f.divisionId || a.divisionId === f.divisionId);

  const isHoHq = type === 'HQ' && f.hqType === 'HO';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '840px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            marginBottom: '20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              🗺️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {item ? 'Edit ' + type + ': ' + item.name + ' (' + item.code + ')' : 'Add New ' + type}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Field Geography Master • Territory Setup & Parent Hierarchy Mapping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={back}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Top Error Alert Banner */}
        {f.error && (
          <div
            style={{
              marginBottom: '18px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div>{f.error}</div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); f.handleSubmit(); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <DivisionAndParentHierarchySection
              type={type}
              item={item}
              isHoHq={isHoHq}
              divisionId={f.divisionId}
              setDivisionId={f.setDivisionId}
              parentId={f.parentId}
              setParentId={f.setParentId}
              setError={f.setError}
              divisions={divisions}
              filteredZones={filteredZones}
              filteredStates={filteredStates}
              filteredHqs={filteredHqs}
              filteredAreas={filteredAreas}
            />

            {/* Section 3: Identity & Details */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏷️</span> <span>{type === 'Zone' || isHoHq ? '1' : '3'}. {type} Identity & Details</span>
              </div>

              {!item && (
                <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', color: '#166534' }}>
                  ℹ️ <b>Automatic Code:</b> Code <code>{prefixHint[type]}</code> is auto-generated on save.
                </div>
              )}

              {item && (
                <div style={{ marginBottom: '14px' }}>
                  <TextField label={type + ' Code (Immutable)'} value={f.code} disabled />
                </div>
              )}

              {type === 'Area' || type === 'Beat' ? (
                <LocalityAutocompleteField
                  label={type + ' Name *'}
                  value={f.name}
                  onChange={(v) => { f.setName(v); f.setError(''); }}
                  placeholder="Pick from popular localities or type..."
                  
                  isBeat={type === 'Beat'}
                />
              ) : (
                <TextField
                  label={type + ' Name *'}
                  value={f.name}
                  onChange={(v) => { f.setName(v); f.setError(''); }}
                  placeholder={'Enter ' + type + ' Name (e.g. Bhopal - HO)'}
                />
              )}
            </div>

            {/* HQ / Area / Beat Specific Parameters */}
            {type === 'HQ' && (
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
              </div>
            )}

            {type !== 'HQ' && (
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
              </div>
            )}

            {/* Operational Status */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🟢</span> <span>Operational Status</span>
              </div>
              <SelectField
                label="Lifecycle Status"
                value={f.isActive}
                onChange={f.setIsActive}
                options={[
                  { v: 'ACTIVE', l: 'ACTIVE (Operational)' },
                  { v: 'INACTIVE', l: 'INACTIVE (Disabled / Retired)' },
                ]}
              />
            </div>
          </div>

          {/* Footer Action Bar */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="secondary"
              onClick={back}
              disabled={f.saving}
              style={{ padding: '9px 22px', fontSize: '13px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary"
              disabled={f.saving}
              style={{ padding: '9px 26px', fontSize: '13px', fontWeight: 700, background: '#0284c7', borderColor: '#0284c7' }}
            >
              {f.saving ? 'Saving...' : item ? 'Save ' + type + ' Changes' : 'Create ' + type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
