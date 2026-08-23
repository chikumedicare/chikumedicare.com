import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { Product } from '../../domain/master/fieldMaster.types';

export function ProductFormModal({
  product,
  onSave,
  onClose,
}: {
  product: Product | null;
  onSave: (draft: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const isEditing = !!product;

  const [productName, setProductName] = useState(product?.productName || '');
  const [productCode, setProductCode] = useState(product?.productCode || '');
  const [category, setCategory] = useState<any>(product?.category || 'TABLET');
  const [packSize, setPackSize] = useState(product?.packSize || '10x10 Strips');
  const [composition, setComposition] = useState(product?.composition || '');
  const [mrp, setMrp] = useState(String(product?.mrp || 150));
  const [pts, setPts] = useState(String(product?.pts || 110));
  const [ptr, setPtr] = useState(String(product?.ptr || 120));
  const [gstPercent, setGstPercent] = useState(String(product?.gstPercent || 12));
  const [isActive, setIsActive] = useState(product ? product.isActive : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) { setError('Product Name is required'); return; }

    setSaving(true);
    setError('');

    try {
      const draft: Partial<Product> = {
        id: product?.id,
        productCode: productCode.trim(),
        productName: productName.trim(),
        category,
        packSize,
        composition,
        mrp: Number(mrp) || 0,
        pts: Number(pts) || 0,
        ptr: Number(ptr) || 0,
        gstPercent: Number(gstPercent) || 12,
        isActive,
      };

      const res = await onSave(draft);
      if (res.success) onClose();
      else setError(res.error || 'Failed to save Product record');
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {isEditing ? '✏️ Edit Product Master Record' : '📦 Add New Pharmaceutical Product'}
            </h3>
            <small style={{ color: '#64748b' }}>Configure Product pricing (MRP, PTS, PTR) and packaging.</small>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <TextField
                label="Product Name *"
                value={productName}
                onChange={setProductName}
                placeholder="e.g. Chiku-CV 625 / Paracetamol 500"
              />
              <TextField
                label="Product Code"
                value={productCode}
                onChange={setProductCode}
                placeholder="e.g. PRD001"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <SelectField
                label="Category *"
                value={category}
                onChange={(v) => setCategory(v as any)}
                options={[
                  { v: 'TABLET', l: '💊 TABLET' },
                  { v: 'SYRUP', l: '🧪 SYRUP' },
                  { v: 'INJECTION', l: '💉 INJECTION' },
                  { v: 'CREAM', l: '🧴 CREAM / OINTMENT' },
                  { v: 'GEL', l: '💧 GEL' },
                  { v: 'SACHET', l: '✉️ SACHET' },
                  { v: 'CAPSULE', l: '💊 CAPSULE' },
                  { v: 'OTHER', l: '📦 OTHER' },
                ]}
              />
              <TextField
                label="Pack Size"
                value={packSize}
                onChange={setPackSize}
                placeholder="e.g. 10x10 Strips / 100ml Bottle"
              />
            </div>

            <TextField
              label="Active Composition"
              value={composition}
              onChange={setComposition}
              placeholder="e.g. Amoxycillin 500mg + Potassium Clavulanate 125mg"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
              <TextField
                label="MRP (₹) *"
                type="number"
                value={mrp}
                onChange={setMrp}
              />
              <TextField
                label="PTS (₹) *"
                type="number"
                value={pts}
                onChange={setPts}
              />
              <TextField
                label="PTR (₹) *"
                type="number"
                value={ptr}
                onChange={setPtr}
              />
              <TextField
                label="GST (%)"
                type="number"
                value={gstPercent}
                onChange={setGstPercent}
              />
            </div>

            <SelectField
              label="Status *"
              value={isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={(v) => setIsActive(v === 'ACTIVE')}
              options={[
                { v: 'ACTIVE', l: 'ACTIVE' },
                { v: 'INACTIVE', l: 'INACTIVE' },
              ]}
            />

            {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>⚠️ {error}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="secondary" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving} style={{ flex: 1, background: '#059669', borderColor: '#059669' }}>
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
