import React from 'react';
import { SelectField } from '../../../components/FormFields';
import type { TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area, Beat } from '../../../core/domain/hr/geography.types';

interface DivisionAndParentHierarchySectionProps {
  type: TerritoryType;
  item: Zone | State | Headquarter | Area | Beat | null;
  isHoHq: boolean;
  divisionId: string;
  setDivisionId: (v: string) => void;
  parentId: string;
  setParentId: (v: string) => void;
  setError: (err: string) => void;
  divisions: Array<{ id: string; code: string; name: string }>;
  filteredZones: Zone[];
  filteredStates: State[];
  filteredHqs: Headquarter[];
  filteredAreas: Area[];
}

export function DivisionAndParentHierarchySection({
  type,
  item,
  isHoHq,
  divisionId,
  setDivisionId,
  parentId,
  setParentId,
  setError,
  divisions,
  filteredZones,
  filteredStates,
  filteredHqs,
  filteredAreas,
}: DivisionAndParentHierarchySectionProps) {
  if (isHoHq) return null;

  return (
    <>
      {/* Section 1: Division Assignment */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>💼</span> <span>1. Strategic Marketing Division Assignment</span>
        </div>
        <SelectField
          label={'Division * ' + (item ? '(Immutable in Edit Mode)' : '')}
          value={divisionId}
          onChange={(v) => setDivisionId(v)}
          disabled={!!item}
          options={[
            { v: '', l: '-- Select Division --' },
            ...divisions.map((d) => ({ v: d.id, l: d.code + ' - ' + d.name })),
          ]}
        />
      </div>

      {/* Section 2: Parent Territory Hierarchy */}
      {type !== 'Zone' && (
        <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔗</span> <span>2. Parent Territory Hierarchy</span>
          </div>
          {type === 'State' && (
            <SelectField
              label="Parent Zone *"
              value={parentId}
              onChange={(v) => { setParentId(v); setError(''); }}
              disabled={!divisionId}
              options={[
                { v: '', l: '-- Select Parent Zone --' },
                ...filteredZones.map((z) => ({ v: z.id, l: z.code + ' - ' + z.name })),
              ]}
            />
          )}
          {type === 'HQ' && (
            <SelectField
              label="Parent State *"
              value={parentId}
              onChange={(v) => { setParentId(v); setError(''); }}
              disabled={!divisionId}
              options={[
                { v: '', l: '-- Select Parent State --' },
                ...filteredStates.map((s) => ({ v: s.id, l: s.code + ' - ' + s.name })),
              ]}
            />
          )}
          {type === 'Area' && (
            <SelectField
              label="Parent Headquarter (HQ) *"
              value={parentId}
              onChange={(v) => { setParentId(v); setError(''); }}
              disabled={!divisionId}
              options={[
                { v: '', l: '-- Select Parent HQ --' },
                ...filteredHqs.map((h) => ({ v: h.id, l: h.code + ' - ' + h.name })),
              ]}
            />
          )}
          {type === 'Beat' && (
            <SelectField
              label="Parent Area *"
              value={parentId}
              onChange={(v) => { setParentId(v); setError(''); }}
              disabled={!divisionId}
              options={[
                { v: '', l: '-- Select Parent Area --' },
                ...filteredAreas.map((a) => ({ v: a.id, l: a.code + ' - ' + a.name })),
              ]}
            />
          )}
        </div>
      )}
    </>
  );
}
