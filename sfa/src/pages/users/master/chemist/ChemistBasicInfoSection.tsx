import React from 'react';

interface ChemistBasicInfoSectionProps {
  chemistName: string;
  setChemistName: (v: string) => void;
  contactPerson: string;
  setContactPerson: (v: string) => void;
}

export function ChemistBasicInfoSection({
  chemistName,
  setChemistName,
  contactPerson,
  setContactPerson,
}: ChemistBasicInfoSectionProps) {
  return (
    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>🏪</span> Chemist & Shop Information
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Chemist / Shop Name *
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Apollo Pharmacy / Sharma Medical Stores"
            value={chemistName}
            onChange={(e) => setChemistName(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Contact Person / Owner Name
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Shri Rajesh Sharma"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
        </div>
      </div>
    </div>
  );
}
