import React, { useState } from 'react';
import { Head } from '../../components/Head';
import { Section } from '../../components/Section';
import { TextField, SelectField } from '../../components/FormFields';
import type { Employee } from '../../domain/hr/employee.types';
import { EmployeeDocUploader } from './EmployeeDocUploader';

export function EmployeeFormModal({
  employee,
  onSave,
  back,
}: {
  employee: Employee | null;
  onSave: (draft: Partial<Employee>) => Promise<{ success: boolean; errors?: Record<string, string> }>;
  back: () => void;
}) {
  const [tab, setTab] = useState('Basic Info');
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
      department: 'Sales',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Employee, val: any) => {
    setF((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!f.firstName?.trim()) errs.firstName = 'First name is required';
    if (!f.lastName?.trim()) errs.lastName = 'Last name is required';
    if (!f.mobile?.trim() || !/^[6-9]\d{9}$/.test(f.mobile.trim())) errs.mobile = 'Valid 10-digit mobile required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const res = await onSave(f);
      if (res.success) {
        back();
      } else if (res.errors) {
        setErrors(res.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  const tabs = ['Basic Info', 'Contact & Address', 'Family Details', 'Education', 'Identity Docs & Upload', 'Bank Details'];

  return (
    <>
      <Head
        title={employee ? 'Edit Employee: ' + employee.firstName + ' ' + employee.lastName : 'Add New Employee (Person Master)'}
        sub="Personal Profile, Family, Education, KYC Identity & Bank Record"
      />
      <div className="tabs">
        {tabs.map((t) => (
          <button className={tab === t ? 'on' : ''} onClick={() => setTab(t)} key={t}>
            {t}
          </button>
        ))}
      </div>
      <div className="formGrid">
        {tab === 'Basic Info' && (
          <Section title="Basic Information">
            <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <small style={{ color: '#64748b', fontWeight: 600, display: 'block' }}>EMPLOYEE ID / CODE</small>
                <b style={{ color: '#0284c7', fontSize: '15px', fontFamily: 'monospace' }}>
                  {employee ? employee.empCode : 'Auto-Generated on Save (CHIKU0000X)'}
                </b>
              </div>
              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Read-Only (Sequential DB Sequence)
              </span>
            </div>

            <div className="three">
              <TextField label="First Name *" value={f.firstName || ''} onChange={(v) => set('firstName', v)} placeholder="e.g. Rahul" />
              <TextField label="Middle Name" value={f.middleName || ''} onChange={(v) => set('middleName', v)} placeholder="e.g. Kumar" />
              <TextField label="Last Name *" value={f.lastName || ''} onChange={(v) => set('lastName', v)} placeholder="e.g. Sharma" />
            </div>
            {errors.firstName && <small style={{ color: '#ef4444' }}>⚠️ {errors.firstName}</small>}
            {errors.lastName && <small style={{ color: '#ef4444' }}>⚠️ {errors.lastName}</small>}

            <div className="two" style={{ marginTop: '12px' }}>
              <TextField label="Date of Birth" value={f.dateOfBirth || ''} onChange={(v) => set('dateOfBirth', v)} placeholder="YYYY-MM-DD" />
              <SelectField label="Gender" value={f.gender || 'MALE'} onChange={(v) => set('gender', v)} options={['MALE', 'FEMALE', 'OTHER'].map((v) => ({ v, l: v }))} />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <SelectField label="Blood Group" value={f.bloodGroup || 'O+'} onChange={(v) => set('bloodGroup', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ v, l: v }))} />
              <SelectField label="Marital Status" value={f.maritalStatus || 'SINGLE'} onChange={(v) => set('maritalStatus', v)} options={['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'].map((v) => ({ v, l: v }))} />
            </div>
          </Section>
        )}

        {tab === 'Contact & Address' && (
          <Section title="Contact & Address Details">
            <div className="two">
              <TextField label="Mobile *" value={f.mobile || ''} onChange={(v) => set('mobile', v)} placeholder="10-digit mobile number" />
              <TextField label="Alternate Mobile" value={f.alternateMobile || ''} onChange={(v) => set('alternateMobile', v)} placeholder="Alternate contact number" />
            </div>
            {errors.mobile && <small style={{ color: '#ef4444' }}>⚠️ {errors.mobile}</small>}
            <div style={{ marginTop: '12px' }}>
              <TextField label="Email" value={f.email || ''} onChange={(v) => set('email', v)} placeholder="e.g. rahul.sharma@gmail.com" />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <TextField label="Current Address" value={f.currentAddress || ''} onChange={(v) => set('currentAddress', v)} placeholder="House/Flat, Street, City" />
              <TextField label="Permanent Address" value={f.permanentAddress || ''} onChange={(v) => set('permanentAddress', v)} placeholder="Hometown permanent address" />
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
              <b style={{ color: '#0f172a', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Emergency Contact Information:</b>
              <div className="three">
                <TextField label="Emergency Contact Name" value={f.emergencyContactName || ''} onChange={(v) => set('emergencyContactName', v)} placeholder="Person name" />
                <TextField label="Emergency Contact Number" value={f.emergencyContactNo || ''} onChange={(v) => set('emergencyContactNo', v)} placeholder="Phone number" />
                <TextField label="Emergency Contact Relation" value={f.emergencyContactRelation || ''} onChange={(v) => set('emergencyContactRelation', v)} placeholder="e.g. Father, Spouse" />
              </div>
            </div>
          </Section>
        )}

        {tab === 'Family Details' && (
          <Section title="Family Details">
            <div className="two">
              <TextField label="Father Name" value={f.fatherName || ''} onChange={(v) => set('fatherName', v)} placeholder="Father full name" />
              <TextField label="Father Occupation" value={f.fatherOccupation || ''} onChange={(v) => set('fatherOccupation', v)} placeholder="e.g. Business / Service" />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <TextField label="Mother Name" value={f.motherName || ''} onChange={(v) => set('motherName', v)} placeholder="Mother full name" />
              <TextField label="Spouse Name" value={f.spouseName || ''} onChange={(v) => set('spouseName', v)} placeholder="Spouse full name (if applicable)" />
            </div>
            <div style={{ marginTop: '12px', maxWidth: '300px' }}>
              <TextField label="Number of Children" type="number" value={String(f.numberOfChildren || 0)} onChange={(v) => set('numberOfChildren', Number(v) || 0)} />
            </div>
          </Section>
        )}

        {tab === 'Education' && (
          <Section title="Education & Qualifications">
            <div className="two">
              <TextField label="Highest Qualification" value={f.qualification || ''} onChange={(v) => set('qualification', v)} placeholder="e.g. B.Pharma / B.Sc / MBA" />
              <TextField label="Specialization" value={f.specialization || ''} onChange={(v) => set('specialization', v)} placeholder="e.g. Chemistry / Marketing" />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <TextField label="Institute" value={f.university || ''} onChange={(v) => set('university', v)} placeholder="College / University name" />
              <TextField label="Passing Year" value={f.passingYear || ''} onChange={(v) => set('passingYear', v)} placeholder="e.g. 2022" />
            </div>
          </Section>
        )}

        {tab === 'Identity Docs & Upload' && (
          <Section title="Government Identity Documents & File Uploads">
            <div className="two">
              <TextField label="Aadhaar" value={f.aadhaarNumber || ''} onChange={(v) => set('aadhaarNumber', v)} placeholder="12-digit Aadhaar number" />
              <TextField label="PAN" value={f.panNumber || ''} onChange={(v) => set('panNumber', v)} placeholder="10-digit PAN (e.g. ABCDE1234F)" />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <TextField label="Passport" value={f.passportNumber || ''} onChange={(v) => set('passportNumber', v)} placeholder="Passport number" />
              <TextField label="Passport Expiry" value={f.passportExpiry || ''} onChange={(v) => set('passportExpiry', v)} placeholder="YYYY-MM-DD" />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <TextField label="Driving Licence" value={f.drivingLicenseNumber || ''} onChange={(v) => set('drivingLicenseNumber', v)} placeholder="DL number" />
              <TextField label="Driving Licence Expiry" value={f.drivingLicenseExpiry || ''} onChange={(v) => set('drivingLicenseExpiry', v)} placeholder="YYYY-MM-DD" />
            </div>

            <EmployeeDocUploader
              docs={Array.isArray(f.identityDocs) ? f.identityDocs : []}
              onChange={(newDocs) => set('identityDocs', newDocs)}
            />
          </Section>
        )}

        {tab === 'Bank Details' && (
          <Section title="Bank Details (Salary / Expenses)">
            <div className="two">
              <TextField label="Bank Name" value={f.bankName || ''} onChange={(v) => set('bankName', v)} placeholder="e.g. State Bank of India" />
              <TextField label="Account Number" value={f.accountNumber || ''} onChange={(v) => set('accountNumber', v)} placeholder="e.g. 30123456789" />
            </div>
            <div className="two" style={{ marginTop: '12px' }}>
              <TextField label="IFSC" value={f.ifscCode || ''} onChange={(v) => set('ifscCode', v)} placeholder="e.g. SBIN0001234" />
              <SelectField label="Account Type" value={f.accountType || 'SAVINGS'} onChange={(v) => set('accountType', v)} options={['SAVINGS', 'CURRENT'].map((v) => ({ v, l: v }))} />
            </div>
          </Section>
        )}
      </div>

      {errors.submit && (
        <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '12px' }}>
          ⚠️ {errors.submit}
        </div>
      )}

      <div className="actions" style={{ marginTop: '20px' }}>
        <button className="secondary" onClick={back} disabled={saving}>Cancel</button>
        <button className="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving to Database...' : employee ? 'Save Changes' : 'Create Employee Profile'}
        </button>
      </div>
    </>
  );
}
