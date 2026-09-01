import React from 'react';
import type { Headquarter } from '../../../core/domain/hr/geography.types';

interface SfcMasterToolbarProps {
  q: string;
  setQ: (q: string) => void;
  originFilter: string;
  setOriginFilter: (origin: string) => void;
  travelTypeFilter: string;
  setTravelTypeFilter: (type: string) => void;
  hqs: Headquarter[];
}

export function SfcMasterToolbar({
  q,
  setQ,
  originFilter,
  setOriginFilter,
  travelTypeFilter,
  setTravelTypeFilter,
  hqs,
}: SfcMasterToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 12px',
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Search Input */}
      <input
        placeholder="Search origin, destination town, or category..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          flex: '1 1 220px',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
        }}
      />

      {/* Origin Location Filter */}
      <select
        value={originFilter}
        onChange={(e) => setOriginFilter(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
          fontWeight: 600,
          background: '#ffffff',
        }}
      >
        <option value="ALL">All Origin Locations</option>
        {hqs.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name || (h as any).hq_name} (HQ)
          </option>
        ))}
      </select>

      {/* Travel Category Filter */}
      <select
        value={travelTypeFilter}
        onChange={(e) => setTravelTypeFilter(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
          fontWeight: 600,
          background: '#ffffff',
        }}
      >
        <option value="ALL">All Travel Categories</option>
        <option value="EX_HQ">EX-HQ Only</option>
        <option value="OUTSTATION">OUTSTATION Only</option>
        <option value="LOCAL_HQ">LOCAL HQ Only</option>
      </select>
    </div>
  );
}
