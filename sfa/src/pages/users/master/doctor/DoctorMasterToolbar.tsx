import React from 'react';
import type { Headquarter } from '../../../../core/domain/hr/geography.types';

interface DoctorMasterToolbarProps {
  q: string;
  setQ: (q: string) => void;
  hqFilter: string;
  setHqFilter: (hq: string) => void;
  classFilter: string;
  setClassFilter: (c: string) => void;
  hqs: Headquarter[];
}

export function DoctorMasterToolbar({
  q,
  setQ,
  hqFilter,
  setHqFilter,
  classFilter,
  setClassFilter,
  hqs,
}: DoctorMasterToolbarProps) {
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
        placeholder="Search Doctor by Name, Speciality, Qualification, HQ, or City..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          flex: '1 1 240px',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
        }}
      />

      {/* HQ Filter */}
      <select
        value={hqFilter}
        onChange={(e) => setHqFilter(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
          fontWeight: 600,
          background: '#ffffff',
        }}
      >
        <option value="ALL">All Base HQs</option>
        {hqs.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name || (h as any).hq_name} (HQ)
          </option>
        ))}
      </select>

      {/* Class Filter */}
      <select
        value={classFilter}
        onChange={(e) => setClassFilter(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
          fontWeight: 600,
          background: '#ffffff',
        }}
      >
        <option value="ALL">All Doctor Classes</option>
        <option value="VIP">Class VIP</option>
        <option value="A">Class A</option>
        <option value="B">Class B</option>
        <option value="C">Class C</option>
      </select>
    </div>
  );
}
