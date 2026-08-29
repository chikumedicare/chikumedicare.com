import React from 'react';
import { TextField } from '../../../components/FormFields';
import type { Employee } from '../../../core/domain/hr/employee.types';

interface EmployeeContactSectionProps {
  f: Partial<Employee>;
  set: (key: keyof Employee, value: any) => void;
}

export function EmployeeContactSection({ f, set }: EmployeeContactSectionProps) {
  return (
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
  );
}
