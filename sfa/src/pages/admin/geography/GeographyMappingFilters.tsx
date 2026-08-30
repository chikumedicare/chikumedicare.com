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
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Row 1: Search & Reset */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '14px',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search representative name, employee code, login key, HQ or area..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
        </div>

        {isFiltersActive && (
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: '8px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✕</span>
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Row 2: Filter Selects */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '12.5px',
            fontWeight: 600,
            background: '#ffffff',
          }}
        >
          <option value="ALL">👔 All Field Roles</option>
          <option value="MR">MR (Medical Representative)</option>
          <option value="SR_MR">Sr. MR (Senior Medical Rep)</option>
          <option value="ASM">ASM (Area Sales Manager)</option>
          <option value="SR_ASM">Sr. ASM (Senior ASM)</option>
          <option value="RSM">RSM (Regional Manager)</option>
          <option value="ZSM">ZSM (Zonal Manager)</option>
          <option value="NSM">NSM (National Manager)</option>
          <option value="VP">VP (Vice President)</option>
        </select>

        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '12.5px',
            fontWeight: 600,
            background: '#ffffff',
          }}
        >
          <option value="ALL">🏢 All Divisions</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code || 'DIV'} - {d.name}
            </option>
          ))}
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '12.5px',
            fontWeight: 600,
            background: '#ffffff',
          }}
        >
          <option value="ALL">📍 All States</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={coverageFilter}
          onChange={(e) => setCoverageFilter(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '12.5px',
            fontWeight: 600,
            background: '#ffffff',
          }}
        >
          <option value="ALL">🗺️ All Coverage Status</option>
          <option value="MAPPED">🟢 Fully Mapped Only</option>
          <option value="UNMAPPED">⚠️ Pending / Unmapped Only</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '12.5px', color: '#64748b' }}>
          Showing <b>{totalFiltered}</b> of <b>{totalStaff}</b> representatives
        </div>
      </div>
    </div>
  );
}
