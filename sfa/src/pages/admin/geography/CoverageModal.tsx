import React, { useState } from 'react';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import type { Headquarter, Area, Beat, State } from '../../../core/domain/hr/geography.types';
import { CoverageManagerHqsSection } from './CoverageManagerHqsSection';
import { CoverageMrAreasSection } from './CoverageMrAreasSection';

interface CoverageModalProps {
  user: SfaUser | null;
  hqs: Headquarter[];
  areas: Area[];
  beats?: Beat[];
  states?: State[];
  onSave: (userId: string, coverage: { hqId: string; coveringHqIds: string[]; areaIds: string[] }) => Promise<{ success: boolean; error?: string }>;
  back: () => void;
}

export function CoverageModal({
  user,
  hqs,
  areas,
  beats = [],
  states = [],
  onSave,
  back,
}: CoverageModalProps) {
  const [hqId, setHqId] = useState(user?.hqId || hqs[0]?.id || '');
  const [coveringHqIds, setCoveringHqIds] = useState<string[]>(user?.coveringHqIds || []);
  const [areaIds, setAreaIds] = useState<string[]>(user?.areaIds || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const toggleCoveringHq = (id: string) => {
    setCoveringHqIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllCoveringHqs = () => {
    setCoveringHqIds(hqs.filter((h) => h.id !== hqId).map((h) => h.id));
  };

  const deselectAllCoveringHqs = () => {
    setCoveringHqIds([]);
  };

  const toggleArea = (id: string) => {
    setAreaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const relevantAreas = areas.filter((a) => !hqId || a.hqId === hqId);

  const selectAllAreas = () => {
    setAreaIds(relevantAreas.map((a) => a.id));
  };

  const deselectAllAreas = () => {
    setAreaIds([]);
  };

  const getStateName = (stateId?: string) => {
    if (!stateId) return '';
    return states.find((s) => s.id === stateId)?.name || '';
  };

  const isFieldRep = user.role === 'MR' || user.role === 'SR_MR';
  const allSupervisedHqIds = Array.from(new Set([hqId, ...coveringHqIds].filter(Boolean)));
  const managerCascadeAreaIds = areas.filter((a) => Boolean(a.hqId && allSupervisedHqIds.includes(a.hqId))).map((a) => a.id);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const finalAreaIds = isFieldRep ? areaIds : managerCascadeAreaIds;
      const res = await onSave(user.id, {
        hqId,
        coveringHqIds,
        areaIds: finalAreaIds,
      });
      if (res.success) {
        back();
      } else if (res.error) {
        setError(res.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              🗺️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                Territory Coverage: {user.fullName}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{user.role}</span> • {user.designation || 'Field Representative'} ({user.userId})
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={back}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Section 1: Base HQ */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              1. Assigned Base Headquarter (Primary Station) *
            </label>
            <select
              value={hqId}
              onChange={(e) => {
                setHqId(e.target.value);
                if (isFieldRep) setAreaIds([]);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                fontWeight: 600,
                background: '#ffffff',
              }}
            >
              <option value="">Select Base Headquarter...</option>
              {hqs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.code} - {h.name} {getStateName(h.stateId) ? `(${getStateName(h.stateId)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Section 2 For Managers: Covering HQs */}
          {!isFieldRep && (
            <CoverageManagerHqsSection
              role={user.role}
              hqId={hqId}
              coveringHqIds={coveringHqIds}
              hqs={hqs}
              getStateName={getStateName}
              toggleCoveringHq={toggleCoveringHq}
              selectAllCoveringHqs={selectAllCoveringHqs}
              deselectAllCoveringHqs={deselectAllCoveringHqs}
              cascadedAreaCount={managerCascadeAreaIds.length}
            />
          )}

          {/* Section 2 For MRs: Assigned Beat Areas */}
          {isFieldRep && (
            <CoverageMrAreasSection
              relevantAreas={relevantAreas}
              areaIds={areaIds}
              beats={beats}
              toggleArea={toggleArea}
              selectAllAreas={selectAllAreas}
              deselectAllAreas={deselectAllAreas}
            />
          )}

          {error && (
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '12.5px' }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: '#f8fafc',
          }}
        >
          <button
            type="button"
            onClick={back}
            disabled={saving}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 22px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
          >
            {saving ? 'Saving Live Coverage...' : 'Save Territory Coverage'}
          </button>
        </div>
      </div>
    </div>
  );
}
