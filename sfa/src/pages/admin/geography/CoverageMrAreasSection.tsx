import React from 'react';
import type { Area, Beat } from '../../../core/domain/hr/geography.types';

interface CoverageMrAreasSectionProps {
  relevantAreas: Area[];
  areaIds: string[];
  beats: Beat[];
  toggleArea: (id: string) => void;
  selectAllAreas: () => void;
  deselectAllAreas: () => void;
}

export function CoverageMrAreasSection({
  relevantAreas,
  areaIds,
  beats,
  toggleArea,
  selectAllAreas,
  deselectAllAreas,
}: CoverageMrAreasSectionProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
            2. Assigned Beat Areas ({areaIds.length} of {relevantAreas.length} Areas Selected)
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
            Select customer call areas and doctor beats assigned to this representative:
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={selectAllAreas}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Select All Areas
          </button>
          <button
            type="button"
            onClick={deselectAllAreas}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px', maxHeight: '220px', overflowY: 'auto', padding: '4px' }}>
        {relevantAreas.map((a) => {
          const checked = areaIds.includes(a.id);
          const areaBeats = beats.filter((b) => b.areaId === a.id);

          return (
            <label
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12.5px',
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
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{a.code} - {a.name}</span>
                  <span style={{ fontSize: '10px', color: '#64748b', background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                    {a.territoryType || 'LOCAL'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                  {areaBeats.length > 0
                    ? `📍 ${areaBeats.length} Beats: ${areaBeats.map((b) => b.name).join(', ')}`
                    : '📍 No sub-beats configured'}
                </div>
              </div>
            </label>
          );
        })}

        {relevantAreas.length === 0 && (
          <div style={{ color: '#64748b', fontSize: '13px', padding: '12px' }}>
            No field areas configured for this Base HQ. Add areas under Field Geography Master.
          </div>
        )}
      </div>
    </div>
  );
}
