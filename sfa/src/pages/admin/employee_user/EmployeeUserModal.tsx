import React, { useState } from 'react';
import type { EmployeeUserDraft, EmployeeUserRecord } from './employeeUser.types';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import type { Headquarter, State } from '../../../core/domain/hr/geography.types';
import { EmployeeUserRoleTab } from './EmployeeUserRoleTab';
import { EmployeeUserPersonalTab } from './EmployeeUserPersonalTab';
import { EmployeeUserKycBankTab } from './EmployeeUserKycBankTab';
import { getErrorMessage } from '../../../utils/dataIntegrity';

interface EmployeeUserModalProps {
  item?: EmployeeUserRecord | null;
  divisions: Division[];
  hqs: Headquarter[];
  states?: State[];
  allUsers: SfaUser[];
  onSave: (draft: EmployeeUserDraft) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function EmployeeUserModal({
  item,
  divisions,
  hqs,
  states = [],
  allUsers,
  onSave,
  onClose,
}: EmployeeUserModalProps) {
  const isEditing = Boolean(item && item.id);
  const [activeTab, setActiveTab] = useState<'ROLE' | 'PERSONAL' | 'KYC'>('ROLE');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<EmployeeUserDraft>(() => {
    if (item) {
      return { ...item };
    }
    // Auto calculate suggestion for next employee code
    const existingNums = allUsers
      .map((u) => {
        const m = (u.userId || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextCode = `CK${String(maxNum + 1).padStart(3, '0')}`;

    return {
      userId: nextCode,
      empCode: nextCode,
      firstName: '',
      lastName: '',
      role: 'MR',
      divisionId: divisions.length > 0 ? divisions[0].id : '',
      hqId: '',
      reportsToId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      isActive: true,
      mobile: '',
      alternateMobile: '',
      email: '',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      bloodGroup: 'O+',
      password: '',
    };
  });

  const validate = (): string | null => {
    if (!draft.userId.trim()) return 'Employee Code / User ID is required';
    if (!draft.firstName.trim()) return 'First Name is required';
    if (!draft.lastName.trim()) return 'Last Name is required';
    if (!draft.mobile.trim() || draft.mobile.trim().length !== 10) return 'Valid 10-digit primary mobile number is required';
    if (!isEditing && (!draft.password || draft.password.length < 6)) {
      return 'Initial login password must be at least 6 characters';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valErr = validate();
    if (valErr) {
      setError(valErr);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await onSave(draft);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
          maxWidth: '720px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {isEditing ? `✏️ Edit Profile: ${draft.fullName || draft.firstName} (${draft.userId})` : '➕ Onboard Employee & SFA User'}
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              Single-point unified registration for HR identity, payroll credentials, and SFA field reporting access
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#64748b',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div style={{ display: 'flex', gap: '8px', margin: '16px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('ROLE')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              background: activeTab === 'ROLE' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'ROLE' ? '#ffffff' : '#475569',
            }}
          >
            💼 1. Work & Login Credentials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PERSONAL')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              background: activeTab === 'PERSONAL' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'PERSONAL' ? '#ffffff' : '#475569',
            }}
          >
            👤 2. Personal & Contact Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('KYC')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              background: activeTab === 'KYC' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'KYC' ? '#ffffff' : '#475569',
            }}
          >
            🏦 3. Bank & KYC Records
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '14px', color: '#dc2626', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Form Content Body (Scrollable) */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {activeTab === 'ROLE' && (
            <EmployeeUserRoleTab
              draft={draft}
              setDraft={setDraft}
              isEditing={isEditing}
              divisions={divisions}
              hqs={hqs}
              allUsers={allUsers}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}

          {activeTab === 'PERSONAL' && (
            <EmployeeUserPersonalTab draft={draft} setDraft={setDraft} />
          )}

          {activeTab === 'KYC' && (
            <EmployeeUserKycBankTab draft={draft} setDraft={setDraft} />
          )}

          {/* Modal Footer Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTab !== 'ROLE' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'KYC' ? 'PERSONAL' : 'ROLE')}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  ⬅ Previous Tab
                </button>
              )}
              {activeTab !== 'KYC' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'ROLE' ? 'PERSONAL' : 'KYC')}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Next Tab ➔
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '8px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: saving ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                }}
              >
                {saving ? 'Saving...' : isEditing ? 'Update Profile' : 'Save & Onboard User'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
