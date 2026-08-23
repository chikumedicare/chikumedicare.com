import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Section } from '../components/Section';
import { TextField, SelectField } from '../components/FormFields';
import { employees, roles } from '../data';
import type { User, Role } from '../types';

export function UserForm({
  user,
  back,
}: {
  user: User | null;
  back: () => void;
}) {
  const [u, setU] = useState<any>(user || { role: 'MR', isActive: true });

  const update = (k: string, v: any) =>
    setU((x: any) => ({ ...x, [k]: v }));

  return (
    <>
      <Head
        title={user ? 'Update Credentials' : 'Create User Login'}
        sub="Step 1: link an Employee Master record. Step 2: create SFA credentials. Step 3: assign chain/territory separately."
      />
      <div className="formGrid">
        <Section title="1. Employee Linkage">
          <SelectField
            label="Employee *"
            value={u.empCode || ''}
            onChange={(v) => {
              const e = employees.find((x) => x.empCode === v);
              setU({
                ...u,
                empCode: v,
                userId: user?.userId || v,
                fullName: e ? `${e.firstName} ${e.lastName}` : '',
                mobile: e?.mobile || '',
                email: e?.email || '',
                designation: e?.designation || '',
              });
            }}
            options={employees.map((e) => ({
              v: e.empCode,
              l: `${e.firstName} ${e.lastName} (${e.empCode})`,
            }))}
          />
        </Section>

        <Section title="2. SFA Login Credentials">
          <div className="two">
            <TextField
              label="Login User ID *"
              value={u.userId || ''}
              onChange={(v) => update('userId', v)}
            />
            <TextField
              label={user ? 'Reset Password' : 'Password'}
              value=""
              onChange={() => {}}
              type="password"
              placeholder={
                user ? 'Leave blank to keep unchanged' : 'Enter password'
              }
            />
          </div>
          <SelectField
            label="Role"
            value={u.role || 'MR'}
            onChange={(v) => update('role', v as Role)}
            options={roles.map((v) => ({ v, l: v }))}
          />
          <SelectField
            label="Account Status"
            value={u.isActive ? 'ACTIVE' : 'INACTIVE'}
            onChange={(v) => update('isActive', v === 'ACTIVE')}
            options={['ACTIVE', 'INACTIVE'].map((v) => ({ v, l: v }))}
          />
        </Section>

        <Section title="3. Linked Employee Contact">
          <div className="two">
            <TextField label="Mobile" value={u.mobile || ''} onChange={() => {}} />
            <TextField label="Email" value={u.email || ''} onChange={() => {}} />
          </div>
          <TextField
            label="Designation"
            value={u.designation || ''}
            onChange={() => {}}
          />
        </Section>
      </div>

      <div className="actions">
        <button className="secondary" onClick={back}>
          Cancel
        </button>
        <button className="primary" onClick={back}>
          {user ? 'Update Credentials' : 'Create User Login'}
        </button>
      </div>
    </>
  );
}
