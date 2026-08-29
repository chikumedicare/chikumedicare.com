import React, { useState, useEffect } from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { Employee } from '../../../core/domain/hr/employee.types';
import type { SfaUser, SfaRole } from '../../../core/domain/hr/user.types';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { GatewayContainer } from '../../../core/container/GatewayContainer';

export function UserFormModal({
  user,
  users = [],
  employees: propEmployees = [],
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
  const [fetchedEmployees, setFetchedEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    GatewayContainer.getEmployeeGateway().getEmployees()
      .then((data) => {
        if (Array.isArray(data)) setFetchedEmployees(data);
      })
      .catch(() => {});
  }, []);

  const allEmployees = fetchedEmployees.length > 0 ? fetchedEmployees : propEmployees;

  // Prioritize unlinked employees
  const unlinkedEmployees = allEmployees.filter((e) => {
    return !users.some(
      (u) => (u.empCode && u.empCode === e.empCode) || (u.userId && u.userId === e.empCode)
    );
  });

  const availableEmployees = user
    ? allEmployees
    : unlinkedEmployees;

  const [selectedEmpCode, setSelectedEmpCode] = useState(
    user?.empCode || availableEmployees[0]?.empCode || ''
  );
  const [userId, setUserId] = useState(user?.userId || user?.empCode || availableEmployees[0]?.empCode || '');
  const [role, setRole] = useState<SfaRole>(user?.role || 'MR');
  const [password, setPassword] = useState('');
  const [divisionId, setDivisionId] = useState(
    user?.divisionId || divisions[0]?.id || ''
  );
  const [joiningDate, setJoiningDate] = useState(
    user?.joiningDate || new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const initialRole = user?.role;
  const initialDivision = user?.divisionId;

  useEffect(() => {
    if (user) {
      setSelectedEmpCode(user.empCode || '');
      setUserId(user.userId || user.empCode || '');
      setRole(user.role || 'MR');
      setDivisionId(user?.divisionId || divisions[0]?.id || '');
      setJoiningDate(user?.joiningDate || new Date().toISOString().split('T')[0]);
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

  const isApexRole = role === 'OWNER';
  const isRoleChanged = !!user && user.role !== role;
  const isDivisionChanged = !!user && initialDivision !== divisionId;

  const selectedEmp = allEmployees.find((e) => e.empCode === selectedEmpCode) || ({
    empCode: user?.empCode || selectedEmpCode || '',
    firstName: user?.fullName?.split(' ')[0] || user?.fullName || 'SFA User',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    designation: user?.designation || 'Field Representative',
    hqId: user?.hqId || '',
  } as Employee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp && !user) {
      setError('Please select an employee record from Employee Master');
      return;
    }
    if (!joiningDate) {
      setError('Please specify Date of Joining');
      return;
    }
    if (!user && !password) {
      setError('Password is required for new user credentials');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await onSave(
        user,
        selectedEmp,
        userId.trim(),
        role,
        password || undefined,
        (isApexRole ? undefined : (divisionId || undefined)),
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '840px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            marginBottom: '20px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
            >
              👤
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {user ? 'Edit User Credentials: ' + user.fullName + ' (' + user.userId + ')' : 'Create User Login Credentials'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                {user ? 'Update user role, division, joining date or reset password' : 'Link Employee Record to User Login & Assign Role'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={back}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Top Error Alert Banner */}
        {error && (
          <div
            style={{
              marginBottom: '18px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Linked Employee Master Record & Login ID */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>👔</span> <span>1. Select Employee Master Record</span>
              </div>

              {user ? (
                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{user.fullName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Emp Code / Login ID: <b style={{ color: '#0284c7' }}>{user.empCode || user.userId}</b> | Current Role: <b>{user.role}</b>
                  </div>
                </div>
              ) : allEmployees.length === 0 ? (
                <div style={{ padding: '14px 16px', background: '#fefce8', borderRadius: '10px', border: '1px solid #fef08a', color: '#854d0e', fontSize: '13px', fontWeight: 600 }}>
                  ⚠️ No records found in Employee Master. Add an employee in Employee Master first.
                </div>
              ) : (
                <SelectField
                  label="Select Employee Record from Employee Master *"
                  value={selectedEmpCode}
                  onChange={handleEmployeeChange}
                  options={availableEmployees.map((e) => ({
                    v: e.empCode,
                    l: `${e.firstName} ${e.lastName} (${e.empCode})${e.designation ? ' - ' + e.designation : ''}`,
                  }))}
                />
              )}
            </div>

            {/* Section 2: User Login Credentials & Role */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔑</span> <span>2. User Login Credentials & Role</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                  placeholder={user ? 'Leave blank to keep unchanged' : 'Enter password'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <SelectField
                  label="Assigned Role *"
                  value={role}
                  onChange={(v) => setRole(v as SfaRole)}
                  options={['MR', 'ASM', 'RSM', 'ZSM', 'NSM', 'VP', 'OWNER'].map((v) => ({ v, l: v }))}
                />
                {isApexRole ? (
                  <TextField
                    label="Marketing Division"
                    value="Apex (All Divisions)"
                    disabled={true}
                  />
                ) : (
                  <SelectField
                    label="Marketing Division"
                    value={divisionId}
                    onChange={setDivisionId}
                    options={[
                      { v: '', l: '-- Select Division --' },
                      ...divisions.map((d) => ({ v: d.id, l: d.code + ' - ' + d.name })),
                    ]}
                  />
                )}
                <TextField
                  label="Date of Joining *"
                  type="date"
                  value={joiningDate}
                  onChange={setJoiningDate}
                />
              </div>

              {user && (isRoleChanged || isDivisionChanged) && (
                <div style={{ padding: '14px 18px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', marginTop: '16px', color: '#be123c', fontSize: '13px', lineHeight: 1.5 }}>
                  <b style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                    ⚠️ WARNING: Role / Division Change
                  </b>
                  You are modifying the <b>{isRoleChanged ? 'Assigned Role (' + user.role + ' ➔ ' + role + ')' : ''}{isRoleChanged && isDivisionChanged ? ' and ' : ''}{isDivisionChanged ? 'Marketing Division' : ''}</b> for active user <b>{user.fullName}</b>.
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="secondary"
              onClick={back}
              disabled={saving}
              style={{ padding: '9px 22px', fontSize: '13px', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary"
              disabled={saving || (!user && availableEmployees.length === 0)}
              style={{ padding: '9px 26px', fontSize: '13px', fontWeight: 700, background: '#0284c7', borderColor: '#0284c7' }}
            >
              {saving ? 'Saving...' : user ? 'Save Changes' : 'Create User Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
