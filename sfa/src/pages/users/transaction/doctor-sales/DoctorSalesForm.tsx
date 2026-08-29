import React from 'react';
import type { DoctorProductQtyItem } from '../../../../core/domain/transaction/doctorSales.types';
import type { FYMonthOption } from '../primary-sales/PrimarySalesForm';

interface DoctorSalesFormProps {
  monthYear: string;
  items: DoctorProductQtyItem[];
  remarks: string;
  setRemarks: (r: string) => void;
  currentDoctor: any;
  currentFY: string;
  selectedMonthOption: FYMonthOption;
  isAlreadyEntered: boolean;
  totalQuantity: number;
  totalAmount: number;
  onQtyChange: (idx: number, qty: number) => void;
  onChangeContext: () => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
}

export function DoctorSalesForm({
  monthYear,
  items,
  remarks,
  setRemarks,
  currentDoctor,
  currentFY,
  selectedMonthOption,
  isAlreadyEntered,
  totalQuantity,
  totalAmount,
  onQtyChange,
  onChangeContext,
  onCancel,
  onSave,
}: DoctorSalesFormProps) {
  return (
    <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onChangeContext}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 14px', fontWeight: 800, fontSize: '13px', color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>←</span> Change Month / Doctor
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
              {currentDoctor.name} ({currentDoctor.specialty || 'Doctor'}) — {selectedMonthOption.label.split('—')[0]}
            </h3>
            <small style={{ color: '#64748b', fontSize: '11.5px' }}>
              HQ: {currentDoctor.hqName} • Patch: {currentDoctor.patchName || 'General'} • FY {currentFY}
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isAlreadyEntered
                ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
            }}
          >
            <span>{isAlreadyEntered ? '🔄' : '💾'}</span> {isAlreadyEntered ? 'Update Doctor Sales' : 'Save Doctor Sales'}
          </button>
        </div>
      </div>

      {/* Active Context Banner */}
      <div style={{ background: isAlreadyEntered ? '#f5f3ff' : '#ecfdf5', padding: '12px 18px', borderRadius: '12px', border: isAlreadyEntered ? '1px solid #ddd6fe' : '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{isAlreadyEntered ? '📝' : '🩺'}</span>
          <div>
            <b style={{ color: isAlreadyEntered ? '#6d28d9' : '#065f46', fontSize: '13.5px' }}>
              {isAlreadyEntered ? 'Editing Saved Doctor Support' : 'New Doctor Support Entry'} for {currentDoctor.name} ({currentDoctor.degree || 'MBBS'})
            </b>
            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
              Month: <b>{monthYear}</b> • HQ: {currentDoctor.hqName} • Clinic/Patch: {currentDoctor.patchName || 'Main Clinic'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onChangeContext}
          style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}
        >
          🔄 Change Month
        </button>
      </div>

      {/* Product Quantity Matrix Table */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📦</span> Enter Monthly Product Prescription / Support Quantities
        </h4>

        <div className="panel table" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '45%' }}>Product Brand & Pack Size</th>
                <th style={{ width: '15%' }}>Rate (₹)</th>
                <th style={{ width: '20%' }}>Prescribed Qty (Units) *</th>
                <th style={{ width: '20%' }}>Total Doctor Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, idx) => (
                <tr key={p.productId}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '13.5px' }}>{p.productName}</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Pack: {p.packSize}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>
                      ₹{p.rate.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={p.quantity === 0 ? '' : p.quantity}
                      placeholder="0"
                      onChange={(e) => onQtyChange(idx, Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        maxWidth: '140px',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: p.quantity > 0 ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                        background: p.quantity > 0 ? '#f5f3ff' : '#fff',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: p.quantity > 0 ? '#6d28d9' : '#0f172a',
                      }}
                    />
                  </td>
                  <td>
                    <b style={{ color: p.amount > 0 ? '#7c3aed' : '#94a3b8', fontSize: '14px' }}>
                      ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Doctor Prescription & Support Notes
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Regular prescriber for D-Cal 500, assured 50 packs monthly..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#6d28d9', fontWeight: 700 }}>
            <span>Total Prescribed Units:</span>
            <span>{totalQuantity.toLocaleString('en-IN')} Units</span>
          </div>
          <div style={{ height: '1px', background: '#cbd5e1', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#0f172a', fontWeight: 900 }}>
            <span>Total Doctor Business Value:</span>
            <span style={{ color: '#7c3aed', fontSize: '19px' }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
