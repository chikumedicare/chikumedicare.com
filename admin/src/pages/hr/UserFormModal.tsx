import React, { useState, useEffect } from 'react';
import { Head } from '../../components/Head';
import { Section } from '../../components/Section';
import { TextField, SelectField } from '../../components/FormFields';
import type { Employee } from '../../domain/hr/employee.types';
import type { SfaUser, SfaRole } from '../../domain/hr/user.types';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';

export function UserFormModal({
  user,
  users = [],
  employees,
  onSave,
  back,
}: {
  user: SfaUser | null;
  users?: SfaUser[];
  employees: Employee[];
  onSave: (
    user: SfaUser | null,
    emp: Employee,
    userId: string,
    role: SfaRole,
    pw?: string,
    divisionId?: string,
    joiningDate?: string,
    isRoleChanged?: boolean,
    isDivisionChanged?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  back: () => void;
}) {
  const { divisions } = useHeadOfficeStore();

  const availableEmployees = user
    ? employees
    : employees.filter((e) => {
        const hasExistingAccount = users.some(
          (u) => (u.empCode && u.empCode === e.empCode) || (u.userId && u.userId === e.empCode)
        );
        return !hasExistingAccount;
      });

  const initialRole = user?.role || 'MR';
  const initialDivision = (user as any)?.divisionId || (user as any)?.division_id || divisions[0]?.id || '';

  const [selectedEmpCode, setSelectedEmpCode] = useState(user?.empCode || availableEmployees[0]?.empCode || '');
  const [userId, setUserId] = useState(user?.userId || user?.empCode || availableEmployees[0]?.empCode || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SfaRole>(initialRole);
  const [divisionId, setDivisionId] = useState<string>(initialDivision);
  const [joiningDate, setJoiningDate] = useState<string>(
    (user as any)?.joiningDate || (user as any)?.joining_date || new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSelectedEmpCode(user.empCode || '');
      setUserId(user.userId || user.empCode || '');
      setRole(user.role || 'MR');
      setDivisionId((user as any)?.divisionId || (user as any)?.division_id || divisions[0]?.id || '');
      setJoiningDate((user as any)?.joiningDate || (user as any)?.joining_date || new Date().toISOString().split('T')[0]);
      setPassword('');
    } else if (availableEmployees.length > 0 && (!selectedEmpCode || !availableEmployees.some(e => e.empCode === selectedEmpCode))) {
      setSelectedEmpCode(availableEmployees[0].empCode);
      setUserId(availableEmployees[0].empCode);
    }
  }, [user, divisions, availableEmployees]);

  const handleEmployeeChange = (empCode: string) => {
    setSelectedEmpCode(empCode);
    if (!user) {
      setUserId(empCode);
    }
  };

  const isRoleChanged = !!user && user.role !== role;
  const isDivisionChanged = !!user && initialDivision !== divisionId;

  const selectedEmp = employees.find((e) => e.empCode === selectedEmpCode) || {
    empCode: user?.empCode || '',
    firstName: user?.fullName?.split(' ')[0] || user?.fullName || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    designation: user?.designation || '',
    hqId: user?.hqId || '',
  } as Employee;

  const handleSubmit = async () => {
    if (!selectedEmp && !user) {
      setError('Please select an unlinked employee record');
      return;
    }
    if (role !== 'ADMIN' && role !== 'OWNER' && !divisionId) {
      setError('Please select a Marketing Division for field staff');
      return;
    }
    if (!joiningDate) {
      setError('Please specify Date of Joining');
      return;
    }

    if (user && (isRoleChanged || isDivisionChanged)) {
      const confirmMsg = `⚠️ CRITICAL WARNING:\n\nYou are modifying the ${isRoleChanged ? 'Assigned Hierarchy Role (' + user.role + ' ➔ ' + role + ')' : ''}${isRoleChanged && isDivisionChanged ? ' and ' : ''}${isDivisionChanged ? 'Marketing Division' : ''} for active user "${user.fullName}".\n\nIMPACT: Saving will UNBIND & CLEAR this user's current Reporting Boss Hierarchy & Field Geography Territory Mappings! You will need to re-assign reporting hierarchy and territories for their new role/division.\n\nDo you wish to proceed?`;
      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await onSave(
        user,
        selectedEmp,
        userId || selectedEmp.empCode,
        role,
        password,
        divisionId,
        joiningDate,
        isRoleChanged,
        isDivisionChanged
      );
      if (res.success) {
        back();
      } else if (res.error) {
        setError(res.error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head
        title={user ? `Edit SFA User: ${user.fullName} (${user.userId})` : 'Create SFA Login Credentials'}
        sub={user ? 'Update user role, marketing division, joining date or reset password' : 'Link Unassigned Employee Master Record to Field Force Mobile Login'}
      />
      <div className="formGrid">
        <Section title="1. Linked Employee Master Record & Login ID">
          {user ? (
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>{user.fullName}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Emp Code / Login ID: <b style={{ color: '#0284c7' }}>{user.empCode || user.userId}</b> | Role: <b>{user.role}</b>
              </div>
            </div>
          ) : availableEmployees.length === 0 ? (
            <div style={{ padding: '16px', background: '#fefce8', borderRadius: '8px', border: '1px solid #fef08a', color: '#854d0e', fontSize: '13px', fontWeight: 600 }}>
              ℹ️ All Employee Master records currently have active SFA User Credentials created. Add a new employee in Employee Master first to create more users.
            </div>
          ) : (
            <SelectField
              label="Select Unlinked Employee Record *"
              value={selectedEmpCode}
              onChange={handleEmployeeChange}
              options={availableEmployees.map((e) => ({
                v: e.empCode,
                l: `${e.firstName} ${e.lastName} (${e.empCode})`,
              }))}
            />
          )}
        </Section>

        <Section title="2. SFA App Login Credentials & Division">
          <div className="two">
            <TextField
              label="Login User ID (Employee Code) *"
              value={userId}
              onChange={setUserId}
              placeholder="Auto-filled with Employee Code"
              disabled={true}
            />
            <TextField
              label={user ? 'Reset Password (optional)' : 'Password *'}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={user ? 'Leave blank to keep unchanged' : '••••••••'}
            />
          </div>

          <div className="two" style={{ marginTop: '12px' }}>
            <SelectField
              label="Assigned Hierarchy Role *"
              value={role}
              onChange={(v) => setRole(v as SfaRole)}
              options={['MR', 'ASM', 'RSM', 'ZSM', 'NSM', 'VP', 'ADMIN', 'OWNER'].map((v) => ({ v, l: v }))}
            />
            {role !== 'ADMIN' && role !== 'OWNER' ? (
              <SelectField
                label="Marketing Division *"
                value={divisionId}
                onChange={setDivisionId}
                options={[
                  { v: '', l: '-- Select Division --' },
                  ...divisions.map((d) => ({ v: d.id, l: `${d.code} - ${d.name}` })),
                ]}
              />
            ) : (
              <TextField
                label="Date of Joining (SFA Role) *"
                type="date"
                value={joiningDate}
                onChange={setJoiningDate}
              />
            )}
          </div>

          {role !== 'ADMIN' && role !== 'OWNER' && (
            <div style={{ marginTop: '12px' }}>
              <TextField
                label="Date of Joining (SFA Role) *"
                type="date"
                value={joiningDate}
                onChange={setJoiningDate}
              />
            </div>
          )}

          {/* Critical Warning Alert Box on Role or Division Change */}
          {user && (isRoleChanged || isDivisionChanged) && (
            <div style={{ padding: '14px 18px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', marginTop: '16px', color: '#be123c', fontSize: '13px', lineHeight: 1.5 }}>
              <b style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                ⚠️ CRITICAL WARNING: Hierarchy & Territory Unbind Impact
              </b>
              You are modifying the <b>{isRoleChanged ? `Assigned Role (${user.role} ➔ ${role})` : ''}${isRoleChanged && isDivisionChanged ? ' and ' : ''}${isDivisionChanged ? 'Marketing Division' : ''}</b> for active user <b>{user.fullName}</b>.
              <br />
              <span style={{ fontWeight: 600 }}>Impact:</span> Saving these changes will <b>UNBIND & CLEAR</b> this user's existing <b>Reporting Boss Hierarchy</b> and <b>Geography & Territory HQ Mappings</b>. You will need to re-assign reporting hierarchy and territories for their new role/division.
            </div>
          )}

          {error && <small style={{ color: '#ef4444', display: 'block', marginTop: '10px', fontWeight: 600 }}>⚠️ {error}</small>}
        </Section>
      </div>

      <div className="actions" style={{ marginTop: '20px' }}>
        <button className="secondary" onClick={back} disabled={saving}>Cancel</button>
        <button className="primary" onClick={handleSubmit} disabled={saving || (!user && availableEmployees.length === 0)}>
          {saving ? 'Saving...' : user ? 'Save Changes & Unbind Mappings' : 'Create User Credentials'}
        </button>
      </div>
    </>
  );
}
