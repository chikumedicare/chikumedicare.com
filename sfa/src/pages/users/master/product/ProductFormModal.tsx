import React, { useState } from 'react';
import type { Product } from '../../../../core/domain/master/fieldMaster.types';
import type { Division } from '../../../../core/domain/hr/headOffice.types';
import { getErrorMessage } from '../../../../utils/dataIntegrity';

interface ProductFormModalProps {
  product: Product | null;
  divisions?: Division[];
  onSave: (draft: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { v: 'TABLET', l: '💊 Tablet' },
  { v: 'CAPSULE', l: '💊 Capsule' },
  { v: 'SYRUP', l: '🧪 Syrup / Suspension' },
  { v: 'INJECTION', l: '💉 Injection / Vial' },
  { v: 'CREAM', l: '🧴 Cream' },
  { v: 'OINTMENT', l: '🧴 Ointment' },
  { v: 'GEL', l: '💧 Gel' },
  { v: 'LOTION', l: '🧴 Lotion / Solution' },
  { v: 'SERUM', l: '✨ Serum' },
  { v: 'FACEWASH', l: '🧼 Face Wash / Cleanser' },
  { v: 'SOAP', l: '🧼 Syndet Soap' },
  { v: 'SUNSCREEN', l: '☀️ Sunscreen' },
  { v: 'SHAMPOO', l: '🧴 Shampoo / Hair Care' },
  { v: 'DROPS', l: '💧 Eye / Ear Drops' },
  { v: 'SACHET', l: '✉️ Sachet Powder' },
  { v: 'OTHER', l: '📦 Other Formulation' },
];

export function ProductFormModal({
  product,
  divisions = [],
  onSave,
  onClose,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);

  // 1. Basic Info & Division
  const [productName, setProductName] = useState(product?.productName || '');
  const [productCode, setProductCode] = useState(product?.productCode || '');
  const [divisionId, setDivisionId] = useState(product?.divisionId || divisions[0]?.id || 'GENERAL');
  const [category, setCategory] = useState<any>(product?.category || 'TABLET');
  const [packSize, setPackSize] = useState(product?.packSize || '10x10 Strips');

  // 2. Composition & HSN
  const [composition, setComposition] = useState(product?.composition || '');
  

  // 3. Pricing
  const [mrp, setMrp] = useState(String(product?.mrp ?? 150));
  const [ptr, setPtr] = useState(String(product?.ptr ?? 120));
  const [pts, setPts] = useState(String(product?.pts ?? 110));
  const [nrv, setNrv] = useState(String(product?.nrv ?? 95));
  const [gstPercent, setGstPercent] = useState(String(product?.gstPercent ?? 12));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setError('Product Brand Name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const selectedDiv = divisions.find((d) => d.id === divisionId);
      const divisionName = selectedDiv ? (selectedDiv.name || (selectedDiv as any).division_name) : (divisionId === 'GENERAL' ? 'Main Division' : divisionId);

      const draft: Partial<Product> = {
        id: product?.id,
        productName: productName.trim(),
        productCode: productCode.trim() || undefined,
        divisionId,
        divisionName,
        category,
        packSize: packSize.trim() || undefined,
        composition: composition.trim() || undefined,
        
        mrp: Number(mrp) || 0,
        ptr: Number(ptr) || 0,
        pts: Number(pts) || 0,
        nrv: Number(nrv) || 0,
        gstPercent: Number(gstPercent) || 12,
        isActive: true,
      };

      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save Product record.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #0b1329 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🧪</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                {isEditing ? 'Edit Pharmaceutical Product' : 'Add New Product'}
              </h3>
              <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>
                Configure product brand, division assignment, formulation, and pricing.
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* ─── SECTION 1: Product Brand & Division ─── */}
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

            {/* ─── SECTION 2: Active Generic Composition ─── */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧪</span> Generic Composition
              </h4>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Active Generic Composition
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Amoxycillin 500mg + Potassium Clavulanate 125mg"
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* ─── SECTION 3: Commercial Pricing Structure ─── */}
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
          </div>

          {/* Sticky Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontWeight: 700,
                fontSize: '13.5px',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: '11px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontWeight: 700,
                fontSize: '13.5px',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                cursor: 'pointer',
              }}
            >
              {saving ? 'Saving Product Record...' : isEditing ? 'Update Product Details' : 'Save & Register Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ProductFormModal;
