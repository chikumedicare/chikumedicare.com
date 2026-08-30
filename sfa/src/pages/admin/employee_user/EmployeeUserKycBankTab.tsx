import React from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { EmployeeUserDraft } from './employeeUser.types';
import type { AccountType } from '../../../core/domain/hr/employee.types';

interface EmployeeUserKycBankTabProps {
  draft: EmployeeUserDraft;
  setDraft: React.Dispatch<React.SetStateAction<EmployeeUserDraft>>;
}

export function EmployeeUserKycBankTab({ draft, setDraft }: EmployeeUserKycBankTabProps) {
  const accountTypeOptions: { v: AccountType; l: string }[] = [
    { v: 'SALARY', l: 'Salary Account' },
    { v: 'SAVINGS', l: 'Savings Account' },
    { v: 'CURRENT', l: 'Current Account' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Statutory KYC Identity */}
      <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0369a1', marginBottom: '10px' }}>
          🆔 Statutory KYC Identity Records
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <TextField
            label="Permanent Account Number (PAN)"
            value={draft.panNumber || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, panNumber: v.toUpperCase().slice(0, 10) }))}
            placeholder="e.g. ABCDE1234F"
          />

          <TextField
            label="Aadhaar Card Number (UIDAI)"
            value={draft.aadhaarNumber || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, aadhaarNumber: v.replace(/\D/g, '').slice(0, 12) }))}
            placeholder="12-digit Aadhaar"
          />
        </div>
      </div>

      {/* Bank & Salary Account */}
      <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0369a1', marginBottom: '10px' }}>
          🏦 Bank Account & Remittance Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
          <TextField
            label="Bank Name"
            value={draft.bankName || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, bankName: v }))}
            placeholder="e.g. State Bank of India, HDFC Bank"
          />

          <SelectField
            label="Account Type"
            value={draft.accountType || 'SALARY'}
            onChange={(v) => setDraft((prev) => ({ ...prev, accountType: v as AccountType }))}
            options={accountTypeOptions}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <TextField
            label="Bank Account Number"
            value={draft.accountNumber || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, accountNumber: v.trim() }))}
            placeholder="e.g. 10293847561"
          />

          <TextField
            label="IFSC Code"
            value={draft.ifscCode || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, ifscCode: v.toUpperCase().trim().slice(0, 11) }))}
            placeholder="e.g. SBIN0001234"
          />
        </div>
      </div>

      {/* Emergency Contact & Education */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <TextField
          label="Emergency Contact Name"
          value={draft.emergencyContactName || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, emergencyContactName: v }))}
          placeholder="Contact person name"
        />

        <TextField
          label="Emergency Phone No."
          value={draft.emergencyContactNo || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, emergencyContactNo: v.replace(/\D/g, '').slice(0, 10) }))}
          placeholder="10-digit number"
        />

        <TextField
          label="Relationship"
          value={draft.emergencyContactRelation || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, emergencyContactRelation: v }))}
          placeholder="e.g. Father, Spouse"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <TextField
          label="Highest Educational Qualification"
          value={draft.qualification || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, qualification: v }))}
          placeholder="e.g. B.Pharm, D.Pharm, B.Sc Chemistry, MBA"
        />

        <TextField
          label="Passing Year"
          value={draft.passingYear || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, passingYear: v.replace(/\D/g, '').slice(0, 4) }))}
          placeholder="e.g. 2022"
        />
      </div>
    </div>
  );
}
