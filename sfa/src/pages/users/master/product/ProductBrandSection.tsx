import React from 'react';

interface ProductBrandSectionProps {
  productName: string;
  setProductName: (v: string) => void;
  productCode: string;
  setProductCode: (v: string) => void;
  divisionId: string;
  setDivisionId: (v: string) => void;
  divisions: any[];
  category: string;
  setCategory: (v: any) => void;
  packSize: string;
  setPackSize: (v: string) => void;
  CATEGORY_OPTIONS: Array<{ v: string; l: string }>;
}

export function ProductBrandSection({
  productName,
  setProductName,
  productCode,
  setProductCode,
  divisionId,
  setDivisionId,
  divisions,
  category,
  setCategory,
  packSize,
  setPackSize,
  CATEGORY_OPTIONS,
}: ProductBrandSectionProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>📦</span> Brand & Division Mapping
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Product / Brand Name *
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Chiku-CV 625 / Gluta-Glow Serum"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Product Code / SKU
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. PRD-001"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Division *
          </label>
          <select
            className="form-select"
            value={divisionId}
            onChange={(e) => setDivisionId(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {divisions.length > 0 ? (
              divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  🏢 {(d as any).name || (d as any).division_name}
                </option>
              ))
            ) : (
              <>
                <option value="GENERAL">🏢 Main Pharma Division</option>
                <option value="DERMA">🧴 Derma Care Division</option>
                <option value="COSMETIC">✨ Cosmetic & Aesthetics</option>
                <option value="CARDIAC">❤️ Cardiac & Diabetic</option>
                <option value="ALL">🌐 All Divisions (Universal)</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Dosage Category / Form *
          </label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.v} value={opt.v}>
                {opt.l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Pack Size / Packaging *
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 10x10 Strips / 50g Tube"
            value={packSize}
            onChange={(e) => setPackSize(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>
    </div>
  );
}
