export function getUpwardChain(user: SfaUser, allUsers: SfaUser[]): SfaUser[] {
  const chain: SfaUser[] = [];
  let curr: SfaUser | undefined = user;
  const visited = new Set<string>();

  while (curr && curr.reportsToId && !visited.has(curr.reportsToId)) {
    visited.add(curr.id);
    const parent: SfaUser | undefined = allUsers.find((x) => x.id === curr!.reportsToId);
    if (parent) {
      chain.push(parent);
      curr = parent;
    } else {
      break;
    }
  }
  return chain;
}

import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import { Badge } from '../../../components/Badge';
import type { SfaUser, SfaRole } from '../../../core/domain/hr/user.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { HierarchyAssignModal } from './HierarchyAssignModal';
import { HierarchyChainInspectorModal } from './HierarchyChainInspectorModal';

export function RoleHierarchy({
  users,
  onUpdateHierarchy,
}: {
  users: SfaUser[];
  onUpdateHierarchy: (userId: string, reportsToId: string | null) => Promise<{ success: boolean; error?: string }>;
}) {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [assignUser, setAssignUser] = useState<SfaUser | null>(null);
  const [inspectUser, setInspectUser] = useState<SfaUser | null>(null);

  const { getHqName } = useGeographyStore();

  const handleSaveHierarchy = async (userId: string, reportsToId: string | null) => {
    return await onUpdateHierarchy(userId, reportsToId);
  };

  const displayUsers = users.filter((u) => (u.role as string) !== 'ADMIN');
  const filteredUsers = displayUsers.filter((u) => {
    const qLower = q.toLowerCase();
    const matchesQ =
      u.fullName.toLowerCase().includes(qLower) ||
      u.userId.toLowerCase().includes(qLower) ||
      (u.empCode && u.empCode.toLowerCase().includes(qLower)) ||
      u.role.toLowerCase().includes(qLower);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesQ && matchesRole;
  });

  const rolesConfig: { role: SfaRole; label: string; icon: string; color: string }[] = [
        { role: 'OWNER', label: 'OWNER', icon: '👑', color: '#b45309' },
    { role: 'VP', label: 'VP', icon: '👔', color: '#6b21a8' },
    { role: 'NSM', label: 'NSM', icon: '⭐', color: '#1e40af' },
    { role: 'ZSM', label: 'ZSM', icon: '🌐', color: '#0369a1' },
    { role: 'RSM', label: 'RSM', icon: '🏢', color: '#0f766e' },
    { role: 'ASM', label: 'ASM', icon: '📍', color: '#15803d' },
    { role: 'MR', label: 'MR', icon: '💊', color: '#0284c7' },
  ];

  return (
    <>
      <Head
        title="Role & Hierarchy Management"
        sub="Organize Division-wise reporting structures, multi-level approval chains and supervisor assignments."
      />

      {/* Ultra Clean Role Counter Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setRoleFilter('ALL')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: roleFilter === 'ALL' ? '#0f172a' : '#f1f5f9',
            color: roleFilter === 'ALL' ? '#ffffff' : '#475569',
            transition: 'all 0.15s ease',
          }}
        >
          All Users ({displayUsers.length})
        </button>

        {rolesConfig.map((r) => {
          const count = displayUsers.filter((u) => u.role === r.role).length;
          const isSelected = roleFilter === r.role;

          return (
            <button
              key={r.role}
              type="button"
              onClick={() => setRoleFilter(isSelected ? 'ALL' : r.role)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: isSelected ? `2px solid ${r.color}` : '1px solid #e2e8f0',
                cursor: 'pointer',
                background: isSelected ? '#ffffff' : '#f8fafc',
                color: isSelected ? r.color : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{r.icon}</span>
              <span>{r.label}: <b>{count}</b></span>
            </button>
          );
        })}
      </div>

      {/* Simple Search Toolbar */}
      <div style={{ background: '#ffffff', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '16px' }}>🔍</span>
        <input
          placeholder="Search team members by Name, Employee Code or Role..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' }}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Ultra Clean Hierarchy List Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 18px' }}>User Details</th>
              <th style={{ padding: '14px 18px' }}>Assigned Role</th>
              <th style={{ padding: '14px 18px' }}>Reporting Supervisor (Boss)</th>
              <th style={{ padding: '14px 18px' }}>HQ Location</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const manager = displayUsers.find((x) => x.id === u.reportsToId);
              const directSubsCount = displayUsers.filter((x) => x.reportsToId === u.id).length;

              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {/* User Name & Code */}
                  <td style={{ padding: '14px 18px' }}>
                    <b style={{ color: '#0f172a', fontSize: '14px', display: 'block' }}>{u.fullName}</b>
                    <small style={{ color: '#64748b' }}>Code: <code style={{ color: '#0284c7', fontWeight: 600 }}>{u.empCode || u.userId}</code></small>
                  </td>

                  {/* Role Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <Badge v={u.role} />
                  </td>

                  {/* Supervisor (Boss) */}
                  <td style={{ padding: '14px 18px' }}>
                    {manager ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600 }}>
                        <span>👨‍💼</span>
                        <span>{manager.fullName} <small style={{ color: '#64748b' }}>({manager.role})</small></span>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>👑</span> Top Authority / Self
                      </span>
                    )}
                  </td>

                  {/* HQ Location */}
                  <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 500 }}>
                    {getHqName(u.hqId)}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setInspectUser(u)}
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', cursor: 'pointer' }}
                        title="View Full Reporting Chain"
                      >
                        🔍 Chain ({directSubsCount})
                      </button>
                      {u.role !== 'OWNER' && (
                        <button
                          type="button"
                          onClick={() => setAssignUser(u)}
                          style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                          title="Assign or Change Reporting Manager"
                        >
                          ✏️ Assign Boss
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                  No team members found matching your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Reporting Manager Modal */}
      {assignUser && (
        <HierarchyAssignModal
          user={assignUser}
          allUsers={users}
          onSave={handleSaveHierarchy}
          onClose={() => setAssignUser(null)}
        />
      )}

      {/* Hierarchy Chain Inspector Modal */}
      {inspectUser && (
        <HierarchyChainInspectorModal
          user={inspectUser}
          allUsers={users}
          onClose={() => setInspectUser(null)}
          onAssignManager={(u) => setAssignUser(u)}
        />
      )}
    </>
  );
}
