import React from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { Employee } from '../../../core/domain/hr/employee.types';
import { EmployeeDocUploader } from './EmployeeDocUploader';

interface EmployeeKycBankFamilySectionProps {
  f: Partial<Employee>;
  set: (key: keyof Employee, value: any) => void;
}

export function EmployeeKycBankFamilySection({ f, set }: EmployeeKycBankFamilySectionProps) {
  return (
    <>
      {/* Section 3: Family & Education */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🎓</span> <span>3. Family & Education Background</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <TextField
            label="Father Name"
            value={f.fatherName || ''}
            onChange={(v) => set('fatherName', v)}
            placeholder="Father name"
          />
          <TextField
            label="Mother Name"
            value={f.motherName || ''}
            onChange={(v) => set('motherName', v)}
            placeholder="Mother name"
          />
          <TextField
            label="Spouse Name"
            value={f.spouseName || ''}
            onChange={(v) => set('spouseName', v)}
            placeholder="Spouse name"
          />
          <TextField
            label="Highest Qualification"
            value={f.qualification || ''}
            onChange={(v) => set('qualification', v)}
            placeholder="e.g. B.Pharma, B.Sc"
          />
        </div>
      </div>

      {/* Section 4: Identity & KYC */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🆔</span> <span>4. Identity & KYC Documents</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <TextField
            label="PAN Card"
            value={f.panNumber || ''}
            onChange={(v) => set('panNumber', v)}
            placeholder="PAN number"
          />
          <TextField
            label="Aadhaar Card"
            value={f.aadhaarNumber || ''}
            onChange={(v) => set('aadhaarNumber', v)}
            placeholder="Aadhaar number"
          />
          <TextField
            label="Driving Licence"
            value={f.drivingLicenseNumber || ''}
            onChange={(v) => set('drivingLicenseNumber', v)}
            placeholder="DL number"
          />
          <TextField
            label="Passport"
            value={f.passportNumber || ''}
            onChange={(v) => set('passportNumber', v)}
            placeholder="Passport number"
          />
        </div>

        <div style={{ marginTop: '16px' }}>
          <EmployeeDocUploader docs={(f.identityDocs || []) as any} onDocsChange={(d) => set('identityDocs', d)} />
        </div>
      </div>

      {/* Section 5: Bank Account */}
      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🏦</span> <span>5. Bank Account (Salary / Expense Claims)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
          <TextField
            label="Bank Name"
            value={f.bankName || ''}
            onChange={(v) => set('bankName', v)}
            placeholder="Bank name"
          />
          <TextField
            label="Account Number"
            value={f.accountNumber || ''}
            onChange={(v) => set('accountNumber', v)}
            placeholder="Account number"
          />
          <TextField
            label="IFSC Code"
            value={f.ifscCode || ''}
            onChange={(v) => set('ifscCode', v)}
            placeholder="IFSC code"
          />
          <SelectField
            label="Account Type"
            value={f.accountType || 'SAVINGS'}
            onChange={(v) => set('accountType', v as any)}
            options={['SAVINGS', 'CURRENT', 'SALARY'].map((v) => ({ v, l: v }))}
          />
        </div>
      </div>
    </>
  );
}
