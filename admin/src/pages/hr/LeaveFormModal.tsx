import React, { useState } from 'react';
import { TextField, SelectField } from '../../components/FormFields';
import type { LeaveAllocation } from '../../domain/hr/leave.types';
import type { SfaUser } from '../../domain/hr/user.types';
import type { Employee } from '../../domain/hr/employee.types';

export function LeaveFormModal({
  allocation,
  users = [],
  employees = [],
  currentFY = '2026-27',
  onSave,
  onClose,
}: {
  allocation: LeaveAllocation | null;
  users?: SfaUser[];
  employees?: Employee[];
  currentFY?: string;
  onSave: (draft: Partial<LeaveAllocation>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const fieldUsers = users.filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER');

  const [employeeId, setEmployeeId] = useState(allocation?.employeeId || fieldUsers[0]?.id || '');
  const [year, setYear] = useState(allocation?.year || currentFY);
  const [cl, setCl] = useState(allocation?.cl != null ? String(allocation.cl) : '12');
  const [sl, setSl] = useState(allocation?.sl != null ? String(allocation.sl) : '10');
  const [pl, setPl] = useState(allocation?.pl != null ? String(allocation.pl) : '15');
  const [isActive, setIsActive] = useState(allocation ? allocation.isActive : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedUser = users.find((u) => u.id === employeeId);
  const selectedEmp = employees.find((e) => e.id === employeeId || e.empCode === selectedUser?.empCode);

  const totalPool = (Number(cl) || 0) + (Number(sl) || 0) + (Number(pl) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Please select an employee');
      return;
    }
    if (!year) {
      setError('Please select a Financial Year');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const empName = selectedUser?.fullName || (selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : 'Employee');
      const draft: Partial<LeaveAllocation> = {
        id: allocation?.id,
        employeeId,
        employeeName: empName,
        designation: selectedUser?.designation || selectedUser?.role || selectedEmp?.designation || 'Field Representative',
        hqName: selectedUser?.hqId || '',
        year,
        cl: Number(cl) || 0,
        sl: Number(sl) || 0,
        pl: Number(pl) || 0,
        isActive,
      };

      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to save leave allocation');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
            {allocation ? '✏️ Edit Leave Entitlement' : '🏖️ Add Leave Allocation'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '14px' }}>
            {!allocation ? (
              <SelectField
                label="Select Field Representative *"
                value={employeeId}
                onChange={(v) => { setEmployeeId(v); setError(''); }}
                options={fieldUsers.map((u) => ({
                  v: u.id,
                  l: `${u.fullName} (${u.role} - ${u.userId})`,
                }))}
              />
            ) : (
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <b style={{ color: '#0f172a' }}>{selectedUser?.fullName || allocation.employeeName || 'Employee'}</b>
                <small style={{ color: '#64748b', display: 'block' }}>
                  {selectedUser?.role || allocation.designation} • {selectedUser?.userId || allocation.employeeId}
                </small>
              </div>
            )}

            <SelectField
              label="Financial Year *"
              value={year}
              onChange={setYear}
              options={[
                { v: '2026-27', l: 'FY 2026-27 (Current Active)' },
                { v: '2027-28', l: 'FY 2027-28 (Upcoming FY)' },
                { v: '2025-26', l: 'FY 2025-26 (Past FY)' },
              ]}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <TextField
                label="Casual (CL) *"
                type="number"
                value={cl}
                onChange={setCl}
              />
              <TextField
                label="Sick (SL) *"
                type="number"
                value={sl}
                onChange={setSl}
              />
              <TextField
                label="Privilege (PL) *"
                type="number"
                value={pl}
                onChange={setPl}
              />
            </div>

            <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>Total Annual Pool:</span>
              <b style={{ fontSize: '15px', color: '#15803d' }}>{totalPool} Days</b>
            </div>

            <SelectField
              label="Entitlement Status"
              value={isActive ? 'ACTIVE' : 'INACTIVE'}
              onChange={(v) => setIsActive(v === 'ACTIVE')}
              options={[
                { v: 'ACTIVE', l: 'ACTIVE (Operational)' },
                { v: 'INACTIVE', l: 'INACTIVE (Suspended / On-Hold)' },
              ]}
            />

            {error && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 500 }}>❌ {error}</div>}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="secondary" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Saving...' : allocation ? 'Update Entitlement' : 'Save Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
