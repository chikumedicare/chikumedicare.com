import React, { useState, useEffect } from 'react';
import { TextField, SelectField } from '../../../components/FormFields';
import type { EmployeeUserDraft } from './employeeUser.types';
import { generateNextEmployeeUserId } from './employeeUser.types';
import type { SfaRole, SfaUser } from '../../../core/domain/hr/user.types';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import type { Headquarter, State } from '../../../core/domain/hr/geography.types';

interface EmployeeUserRoleTabProps {
  draft: EmployeeUserDraft;
  setDraft: React.Dispatch<React.SetStateAction<EmployeeUserDraft>>;
  isEditing: boolean;
  divisions: Division[];
  hqs: Headquarter[];
  states?: State[];
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
  states = [],
  allUsers,
  showPassword,
  setShowPassword,
}: EmployeeUserRoleTabProps) {
  // Initialize state selector from current HQ if editing
  const currentHq = hqs.find((h) => h.id === draft.hqId);
  const [selectedStateId, setSelectedStateId] = useState<string>(currentHq?.stateId || '');

  useEffect(() => {
    if (draft.hqId && !selectedStateId) {
      const hq = hqs.find((h) => h.id === draft.hqId);
      if (hq?.stateId) setSelectedStateId(hq.stateId);
    }
  }, [draft.hqId, hqs, selectedStateId]);

  const isCorporateRole = draft.role === 'ADMIN' || draft.role === 'OWNER';

  // Grouped Role Options
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

  // Filter HQs by selected State and Division
  const availableHqs = hqs.filter((h) => {
    if (selectedStateId && h.stateId !== selectedStateId) return false;
    if (draft.divisionId && h.divisionId && h.divisionId !== draft.divisionId) return false;
    return true;
  });

  const hqOptions = [
    { v: '', l: selectedStateId ? '-- Select Field Territory / HQ --' : '-- Select State First --' },
    ...availableHqs.map((h) => ({
      v: h.id,
      l: `📍 ${h.name} (${h.code || 'HQ'})`,
    })),
  ];

  // Smart Hierarchy-Based Manager Filtering
  const getFilteredManagers = (): { v: string; l: string }[] => {
    let candidateRoles: SfaRole[] = [];

    if (draft.role === 'MR' || draft.role === 'SR_MR') {
      candidateRoles = ['ASM', 'SR_ASM', 'RSM'];
    } else if (draft.role === 'ASM' || draft.role === 'SR_ASM') {
      candidateRoles = ['RSM', 'ZSM'];
    } else if (draft.role === 'RSM') {
      candidateRoles = ['ZSM', 'NSM', 'VP'];
    } else if (draft.role === 'ZSM') {
      candidateRoles = ['NSM', 'VP', 'OWNER'];
    } else if (draft.role === 'NSM') {
      candidateRoles = ['VP', 'OWNER'];
    } else if (draft.role === 'VP') {
      candidateRoles = ['OWNER'];
    }

    const filtered = allUsers.filter((u) => {
      if (u.userId === draft.userId || !u.isActive) return false;
      if (candidateRoles.length > 0 && !candidateRoles.includes(u.role)) return false;
      // Prefer same division if available
      if (draft.divisionId && u.divisionId && u.divisionId !== draft.divisionId) return false;
      return true;
    });

    // Fallback if none in same division: show candidates across divisions
    const finalCandidates = filtered.length > 0
      ? filtered
      : allUsers.filter((u) => u.userId !== draft.userId && u.isActive && (candidateRoles.length === 0 || candidateRoles.includes(u.role)));

    return [
      { v: '', l: '-- Direct to Head Office / Apex --' },
      ...finalCandidates.map((u) => ({
        v: u.id,
        l: `${u.fullName} (${u.role} - ${u.userId})`,
      })),
    ];
  };

  const managerOptions = getFilteredManagers();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Employee Code / User ID Banner */}
      <div style={{ padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '12.5px', color: '#0369a1' }}>
        ℹ️ <b>Single Identity:</b> Employee Code & User ID are identical and used for direct SFA mobile & web login.
      </div>

      {/* Row 1: Code & Role */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <TextField
          label="Employee Code / User ID (Auto-Generated) 🔒"
          value={draft.userId}
          onChange={(v) => {
            const clean = v.trim().toUpperCase();
            setDraft((prev) => ({ ...prev, userId: clean, empCode: clean }));
          }}
          placeholder="e.g. CK001"
          disabled={true}
        />

        <SelectField
          label="Designation / Role *"
          value={draft.role}
          onChange={(v) => {
            const newRole = v as SfaRole;
            setDraft((prev) => {
              const updatedCode = !isEditing ? generateNextEmployeeUserId(newRole, allUsers) : prev.userId;
              return {
                ...prev,
                role: newRole,
                userId: updatedCode,
                empCode: updatedCode,
                password: !isEditing ? updatedCode.toLowerCase() : prev.password,
                reportsToId: '', // Reset manager on role change to prevent invalid hierarchy
                hqId: (newRole === 'ADMIN' || newRole === 'OWNER') ? '' : prev.hqId,
              };
            });
          }}
          options={roleOptions}
        />
      </div>

      {/* Row 2: Name */}
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

      {/* Row 3: Marketing Division */}
      <div style={{ display: 'grid', gridTemplateColumns: isCorporateRole ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>
        <SelectField
          label="Marketing Division *"
          value={draft.divisionId || ''}
          onChange={(v) => setDraft((prev) => ({ ...prev, divisionId: v, hqId: '', reportsToId: '' }))}
          options={[
            { v: '', l: '-- Select Marketing Division --' },
            ...divisionOptions,
          ]}
        />

        {/* Step-by-Step Cascading State & HQ (Only for Field Roles) */}
        {!isCorporateRole && (
          <>
            <SelectField
              label="State (Filters HQs)"
              value={selectedStateId}
              onChange={(v) => {
                setSelectedStateId(v);
                setDraft((prev) => ({ ...prev, hqId: '' })); // Reset HQ when state changes
              }}
              options={[
                { v: '', l: '-- All States --' },
                ...states.map((s) => ({ v: s.id, l: `📍 ${s.name}` })),
              ]}
            />

            <SelectField
              label="Assigned Field HQ (Territory)"
              value={draft.hqId || ''}
              onChange={(v) => setDraft((prev) => ({ ...prev, hqId: v }))}
              options={hqOptions}
            />
          </>
        )}
      </div>

      {/* Corporate Role Banner */}
      {isCorporateRole && (
        <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12.5px', color: '#475569' }}>
          🏢 <b>Head Office Governance:</b> System Administrator & Company Directors have Pan-India administrative access. No local field territory or reporting manager required.
        </div>
      )}

      {/* Row 4: Reporting Manager & Date of Joining */}
      <div style={{ display: 'grid', gridTemplateColumns: isCorporateRole ? '1fr' : '1fr 1fr', gap: '12px' }}>
        {!isCorporateRole && (
          <SelectField
            label={`Reporting Manager (${draft.role === 'MR' ? 'ASM' : draft.role === 'ASM' ? 'RSM' : 'Senior Lead'})`}
            value={draft.reportsToId || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, reportsToId: v }))}
            options={managerOptions}
          />
        )}

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
            label={isEditing ? 'New Password (leave blank to keep current)' : `Initial Login Password (Default: ${draft.userId.toLowerCase()}) *`}
            type={showPassword ? 'text' : 'password'}
            value={draft.password || ''}
            onChange={(v) => setDraft((prev) => ({ ...prev, password: v }))}
            placeholder={isEditing ? '••••••••' : draft.userId.toLowerCase()}
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
