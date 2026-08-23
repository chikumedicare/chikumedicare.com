import React, { useState } from 'react';
import { Section } from '../../components/Section';
import { SelectField } from '../../components/FormFields';
import { Badge } from '../../components/Badge';
import type { SfaUser, SfaRole } from '../../domain/hr/user.types';

export const ROLE_HIERARCHY_LEVELS: Record<SfaRole, number> = {
  MR: 1,
  SR_MR: 2,
  ASM: 3,
  SR_ASM: 4,
  RSM: 5,
  ZSM: 6,
  NSM: 7,
  VP: 8,
  ADMIN: 9,
  OWNER: 10,
};

export function getAllSubordinateIds(userId: string, allUsers: SfaUser[]): Set<string> {
  const result = new Set<string>();
  const queue = [userId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const directSubs = allUsers.filter((u) => u.reportsToId === current);
    for (const sub of directSubs) {
      if (!result.has(sub.id)) {
        result.add(sub.id);
        queue.push(sub.id);
      }
    }
  }
  return result;
}

export function HierarchyAssignModal({
  user,
  allUsers,
  onSave,
  onClose,
}: {
  user: SfaUser;
  allUsers: SfaUser[];
  onSave: (userId: string, reportsToId: string | null) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const [reportsToId, setReportsToId] = useState(user.reportsToId || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const targetLevel = ROLE_HIERARCHY_LEVELS[user.role] || 1;
  const subordinateIds = getAllSubordinateIds(user.id, allUsers);
  const userDivision = (user as any).divisionId || (user as any).division_id || '';

  // Eligible Managers: Must be higher level (or Admin/Owner) and NOT a subordinate
  const eligibleManagers = allUsers
    .filter((m) => {
      if (m.id === user.id) return false;
      if (subordinateIds.has(m.id)) return false;
      const mLevel = ROLE_HIERARCHY_LEVELS[m.role] || 1;
      if (m.role === 'ADMIN' || m.role === 'OWNER') return true;
      return mLevel > targetLevel;
    })
    .sort((a, b) => {
      const aDiv = (a as any).divisionId || (a as any).division_id || '';
      const bDiv = (b as any).divisionId || (b as any).division_id || '';
      if (aDiv === userDivision && bDiv !== userDivision) return -1;
      if (bDiv === userDivision && aDiv !== userDivision) return 1;
      return 0;
    });

  const selectedManager = allUsers.find((m) => m.id === reportsToId);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await onSave(user.id, reportsToId || null);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to update reporting hierarchy');
      }
    } catch (e: any) {
      setError(e?.message || 'An error occurred');
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
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          maxWidth: '540px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              ⚡ Assign Reporting Supervisor
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Target Staff: <b>{user.fullName}</b> (Code: <code>{user.empCode || user.userId}</code>) • <Badge v={user.role} />
            </p>
          </div>
          <button type="button" className="secondary" onClick={onClose} style={{ padding: '4px 10px', fontSize: '12px' }}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <Section title="1. Select Direct Reporting Supervisor">
            <SelectField
              label="Reporting Manager *"
              value={reportsToId}
              onChange={setReportsToId}
              options={[
                { v: '', l: '👑 Direct to Head Office (Admin / Owner)' },
                ...eligibleManagers.map((m) => {
                  const mDiv = (m as any).divisionId || (m as any).division_id || '';
                  const sameDivTag = mDiv === userDivision ? ' [Same Division]' : '';
                  return {
                    v: m.id,
                    l: `${m.fullName} (${m.role} - ${m.empCode || m.userId})${sameDivTag}`,
                  };
                }),
              ]}
            />
            {eligibleManagers.length === 0 && (
              <small style={{ color: '#f59e0b', display: 'block', marginTop: '6px', fontWeight: 600 }}>
                ⚠️ No senior level field managers found. User reports directly to Head Office (Admin/Owner).
              </small>
            )}

            {selectedManager && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                <b style={{ color: '#166534' }}>Escalation Reporting Chain Preview:</b>
                <div style={{ marginTop: '4px', color: '#15803d', fontWeight: 600 }}>
                  {user.fullName} ({user.role}) ➔ <b>{selectedManager.fullName} ({selectedManager.role})</b> ➔ Head Office
                </div>
              </div>
            )}

            {error && (
              <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}
          </Section>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving Chain...' : 'Save Reporting Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
