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
    HO: 'HO###',
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
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
              {item ? `Edit ${type}: ${item.name}` : `Create New ${type}`}
            </h2>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Configure hierarchical field territory parameters, parent linkages, and operating metadata.
            </div>
          </div>
          <button
            type="button"
            onClick={back}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: 700,
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Dynamic Context Breadcrumb */}
        {f.contextLocation && (
          <div
            style={{
              padding: '10px 14px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '13px',
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📍</span>
            <span>
              <b>Parent Context:</b> {f.contextLocation}
            </span>
          </div>
        )}

        {/* Global Error Banner */}
        {f.error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#dc2626',
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
              isHoHq={false}
              divisionId={f.divisionId}
              setDivisionId={f.handleDivisionChange}
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
                <span>🏷️</span> <span>{type === 'Zone' ? '1' : '3'}. {type} Identity & Details</span>
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
                  placeholder={'e.g. ' + (type === 'Area' ? 'Connaught Place' : 'Beat-1 (Market)')}
                  value={f.name}
                  onChange={(v) => { f.setName(v); f.setError(''); }}
                />
              ) : (
                <TextField
                  label={type + ' Name *'}
                  placeholder={'Enter ' + type + ' Name'}
                  value={f.name}
                  onChange={(v) => { f.setName(v); f.setError(''); }}
                />
              )}

              <div style={{ marginTop: '14px' }}>
                <SelectField
                  label="Operational Status *"
                  value={f.isActive}
                  onChange={(v) => f.setIsActive(v)}
                  options={[
                    { v: 'ACTIVE', l: '🟢 Active & Functional' },
                    { v: 'INACTIVE', l: '🔴 Inactive / Blocked' },
                  ]}
                />
              </div>
            </div>

            {/* Field HQ Specific Parameters */}
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

            {/* Area / Beat Specific Parameters */}
            {(type === 'Area' || type === 'Beat') && (
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

            {/* Modal Action Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={back}
                disabled={f.saving}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={f.saving}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: f.saving ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: f.saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                {f.saving ? 'Saving...' : item ? 'Update ' + type : 'Save ' + type}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
