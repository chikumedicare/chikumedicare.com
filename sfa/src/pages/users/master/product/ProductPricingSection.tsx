import React from 'react';

interface ProductPricingSectionProps {
  mrp: string;
  setMrp: (v: string) => void;
  ptr: string;
  setPtr: (v: string) => void;
  pts: string;
  setPts: (v: string) => void;
  nrv: string;
  setNrv: (v: string) => void;
  gstPercent: string;
  setGstPercent: (v: string) => void;
}

export function ProductPricingSection({
  mrp,
  setMrp,
  ptr,
  setPtr,
  pts,
  setPts,
  nrv,
  setNrv,
  gstPercent,
  setGstPercent,
}: ProductPricingSectionProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>💰</span> Commercial Pricing & Taxes (INR ₹)
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            MRP (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="150.00"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <small style={{ color: '#64748b', fontSize: '11px' }}>Max Retail</small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            PTR (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="120.00"
            value={ptr}
            onChange={(e) => setPtr(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <small style={{ color: '#64748b', fontSize: '11px' }}>To Chemist</small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            PTS (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="110.00"
            value={pts}
            onChange={(e) => setPts(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <small style={{ color: '#64748b', fontSize: '11px' }}>To Stockist</small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            NRV (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="95.00"
            value={nrv}
            onChange={(e) => setNrv(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <small style={{ color: '#64748b', fontSize: '11px' }}>Net Realized</small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            GST Rate *
          </label>
          <select
            className="form-select"
            value={gstPercent}
            onChange={(e) => setGstPercent(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            <option value="0">0%</option>
            <option value="5">5%</option>
            <option value="12">12%</option>
            <option value="18">18%</option>
            <option value="28">28%</option>
          </select>
          <small style={{ color: '#64748b', fontSize: '11px' }}>Tax Slab</small>
        </div>
      </div>
    </div>
  );
}
