import { getErrorMessage } from '../../utils/dataIntegrity';
import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { SfaUser } from '../../core/domain/hr/user.types';

export function BulkLeaveModal({
  users = [],
  currentFY = '2026-27',
  onBulkAllocate,
  onClose,
}: {
  users?: SfaUser[];
  currentFY?: string;
  onBulkAllocate: (
    year: string,
    cl: number,
    sl: number,
    pl: number,
    role?: string,
    overwrite?: boolean
  ) => Promise<{ success: boolean; error?: string; count?: number }>;
  onClose: () => void;
}) {
  const [year, setYear] = useState(currentFY);
  const [role, setRole] = useState('ALL');
  const [cl, setCl] = useState('12');
  const [sl, setSl] = useState('10');
  const [pl, setPl] = useState('15');
  const [overwrite, setOverwrite] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const fieldUsers = users.filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER');
  const eligibleUsers = fieldUsers.filter((u) => role === 'ALL' || u.role === role);

  const totalPool = (Number(cl) || 0) + (Number(sl) || 0) + (Number(pl) || 0);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await onBulkAllocate(
        year,
        Number(cl) || 0,
        Number(sl) || 0,
        Number(pl) || 0,
        role,
        overwrite
      );

      if (res.success) {
        setSuccessCount(res.count || eligibleUsers.length);
      } else {
        setError(res.error || 'Bulk allocation failed');
      }
    } catch (err: unknown) { setError(getErrorMessage(err)); } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        {!successCount ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                  ⚡ Bulk Annual Leave Allocation
                </h3>
                <small style={{ color: '#64748b' }}>Allocate annual entitlements to all field staff in 1 click.</small>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <SelectField
                    label="Target Financial Year *"
                    value={year}
                    onChange={setYear}
                    options={[
                      { v: '2026-27', l: 'FY 2026-27 (Current Active)' },
                      { v: '2027-28', l: 'FY 2027-28 (Upcoming FY)' },
                      { v: '2025-26', l: 'FY 2025-26 (Past FY)' },
                    ]}
                  />
                  <SelectField
                    label="Target Role Filter *"
                    value={role}
                    onChange={setRole}
                    options={[
                      { v: 'ALL', l: `All Field Staff (${fieldUsers.length} reps)` },
                      { v: 'MR', l: 'MR Only' },
                      { v: 'ASM', l: 'ASM Only' },
                      { v: 'RSM', l: 'RSM Only' },
                      { v: 'ZSM', l: 'ZSM Only' },
                      { v: 'NSM', l: 'NSM Only' },
                      { v: 'VP', l: 'VP Only' },
                    ]}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <TextField
                    label="CL Days *"
                    type="number"
                    value={cl}
                    onChange={setCl}
                  />
                  <TextField
                    label="SL Days *"
                    type="number"
                    value={sl}
                    onChange={setSl}
                  />
                  <TextField
                    label="PL Days *"
                    type="number"
                    value={pl}
                    onChange={setPl}
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Target Representatives:</span>
                    <b>{eligibleUsers.length} Employees</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Leave Pool Per Rep:</span>
                    <b style={{ color: '#16a34a' }}>{totalPool} Days</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Days to Credit:</span>
                    <b style={{ color: '#0284c7' }}>{eligibleUsers.length * totalPool} Days</b>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={overwrite}
                    onChange={(e) => setOverwrite(e.target.checked)}
                  />
                  <span>Overwrite existing allocations for <b>{year}</b> if already present</span>
                </label>

                {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>❌ {error}</div>}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="secondary" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={saving} style={{ flex: 1, background: '#0284c7', borderColor: '#0284c7' }}>
                  {saving ? 'Allocating Leaves...' : `Allocate to ${eligibleUsers.length} Staff ➔`}
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
              Bulk Allocation Completed!
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
              Successfully created and synced annual leave balances for <b>{successCount}</b> field representatives for Financial Year <b>{year}</b>.
            </p>
            <button className="primary" onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#16a34a', borderColor: '#16a34a' }}>
              Done / Return to Ledger
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
