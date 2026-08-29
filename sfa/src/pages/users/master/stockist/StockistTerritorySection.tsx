import React from 'react';

interface StockistTerritorySectionProps {
  hqId: string;
  setHqId: (v: string) => void;
  hqs: any[];
  areaId: string;
  setAreaId: (v: string) => void;
  filteredAreas: any[];
}

export function StockistTerritorySection({
  hqId,
  setHqId,
  hqs,
  areaId,
  setAreaId,
  filteredAreas,
}: StockistTerritorySectionProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>🗺️</span> Territory Mapping
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Base HQ *
          </label>
          <select
            className="form-select"
            value={hqId}
            onChange={(e) => setHqId(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {hqs.length === 0 && <option value="">No HQs Found</option>}
            {hqs.map((h) => (
              <option key={h.id} value={h.id}>
                📍 {(h as any).name || (h as any).hq_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Area / Town
          </label>
          <select
            className="form-select"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {filteredAreas.length === 0 && <option value="">General Area</option>}
            {filteredAreas.map((a) => (
              <option key={a.id} value={a.id}>
                🏘️ {(a as any).name || (a as any).area_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
