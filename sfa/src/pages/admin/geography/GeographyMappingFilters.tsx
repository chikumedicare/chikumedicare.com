import React from 'react';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import type { State } from '../../../core/domain/hr/geography.types';

interface GeographyMappingFiltersProps {
  q: string;
  setQ: (v: string) => void;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
  divisionFilter: string;
  setDivisionFilter: (v: string) => void;
  stateFilter: string;
  setStateFilter: (v: string) => void;
  coverageFilter: string;
  setCoverageFilter: (v: string) => void;
  divisions: Division[];
  states: State[];
  onReset: () => void;
  isFiltersActive: boolean;
  totalFiltered: number;
  totalStaff: number;
}

export function GeographyMappingFilters({
  q,
  setQ,
  roleFilter,
  setRoleFilter,
  divisionFilter,
  setDivisionFilter,
  stateFilter,
  setStateFilter,
  coverageFilter,
  setCoverageFilter,
  divisions,
  states,
  onReset,
  isFiltersActive,
  totalFiltered,
  totalStaff,
}: GeographyMappingFiltersProps) {
  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    fontWeight: 600,
    background: '#ffffff',
    height: '32px',
    outline: 'none',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '10px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '8px 12px',
      }}
    >
      {/* Compact Search Input */}
      <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 220px' }}>
        <span
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '12px',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search rep name, emp code, HQ..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%',
            height: '32px',
            padding: '4px 10px 4px 30px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '12px',
            outline: 'none',
            background: '#f8fafc',
          }}
        />
      </div>

      {/* Filter Selects */}
      <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
        <option value="ALL">👔 All Roles</option>
        <option value="MR">MR</option>
        <option value="SR_MR">Sr. MR</option>
        <option value="ASM">ASM</option>
        <option value="SR_ASM">Sr. ASM</option>
        <option value="RSM">RSM</option>
        <option value="ZSM">ZSM</option>
        <option value="NSM">NSM</option>
        <option value="VP">VP</option>
      </select>

      <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)} style={selectStyle}>
        <option value="ALL">🏢 All Divisions</option>
        {divisions.map((d) => (
          <option key={d.id} value={d.id}>
            {d.code || 'DIV'} - {d.name}
          </option>
        ))}
      </select>

      <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={selectStyle}>
        <option value="ALL">📍 All States</option>
        {states.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select value={coverageFilter} onChange={(e) => setCoverageFilter(e.target.value)} style={selectStyle}>
        <option value="ALL">🗺️ All Coverage</option>
        <option value="MAPPED">🟢 Mapped</option>
        <option value="UNMAPPED">⚠️ Pending</option>
      </select>

      {isFiltersActive && (
        <button
          type="button"
          onClick={onReset}
          style={{
            height: '32px',
            padding: '4px 10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ✕ Reset
        </button>
      )}

      <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
        <b>{totalFiltered}</b> of <b>{totalStaff}</b> Reps
      </div>
    </div>
  );
}
