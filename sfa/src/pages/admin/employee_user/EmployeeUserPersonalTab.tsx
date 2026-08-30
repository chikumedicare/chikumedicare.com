import React from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { EmployeeUserDraft } from './employeeUser.types';
import type { Gender, MaritalStatus } from '../../../core/domain/hr/employee.types';

interface EmployeeUserPersonalTabProps {
  draft: EmployeeUserDraft;
  setDraft: React.Dispatch<React.SetStateAction<EmployeeUserDraft>>;
}

export function EmployeeUserPersonalTab({ draft, setDraft }: EmployeeUserPersonalTabProps) {
  const genderOptions: { v: Gender; l: string }[] = [
    { v: 'MALE', l: '👨 Male' },
    { v: 'FEMALE', l: '👩 Female' },
    { v: 'OTHER', l: '⚧ Other' },
  ];

  const maritalOptions: { v: MaritalStatus; l: string }[] = [
    { v: 'SINGLE', l: 'Single' },
    { v: 'MARRIED', l: 'Married' },
    { v: 'DIVORCED', l: 'Divorced' },
    { v: 'WIDOWED', l: 'Widowed' },
  ];

  const bloodGroupOptions = [
    { v: 'O+', l: 'O+' },
    { v: 'O-', l: 'O-' },
    { v: 'A+', l: 'A+' },
    { v: 'A-', l: 'A-' },
    { v: 'B+', l: 'B+' },
    { v: 'B-', l: 'B-' },
    { v: 'AB+', l: 'AB+' },
    { v: 'AB-', l: 'AB-' },
  ];

  const isMarried = draft.maritalStatus === 'MARRIED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Row 1: Contact info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <TextField
          label="Primary Mobile Number *"
          value={draft.mobile}
          onChange={(v) => setDraft((prev) => ({ ...prev, mobile: v.replace(/\D/g, '').slice(0, 10) }))}
          placeholder="10-digit mobile"
        />

        <TextField
          label="Alternate Contact No."
          value={draft.alternateMobile || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, alternateMobile: v.replace(/\D/g, '').slice(0, 10) }))}
          placeholder="Secondary mobile"
        />

        <TextField
          label="Corporate / Personal Email"
          type="email"
          value={draft.email || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, email: v.trim() }))}
          placeholder="name@chikumedicare.com"
        />
      </div>

      {/* Row 2: Demographics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
        <TextField
          label="Date of Birth"
          type="date"
          value={draft.dateOfBirth || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, dateOfBirth: v }))}
        />

        <SelectField
          label="Gender"
          value={draft.gender}
          onChange={(v) => setDraft((prev) => ({ ...prev, gender: v as Gender }))}
          options={genderOptions}
        />

        <SelectField
          label="Blood Group"
          value={draft.bloodGroup || 'O+'}
          onChange={(v) => setDraft((prev) => ({ ...prev, bloodGroup: v }))}
          options={bloodGroupOptions}
        />

        <SelectField
          label="Marital Status"
          value={draft.maritalStatus}
          onChange={(v) => {
            const ms = v as MaritalStatus;
            setDraft((prev) => ({
              ...prev,
              maritalStatus: ms,
              spouseName: ms === 'MARRIED' ? prev.spouseName : '',
            }));
          }}
          options={maritalOptions}
        />
      </div>

      {/* Row 3: Family details (Conditional on Marital Status) */}
      <div style={{ display: 'grid', gridTemplateColumns: isMarried ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px' }}>
        <TextField
          label="Father's Full Name"
          value={draft.fatherName || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, fatherName: v }))}
          placeholder="Father's name"
        />

        <TextField
          label="Mother's Full Name"
          value={draft.motherName || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, motherName: v }))}
          placeholder="Mother's name"
        />

        {isMarried && (
          <TextField
            label="Spouse Full Name *"
            value={draft.spouseName || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, spouseName: v }))}
            placeholder="Spouse's name"
          />
        )}
      </div>

      {/* Row 4: Addresses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
            Current Residential Address
          </label>
          <textarea
            value={draft.currentAddress || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, currentAddress: e.target.value }))}
            placeholder="Flat/House No., Street, Locality, City, State, PIN"
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
              Permanent Home Address
            </label>
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, permanentAddress: prev.currentAddress }))}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Same as Current
            </button>
          </div>
          <textarea
            value={draft.permanentAddress || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, permanentAddress: e.target.value }))}
            placeholder="Permanent village / hometown address"
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
    </div>
  );
}
