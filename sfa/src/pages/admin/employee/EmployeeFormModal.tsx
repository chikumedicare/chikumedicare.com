import { getErrorMessage } from '../../../utils/dataIntegrity';
import React, { useState } from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { Employee } from '../../../core/domain/hr/employee.types';
import { EmployeeDocUploader } from './EmployeeDocUploader';

interface EmployeeFormModalProps {
  employee: Employee | null;
  onSave: (draft: Partial<Employee>) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  back: () => void;
}

export function EmployeeFormModal({


 employee, onSave, back }: EmployeeFormModalProps) {
  const isEditing = !!employee;

  const [f, setF] = useState<Partial<Employee>>(
    employee || {
      empCode: '',
      firstName: '',
      middleName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '',
      bloodGroup: 'O+',
      maritalStatus: 'SINGLE',
      mobile: '',
      alternateMobile: '',
      email: '',
      emergencyContactName: '',
      emergencyContactNo: '',
      emergencyContactRelation: '',
      currentAddress: '',
      permanentAddress: '',
      fatherName: '',
      fatherOccupation: '',
      motherName: '',
      spouseName: '',
      numberOfChildren: 0,
      qualification: '',
      specialization: '',
      university: '',
      passingYear: '',
      aadhaarNumber: '',
      panNumber: '',
      passportNumber: '',
      passportExpiry: '',
      drivingLicenseNumber: '',
      drivingLicenseExpiry: '',
      identityDocs: [],
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'SAVINGS',
      branchName: '',
      department: 'Sales',
      status: 'ACTIVE',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Employee>(key: K, val: Employee[K]) => {
    setF((prev) => ({ ...prev, [key]: val }));
    if (errors[key] || errors.submit) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        delete next.submit;
        return next;
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!f.firstName?.trim()) errs.firstName = 'First Name is required';
    if (!f.lastName?.trim()) errs.lastName = 'Last Name is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const payload: Partial<Employee> = {
        ...f,
        firstName: f.firstName?.trim(),
        lastName: f.lastName?.trim(),
      };

      const res = await onSave(payload);
      if (res.success) {
        back();
      } else if (res.errors) {
        setErrors(res.errors);
      } else {
        setErrors({ submit: 'Failed to save employee profile' });
      }
    } catch (err: unknown) {
      setErrors({ submit: getErrorMessage(err) || 'An unexpected error occurred' });
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
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            marginBottom: '16px',
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
                {isEditing ? `Edit Profile: ${f.firstName || ''} ${f.lastName || ''}` : 'Add New Employee Record'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Person Master (Personal KYC, Contact, Family, Education, Identity & Bank Info)
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
        {Object.keys(errors).length > 0 && (
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
            <div>
              {errors.submit ? (
                <span>{errors.submit}</span>
              ) : (
                <span>Please complete the required fields: {Object.values(errors).join(' | ')}</span>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Section 1: Basic Info */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>👤</span> <span>1. Personal & General Info</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <TextField
                    label="First Name *"
                    value={f.firstName || ''}
                    onChange={(v) => set('firstName', v)}
                    placeholder="First name"
                  />
                  {errors.firstName && <small style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '2px' }}>⚠️ {errors.firstName}</small>}
                </div>
                <TextField
                  label="Middle Name"
                  value={f.middleName || ''}
                  onChange={(v) => set('middleName', v)}
                  placeholder="Middle name"
                />
                <div>
                  <TextField
                    label="Last Name *"
                    value={f.lastName || ''}
                    onChange={(v) => set('lastName', v)}
                    placeholder="Last name"
                  />
                  {errors.lastName && <small style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '2px' }}>⚠️ {errors.lastName}</small>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <SelectField
                  label="Department"
                  value={f.department || 'Sales'}
                  onChange={(v) => set('department', v)}
                  options={['Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'IT', 'Supply Chain'].map((v) => ({ v, l: v }))}
                />
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={f.dateOfBirth || ''}
                  onChange={(v) => set('dateOfBirth', v)}
                />
                <SelectField
                  label="Gender"
                  value={f.gender || 'MALE'}
                  onChange={(v) => set('gender', v as any)}
                  options={['MALE', 'FEMALE', 'OTHER'].map((v) => ({ v, l: v }))}
                />
                <SelectField
                  label="Blood Group"
                  value={f.bloodGroup || 'O+'}
                  onChange={(v) => set('bloodGroup', v)}
                  options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ v, l: v }))}
                />
              </div>
            </div>

            {/* Section 2: Contact & Emergency Info */}
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📞</span> <span>2. Contact & Emergency Details</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <TextField
                  label="Mobile Number"
                  value={f.mobile || ''}
                  onChange={(v) => set('mobile', v)}
                  placeholder="Mobile number"
                />
                <TextField
                  label="Alternate Mobile"
                  value={f.alternateMobile || ''}
                  onChange={(v) => set('alternateMobile', v)}
                  placeholder="Alternate mobile"
                />
                <TextField
                  label="Email Address"
                  value={f.email || ''}
                  onChange={(v) => set('email', v)}
                  placeholder="Email address"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <TextField
                  label="Current Address"
                  value={f.currentAddress || ''}
                  onChange={(v) => set('currentAddress', v)}
                  placeholder="Current residence address"
                />
                <TextField
                  label="Permanent Address"
                  value={f.permanentAddress || ''}
                  onChange={(v) => set('permanentAddress', v)}
                  placeholder="Permanent hometown address"
                />
              </div>

              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                <small style={{ fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                  Emergency Contact Details:
                </small>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <TextField
                    label="Emergency Name"
                    value={f.emergencyContactName || ''}
                    onChange={(v) => set('emergencyContactName', v)}
                    placeholder="Contact person name"
                  />
                  <TextField
                    label="Emergency Phone"
                    value={f.emergencyContactNo || ''}
                    onChange={(v) => set('emergencyContactNo', v)}
                    placeholder="Contact phone"
                  />
                  <TextField
                    label="Relationship"
                    value={f.emergencyContactRelation || ''}
                    onChange={(v) => set('emergencyContactRelation', v)}
                    placeholder="e.g. Father, Spouse"
                  />
                </div>
              </div>
            </div>

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
          </div>

          {/* Footer Actions */}
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
              disabled={saving}
              style={{ padding: '9px 26px', fontSize: '13px', fontWeight: 700, background: '#0284c7', borderColor: '#0284c7' }}
            >
              {saving ? 'Saving Profile...' : isEditing ? 'Save Profile Changes' : 'Save Employee Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
