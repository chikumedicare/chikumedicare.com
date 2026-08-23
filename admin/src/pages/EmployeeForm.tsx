import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Section } from '../components/Section';
import { TextField, SelectField } from '../components/FormFields';
import type { Employee } from '../types';

export function EmployeeForm({
  employee,
  back,
}: {
  employee: Employee | null;
  back: () => void;
}) {
  const [tab, setTab] = useState('Personal');
  const [f, setF] = useState<any>(employee || {});

  const set = (k: string, v: string) =>
    setF((x: any) => ({ ...x, [k]: v }));

  const tabs = [
    'Personal',
    'Contact',
    'Education',
    'Family',
    'Identity',
    'Employment',
    'Bank',
  ];

  return (
    <>
      <Head
        title={employee ? 'Edit Employee' : 'Add Employee'}
        sub="Employee Master • complete employee record"
      />
      <div className="tabs">
        {tabs.map((t) => (
          <button
            className={tab === t ? 'on' : ''}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="formGrid">
        {tab === 'Personal' && (
          <Section title="Personal Details">
            <div className="three">
              <TextField
                label="First Name *"
                value={f.firstName || ''}
                onChange={(v) => set('firstName', v)}
              />
              <TextField
                label="Middle Name"
                value={f.middleName || ''}
                onChange={(v) => set('middleName', v)}
              />
              <TextField
                label="Last Name *"
                value={f.lastName || ''}
                onChange={(v) => set('lastName', v)}
              />
            </div>
            <div className="three">
              <TextField
                label="Date of Birth"
                value={f.dateOfBirth || ''}
                onChange={(v) => set('dateOfBirth', v)}
                placeholder="DD-MM-YYYY"
              />
              <SelectField
                label="Gender"
                value={f.gender || ''}
                onChange={(v) => set('gender', v)}
                options={['MALE', 'FEMALE', 'OTHER'].map((v) => ({
                  v,
                  l: v,
                }))}
              />
              <SelectField
                label="Marital Status"
                value={f.maritalStatus || ''}
                onChange={(v) => set('maritalStatus', v)}
                options={['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'].map(
                  (v) => ({ v, l: v })
                )}
              />
            </div>
          </Section>
        )}

        {tab === 'Contact' && (
          <Section title="Contact Details">
            <div className="two">
              <TextField
                label="Mobile *"
                value={f.mobile || ''}
                onChange={(v) => set('mobile', v)}
                placeholder="10-digit mobile"
              />
              <TextField
                label="Alternate Mobile"
                value={f.alternateMobile || ''}
                onChange={(v) => set('alternateMobile', v)}
              />
            </div>
            <TextField
              label="Email"
              value={f.email || ''}
              onChange={(v) => set('email', v)}
              placeholder="personal@email.com"
            />
            <div className="two">
              <TextField
                label="Current Address"
                value={f.currentAddress || ''}
                onChange={(v) => set('currentAddress', v)}
              />
              <TextField
                label="Permanent Address"
                value={f.permanentAddress || ''}
                onChange={(v) => set('permanentAddress', v)}
              />
            </div>
          </Section>
        )}

        {tab === 'Employment' && (
          <Section title="Employment Details">
            <div className="three">
              <TextField
                label="Employee Code *"
                value={f.empCode || ''}
                onChange={(v) => set('empCode', v)}
                placeholder="e.g. EMP-0001"
              />
              <SelectField
                label="Department"
                value={f.department || ''}
                onChange={(v) => set('department', v)}
                options={[
                  'Sales',
                  'Marketing',
                  'Administration',
                  'Finance',
                  'HR',
                ].map((v) => ({ v, l: v }))}
              />
              <TextField
                label="Designation"
                value={f.designation || ''}
                onChange={(v) => set('designation', v)}
                placeholder="Sales Executive, Area Manager"
              />
            </div>
            <div className="two">
              <TextField
                label="Date of Joining"
                value={f.joiningDate || ''}
                onChange={(v) => set('joiningDate', v)}
                placeholder="DD-MM-YYYY"
              />
              <SelectField
                label="Status"
                value={f.status || 'ACTIVE'}
                onChange={(v) => set('status', v)}
                options={[
                  'ACTIVE',
                  'RESIGNED',
                  'SUSPENDED',
                  'TERMINATED',
                ].map((v) => ({ v, l: v }))}
              />
            </div>
          </Section>
        )}

        {tab === 'Bank' && (
          <Section title="Bank Details">
            <div className="two">
              <TextField
                label="Bank Name"
                value={f.bankName || ''}
                onChange={(v) => set('bankName', v)}
                placeholder="State Bank of India"
              />
              <TextField
                label="Account Number"
                value={f.accountNumber || ''}
                onChange={(v) => set('accountNumber', v)}
              />
              <TextField
                label="IFSC Code"
                value={f.ifscCode || ''}
                onChange={(v) => set('ifscCode', v)}
                placeholder="SBIN0001234"
              />
              <SelectField
                label="Account Type"
                value={f.accountType || ''}
                onChange={(v) => set('accountType', v)}
                options={['SAVINGS', 'CURRENT'].map((v) => ({ v, l: v }))}
              />
            </div>
          </Section>
        )}
      </div>
      <div className="actions">
        <button className="secondary" onClick={back}>
          Cancel
        </button>
        <button className="primary" onClick={back}>
          Save Employee
        </button>
      </div>
    </>
  );
}
