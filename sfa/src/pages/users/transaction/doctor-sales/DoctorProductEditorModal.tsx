import React, { useState, useEffect } from 'react';
import type { DoctorProductQtyItem } from '../../../../core/domain/transaction/doctorSales.types';

interface DoctorProductEditorModalProps {
  doctor: any;
  monthYear: string;
  currentFY: string;
  initialItems: DoctorProductQtyItem[];
  allProducts: { id: string; name: string; packSize: string; rate: number }[];
  onSave: (items: DoctorProductQtyItem[], remarks?: string) => void;
  onClose: () => void;
}

export function DoctorProductEditorModal({
  doctor,
  monthYear,
  currentFY,
  initialItems,
  allProducts,
  onSave,
  onClose,
}: DoctorProductEditorModalProps) {
  const [items, setItems] = useState<DoctorProductQtyItem[]>([]);
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    const list = allProducts.map((p) => {
      const saved = initialItems.find((i) => i.productId === p.id);
      return {
        productId: p.id,
        productName: p.name,
        packSize: p.packSize,
        rate: p.rate,
        quantity: saved ? saved.quantity : 0,
        amount: saved ? saved.amount : 0,
      };
    });
    setItems(list);
  }, [allProducts, initialItems]);

  const handleQtyChange = (idx: number, qty: number) => {
    setItems((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], quantity: qty, amount: qty * clone[idx].rate };
      return clone;
    });
  };

  const totalQuantity = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxWidth: '780px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              🩺 {doctor.name} ({doctor.specialty || 'Doctor'})
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              {doctor.degree || 'MBBS'} • HQ: {doctor.hqName} • Month: <b>{monthYear}</b> (FY {currentFY})
            </small>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, fontSize: '12px', color: '#475569', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Product Table (Scrollable) */}
        <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: '45%' }}>Product Brand & Pack</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: '15%' }}>Rate (₹)</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: '20%' }}>Prescribed Qty (Units)</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: '20%' }}>Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, idx) => (
                <tr key={p.productId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <b style={{ color: '#0f172a' }}>{p.productName}</b>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Pack: {p.packSize}</div>
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#475569' }}>
                    ₹{p.rate.toFixed(2)}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <input
                      type="number"
                      min="0"
                      value={p.quantity === 0 ? '' : p.quantity}
                      placeholder="0"
                      onChange={(e) => handleQtyChange(idx, Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        maxWidth: '120px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: p.quantity > 0 ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                        background: p.quantity > 0 ? '#f5f3ff' : '#fff',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: p.quantity > 0 ? '#6d28d9' : '#0f172a',
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 800, color: p.amount > 0 ? '#7c3aed' : '#94a3b8' }}>
                    ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
              Total Rx Units: <b style={{ color: '#6d28d9', fontSize: '15px' }}>{totalQuantity.toLocaleString('en-IN')} Units</b>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
              Doctor Value: <b style={{ color: '#059669', fontSize: '16px' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(items.filter((i) => i.quantity > 0), remarks)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                cursor: 'pointer',
              }}
            >
              💾 Save for {doctor.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
