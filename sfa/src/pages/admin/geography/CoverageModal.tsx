import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import { Section } from '../../../components/Section';
import { SelectField } from '../../../components/FormFields';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import type { Headquarter, Area, Beat, State } from '../../../core/domain/hr/geography.types';

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
  const managerCascadeAreaIds = areas.filter((a) => Boolean(a.hqId && (allSupervisedHqIds as any).includes(a.hqId))).map((a) => a.id);

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
    <>
      <Head
        title={`Manage Territory Coverage: ${user.fullName}`}
        sub={`${user.role} • ${user.designation || 'Field Representative'} (${user.empCode || user.userId})`}
      />

      <div className="formGrid">
        <Section title="1. Primary Base Headquarter (Base HQ)">
          <div style={{ marginBottom: '10px' }}>
            <SelectField
              label="Assigned Base HQ *"
              value={hqId}
              onChange={(v) => {
                setHqId(v);
                if (user.role === 'MR' || user.role === 'SR_MR') setAreaIds([]);
              }}
              options={hqs.map((h) => ({
                v: h.id,
                l: `${h.code} - ${h.name}${getStateName(h.stateId) ? ` (${getStateName(h.stateId)})` : ''}`,
              }))}
            />
          </div>
        </Section>

        {user.role !== 'MR' && user.role !== 'SR_MR' && (
          <Section title={`2. Multi-HQ Supervision (Covering HQs: ${coveringHqIds.length} Selected)`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p className="muted" style={{ margin: 0, fontSize: '13px' }}>
                Select additional headquarters overseen by this {user.role}:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={selectAllCoveringHqs}
                  style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={deselectAllCoveringHqs}
                  style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {hqs
                .filter((h) => h.id !== hqId)
                .map((h) => {
                  const checked = coveringHqIds.includes(h.id);
                  const stateLabel = getStateName(h.stateId);
                  return (
                    <label
                      key={h.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        padding: '8px 10px',
                        background: checked ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${checked ? '#86efac' : '#e2e8f0'}`,
                        borderRadius: '8px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCoveringHq(h.id)}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <b>{h.code}</b> - {h.name}
                        {stateLabel && (
                          <small style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>
                            State: {stateLabel}
                          </small>
                        )}
                      </div>
                    </label>
                  );
                })}
              {hqs.filter((h) => h.id !== hqId).length === 0 && (
                <div style={{ color: '#64748b', fontSize: '13px' }}>No additional HQs available.</div>
              )}
            </div>
            <div style={{ marginTop: '12px', padding: '10px 12px', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '12px', color: '#0369a1' }}>
              ℹ️ <b>Automatic Area & Beat Cascade:</b> All <b>{managerCascadeAreaIds.length}</b> territory areas falling under selected Base & Covering HQs will automatically map to this {user.role}.
            </div>
          </Section>
        )}

        {(user.role === 'MR' || user.role === 'SR_MR') && (
          <Section title={`2. Field Area Coverage (Assigned Areas: ${areaIds.length} of ${relevantAreas.length} Selected)`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p className="muted" style={{ margin: 0, fontSize: '13px' }}>
                Select territory areas and customer beats assigned to this Medical Representative:
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={selectAllAreas}
                  style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                >
                  Select All Areas
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={deselectAllAreas}
                  style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
              {relevantAreas.map((a) => {
                const checked = areaIds.includes(a.id);
                const areaBeats = beats.filter((b) => b.areaId === a.id);

                return (
                  <label
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: '10px 12px',
                      background: checked ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${checked ? '#86efac' : '#e2e8f0'}`,
                      borderRadius: '8px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleArea(a.id)}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <b>{a.code} - {a.name}</b>
                        <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {a.territoryType || 'LOCAL'}
                        </span>
                      </div>
                      <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                        {areaBeats.length > 0
                          ? `📍 ${areaBeats.length} Beats: ${areaBeats.map((b) => b.name).join(', ')}`
                          : '📍 No sub-beats configured'}
                      </small>
                    </div>
                  </label>
                );
              })}
              {relevantAreas.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '13px', padding: '10px' }}>
                  No field areas configured for this Base HQ. Add areas under Field Geography Master.
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '12px' }}>
          ❌ {error}
        </div>
      )}

      <div className="actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="secondary" onClick={back} disabled={saving}>Cancel</button>
        <button className="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving Territory Coverage...' : 'Save Territory Coverage'}
        </button>
      </div>
    </>
  );
}
