import React from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { Employee } from '../../../core/domain/hr/employee.types';
import type { SfaUser, SfaRole } from '../../../core/domain/hr/user.types';

interface UserFormFieldsProps {
  user: SfaUser | null;
  allEmployees: Employee[];
  availableEmployees: Employee[];
  selectedEmpCode: string;
  handleEmployeeChange: (empCode: string) => void;
  userId: string;
  setUserId: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  role: SfaRole;
  setRole: (v: SfaRole) => void;
  isApexRole: boolean;
  divisionId: string;
  setDivisionId: (v: string) => void;
  divisions: Array<{ id: string; code: string; name: string }>;
  joiningDate: string;
  setJoiningDate: (v: string) => void;
  isRoleChanged: boolean;
  isDivisionChanged: boolean;
}

export function UserFormFields({
  user,
  allEmployees,
  availableEmployees,
  selectedEmpCode,
  handleEmployeeChange,
  userId,
  setUserId,
  password,
  setPassword,
  role,
  setRole,
  isApexRole,
  divisionId,
  setDivisionId,
  divisions,
  joiningDate,
  setJoiningDate,
  isRoleChanged,
  isDivisionChanged,
}: UserFormFieldsProps) {
  return (
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
  );
}
