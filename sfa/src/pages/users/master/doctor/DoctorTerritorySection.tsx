import React from 'react';

interface DoctorTerritorySectionProps {
  hqId: string;
  setHqId: (v: string) => void;
  hqs: any[];
  areaId: string;
  setAreaId: (v: string) => void;
  filteredAreas: any[];
  beatId: string;
  setBeatId: (v: string) => void;
  filteredBeats: any[];
}

export function DoctorTerritorySection({
  hqId,
  setHqId,
  hqs,
  areaId,
  setAreaId,
  filteredAreas,
  beatId,
  setBeatId,
  filteredBeats,
}: DoctorTerritorySectionProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>🗺️</span> Territory & Field Mapping
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Base Headquarter (HQ) *
          </label>
          <select
            className="form-select"
            value={hqId}
            onChange={(e) => setHqId(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {hqs.length === 0 && <option value="">Loading HQs...</option>}
            {hqs.map((h) => (
              <option key={h.id} value={h.id}>
                📍 {(h as any).name || (h as any).hq_name || (h as any).code || h.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Area / Town *
          </label>
          <select
            className="form-select"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {filteredAreas.length === 0 && <option value="">General Area / All Areas</option>}
            {filteredAreas.map((a) => (
              <option key={a.id} value={a.id}>
                🏘️ {(a as any).name || (a as any).area_name || (a as any).code || a.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Beat / Patch Route *
          </label>
          <select
            className="form-select"
            value={beatId}
            onChange={(e) => setBeatId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {filteredBeats.length === 0 && <option value="">Main Market Beat</option>}
            {filteredBeats.map((b) => (
              <option key={b.id} value={b.id}>
                🛣️ {(b as any).name || (b as any).beat_name || (b as any).code || b.id}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
