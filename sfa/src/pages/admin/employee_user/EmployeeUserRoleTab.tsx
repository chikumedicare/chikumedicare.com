import React from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { EmployeeUserDraft } from './employeeUser.types';
import type { SfaRole, SfaUser } from '../../../core/domain/hr/user.types';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import type { Headquarter } from '../../../core/domain/hr/geography.types';

interface EmployeeUserRoleTabProps {
  draft: EmployeeUserDraft;
  setDraft: React.Dispatch<React.SetStateAction<EmployeeUserDraft>>;
  isEditing: boolean;
  divisions: Division[];
  hqs: Headquarter[];
  allUsers: SfaUser[];
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export function EmployeeUserRoleTab({
  draft,
  setDraft,
  isEditing,
  divisions,
  hqs,
  allUsers,
  showPassword,
  setShowPassword,
}: EmployeeUserRoleTabProps) {
  const roleOptions: { v: SfaRole; l: string }[] = [
    { v: 'MR', l: '💊 Medical Representative (MR)' },
    { v: 'SR_MR', l: '⭐ Senior MR (SR_MR)' },
    { v: 'ASM', l: '👔 Area Sales Manager (ASM)' },
    { v: 'SR_ASM', l: '👔 Senior Area Sales Manager (SR_ASM)' },
    { v: 'RSM', l: '💼 Regional Sales Manager (RSM)' },
    { v: 'ZSM', l: '🌐 Zonal Sales Manager (ZSM)' },
    { v: 'NSM', l: '🚀 National Sales Manager (NSM)' },
    { v: 'VP', l: '👑 Vice President (VP / Business Head)' },
    { v: 'ADMIN', l: '🛡️ System Administrator' },
    { v: 'OWNER', l: '👑 Company Director / Owner' },
  ];

  const divisionOptions = divisions.map((d) => ({
    v: d.id,
    l: `${d.name} (${d.code || 'DIV'})`,
  }));

  const hqOptions = [
    { v: '', l: '-- Select Field Territory / HQ --' },
    ...hqs.map((h) => ({
      v: h.id,
      l: `📍 ${h.name} (${h.code || 'HQ'})`,
    })),
  ];

  const managerOptions = [
    { v: '', l: '-- Direct to Head Office / Apex --' },
    ...allUsers
      .filter((u) => u.userId !== draft.userId && u.isActive)
      .map((u) => ({
        v: u.id,
        l: `${u.fullName} (${u.role} - ${u.userId})`,
      })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Employee Code / User ID Banner */}
      <div style={{ padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '12.5px', color: '#0369a1' }}>
        ℹ️ <b>Single Identity:</b> Employee Code & User ID are identical and used for direct SFA mobile & web login.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <TextField
          label="Employee Code / User ID *"
          value={draft.userId}
          onChange={(v) => {
            const clean = v.trim().toUpperCase();
            setDraft((prev) => ({ ...prev, userId: clean, empCode: clean }));
          }}
          placeholder="e.g. CK001"
          disabled={isEditing}
        />

        <SelectField
          label="Designation / Role *"
          value={draft.role}
          onChange={(v) => setDraft((prev) => ({ ...prev, role: v as SfaRole }))}
          options={roleOptions}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <TextField
          label="First Name *"
          value={draft.firstName}
          onChange={(v) => setDraft((prev) => ({ ...prev, firstName: v, fullName: `${v} ${prev.lastName}`.trim() }))}
          placeholder="e.g. Rahul"
        />
        <TextField
          label="Middle Name"
          value={draft.middleName || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, middleName: v }))}
          placeholder="e.g. Kumar"
        />
        <TextField
          label="Last Name *"
          value={draft.lastName}
          onChange={(v) => setDraft((prev) => ({ ...prev, lastName: v, fullName: `${prev.firstName} ${v}`.trim() }))}
          placeholder="e.g. Sharma"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <SelectField
          label="Marketing Division *"
          value={draft.divisionId || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, divisionId: v }))}
          options={[
            { v: '', l: '-- Select Marketing Division --' },
            ...divisionOptions,
          ]}
        />

        <SelectField
          label="Assigned Field HQ (Territory)"
          value={draft.hqId || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, hqId: v }))}
          options={hqOptions}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <SelectField
          label="Reporting Manager (Hierarchy)"
          value={draft.reportsToId || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, reportsToId: v }))}
          options={managerOptions}
        />

        <TextField
          label="Date of Joining"
          type="date"
          value={draft.joiningDate || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, joiningDate: v }))}
        />
      </div>

      {/* Password and Operational Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ position: 'relative' }}>
          <TextField
            label={isEditing ? 'New Password (leave blank to keep current)' : 'Initial Login Password *'}
            type={showPassword ? 'text' : 'password'}
            value={draft.password || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, password: v }))}
            placeholder={isEditing ? '••••••••' : 'Min 6 chars alphanumeric'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '32px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <SelectField
          label="Operational Account Status *"
          value={draft.isActive ? 'ACTIVE' : 'INACTIVE'}
          onChange={(v) => setDraft((prev) => ({ ...prev, isActive: v === 'ACTIVE' }))}
          options={[
            { v: 'ACTIVE', l: '🟢 Active & Functional' },
            { v: 'INACTIVE', l: '🔴 Inactive / Suspended' },
          ]}
        />
      </div>
    </div>
  );
}
