import { getErrorMessage } from '../../utils/dataIntegrity';
import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { RoleDaSummary } from '../../core/domain/hr/leave.types';

export function BulkDaModal({
  roleSummaries = [],
  onBulkAdjust,
  onClose,
}: {
  roleSummaries: RoleDaSummary[];
  onBulkAdjust: (
    percent: number,
    fixed: number,
    targetRole?: string
  ) => Promise<{ success: boolean; error?: string; count?: number }>;
  onClose: () => void;
}) {
  const [targetRole, setTargetRole] = useState('ALL');
  const [adjustmentType, setAdjustmentType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [percent, setPercent] = useState('10');
  const [fixedAmount, setFixedAmount] = useState('50');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const filteredRoles = roleSummaries.filter((r) => targetRole === 'ALL' || r.role === targetRole);

  const calculateNewRate = (amount: number) => {
    if (adjustmentType === 'PERCENT') {
      const p = Number(percent) || 0;
      return Math.round(amount * (1 + p / 100));
    } else {
      const f = Number(fixedAmount) || 0;
      return Math.max(0, amount + f);
    }
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const p = adjustmentType === 'PERCENT' ? Number(percent) || 0 : 0;
      const f = adjustmentType === 'FIXED' ? Number(fixedAmount) || 0 : 0;

      const res = await onBulkAdjust(p, f, targetRole);
      if (res.success) {
        setSuccessCount(res.count || filteredRoles.length * 4);
      } else {
        setError(res.error || 'Bulk adjustment failed');
      }
    } catch (err: unknown) { setError(getErrorMessage(err)); } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '560px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        {!successCount ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                  ⚡ Bulk DA Rate Revision Wizard
                </h3>
                <small style={{ color: '#64748b' }}>Revise Daily Allowance slabs company-wide in 1 click.</small>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecute}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <SelectField
                    label="Target Roles *"
                    value={targetRole}
                    onChange={setTargetRole}
                    options={[
                      { v: 'ALL', l: `All Designations (${roleSummaries.length} Roles)` },
                      ...roleSummaries.map((r) => ({ v: r.role, l: `${r.role} Only` })),
                    ]}
                  />
                  <SelectField
                    label="Revision Type *"
                    value={adjustmentType}
                    onChange={(v) => setAdjustmentType(v === 'FIXED' ? 'FIXED' : 'PERCENT')}
                    options={[
                      { v: 'PERCENT', l: 'Percentage Increment (%)' },
                      { v: 'FIXED', l: 'Fixed Amount Increment (₹)' },
                    ]}
                  />
                </div>

                {adjustmentType === 'PERCENT' ? (
                  <TextField
                    label="Percentage Increase (%) *"
                    type="number"
                    value={percent}
                    onChange={setPercent}
                  />
                ) : (
                  <TextField
                    label="Fixed Amount Increase (₹ / Day) *"
                    type="number"
                    value={fixedAmount}
                    onChange={setFixedAmount}
                  />
                )}

                {/* Live Preview */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <b style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    🔍 Live Revision Preview ({filteredRoles.length} Roles):
                  </b>
                  <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                    {filteredRoles.map((r) => (
                      <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #e2e8f0' }}>
                        <span style={{ fontWeight: 600 }}>{r.role}:</span>
                        <span>
                          HQ: ₹{r.hq} ➔ <b style={{ color: '#16a34a' }}>₹{calculateNewRate(r.hq)}</b> |
                          OS: ₹{r.outstation} ➔ <b style={{ color: '#0284c7' }}>₹{calculateNewRate(r.outstation)}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>❌ {error}</div>}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="secondary" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={saving} style={{ flex: 1, background: '#0284c7', borderColor: '#0284c7' }}>
                  {saving ? 'Updating Rates...' : `Execute Revision (${filteredRoles.length} Roles) ➔`}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px' }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              DA Rates Successfully Revised!
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Updated <b>{successCount}</b> allowance rate tiers in Database with the new revision policy.
            </p>
            <button className="primary" onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#16a34a', borderColor: '#16a34a' }}>
              Done / Return to Master
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
