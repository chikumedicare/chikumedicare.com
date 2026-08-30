import React from 'react';
import type { Headquarter } from '../../../core/domain/hr/geography.types';

interface CoverageManagerHqsSectionProps {
  role: string;
  hqId: string;
  coveringHqIds: string[];
  hqs: Headquarter[];
  getStateName: (id?: string) => string;
  toggleCoveringHq: (id: string) => void;
  selectAllCoveringHqs: () => void;
  deselectAllCoveringHqs: () => void;
  cascadedAreaCount: number;
}

export function CoverageManagerHqsSection({
  role,
  hqId,
  coveringHqIds,
  hqs,
  getStateName,
  toggleCoveringHq,
  selectAllCoveringHqs,
  deselectAllCoveringHqs,
  cascadedAreaCount,
}: CoverageManagerHqsSectionProps) {
  const availableHqs = hqs.filter((h) => h.id !== hqId);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
            2. Multi-HQ Supervision ({coveringHqIds.length} Covering HQs Selected)
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
            Select additional branch headquarters supervised by this {role}:
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={selectAllCoveringHqs}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAllCoveringHqs}
            style={{ padding: '4px 10px', fontSize: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Clear All
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
        {availableHqs.map((h) => {
          const checked = coveringHqIds.includes(h.id);
          const stateLabel = getStateName(h.stateId);
          return (
            <label
              key={h.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '12.5px',
                padding: '8px 12px',
                background: checked ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${checked ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '8px',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCoveringHq(h.id)}
                style={{ marginTop: '3px' }}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{h.code} - {h.name}</div>
                {stateLabel && <div style={{ fontSize: '11px', color: '#64748b' }}>State: {stateLabel}</div>}
              </div>
            </label>
          );
        })}
        {availableHqs.length === 0 && (
          <div style={{ color: '#64748b', fontSize: '13px', padding: '8px' }}>
            No additional headquarters available to assign.
          </div>
        )}
      </div>

      <div style={{ marginTop: '10px', padding: '8px 12px', background: '#e0f2fe', borderRadius: '8px', fontSize: '12px', color: '#0369a1' }}>
        ℹ️ <b>Automatic Territory Cascade:</b> All <b>{cascadedAreaCount}</b> territory beat areas under selected Base & Covering HQs will automatically map to this {role}.
      </div>
    </div>
  );
}
