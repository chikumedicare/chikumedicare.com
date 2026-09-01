import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import { Badge } from '../../../components/Badge';
import { useHrStore } from '../../../store/hr/useHrStore';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../../store/hr/useAuthSessionStore';
import type { SfaUser, SfaRole } from '../../../core/domain/hr/user.types';
import { HierarchyAssignModal } from './HierarchyAssignModal';
import { HierarchyChainInspectorModal } from './HierarchyChainInspectorModal';
import { HierarchyTree } from './HierarchyTree';

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

interface RoleHierarchyProps {
  users?: SfaUser[];
  onUpdateHierarchy?: (userId: string, reportsToId: string | null) => Promise<{ success: boolean; error?: string }>;
}

export function RoleHierarchy({ users: propUsers, onUpdateHierarchy }: RoleHierarchyProps) {
  const { users: storeUsers, updateUserHierarchy, refresh: refreshHr } = useHrStore();
  const { getHqName, refresh: refreshGeo } = useGeographyStore();
  const { divisions } = useHeadOfficeStore();
  const { role: sessionRole, divisionId: sessionDivisionId } = useAuthSessionStore();

  const users = propUsers || storeUsers;

  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'LIST' | 'TREE'>('LIST');

  // Modal States
  const [assignUser, setAssignUser] = useState<SfaUser | null>(null);
  const [inspectUser, setInspectUser] = useState<SfaUser | null>(null);

  const isAdminOrOwner = sessionRole === 'ADMIN' || sessionRole === 'OWNER';

  // Filter users by session division if not Admin/Owner
  const displayUsers = users.filter((u) => {
    if (isAdminOrOwner) return true;
    if (u.role === 'ADMIN' || u.role === 'OWNER') return true;
    return u.divisionId === sessionDivisionId;
  });

  const filteredUsers = displayUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (q.trim()) {
      const haystack = `${u.fullName} ${u.userId} ${u.empCode || ''} ${u.role} ${getHqName(u.hqId)}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  const handleSaveHierarchy = async (userId: string, reportsToId: string | null) => {
    if (onUpdateHierarchy) {
      const res = await onUpdateHierarchy(userId, reportsToId);
      if (res.success) {
        await Promise.all([refreshHr(true), refreshGeo(true)]);
      }
      return res;
    }
    const res = await updateUserHierarchy(userId, reportsToId || undefined);
    if (res.success) {
      await Promise.all([refreshHr(true), refreshGeo(true)]);
    }
    return res;
  };

  const rolesConfig: { role: SfaRole; label: string; icon: string; color: string }[] = [
    { role: 'OWNER', label: 'Owner', icon: '👑', color: '#b45309' },
    { role: 'ADMIN', label: 'Admin', icon: '🛡️', color: '#be123c' },
    { role: 'VP', label: 'VP / Head', icon: '💼', color: '#7c3aed' },
    { role: 'NSM', label: 'NSM', icon: '🚀', color: '#0d9488' },
    { role: 'ZSM', label: 'ZSM', icon: '🌐', color: '#0369a1' },
    { role: 'RSM', label: 'RSM', icon: '🏢', color: '#0f766e' },
    { role: 'ASM', label: 'ASM', icon: '📍', color: '#15803d' },
    { role: 'MR', label: 'MR', icon: '💊', color: '#0284c7' },
  ];

  return (
    <>
      <Head
        title="Role & Hierarchy Management"
        sub="Dual Apex Governance (Admin & Owner) with multi-level field reporting lines and escalation chains."
      />

      {/* Role Counter Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setRoleFilter('ALL')}
          style={{
            padding: '7px 14px',
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
                padding: '7px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                border: isSelected ? `2px solid ${r.color}` : '1px solid #e2e8f0',
                cursor: 'pointer',
                background: isSelected ? '#ffffff' : '#f8fafc',
                color: isSelected ? r.color : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{r.icon}</span>
              <span>{r.label}: <b>{count}</b></span>
            </button>
          );
        })}
      </div>

      {/* View Mode Switch & Search Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('LIST')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'LIST' ? '#ffffff' : 'transparent',
              color: activeTab === 'LIST' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'LIST' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            📋 List Table View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TREE')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'TREE' ? '#ffffff' : 'transparent',
              color: activeTab === 'TREE' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'TREE' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            🌳 Tree Hierarchy View
          </button>
        </div>

        {activeTab === 'LIST' && (
          <div style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', gap: '8px', alignItems: 'center', flex: '1 1 240px', maxWidth: '400px' }}>
            <span style={{ color: '#64748b', fontSize: '13px' }}>🔍</span>
            <input
              placeholder="Search user, code, role or HQ..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '12.5px', background: 'transparent' }}
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab === 'TREE' ? (
        <HierarchyTree
          users={displayUsers}
          onSelectUser={(u) => setInspectUser(u)}
          onAssignManager={(u) => setAssignUser(u)}
        />
      ) : (
        /* Ultra Clean Hierarchy List Table */
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>User Details</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Reporting Supervisor</th>
                <th style={{ padding: '12px 16px' }}>Base HQ</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const manager = displayUsers.find((x) => x.id === u.reportsToId);
                const directSubsCount = displayUsers.filter((x) => x.reportsToId === u.id).length;
                const isApex = u.role === 'OWNER' || u.role === 'ADMIN';

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <b style={{ color: '#0f172a', fontSize: '13.5px', display: 'block' }}>{u.fullName}</b>
                      <small style={{ color: '#64748b' }}>Code: <code style={{ color: '#0284c7', fontWeight: 600 }}>{u.empCode || u.userId}</code></small>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <Badge v={u.role} />
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {manager ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600 }}>
                          <span>👨‍💼</span>
                          <span>{manager.fullName} <small style={{ color: '#64748b' }}>({manager.role})</small></span>
                        </div>
                      ) : isApex ? (
                        <span style={{ color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>👑</span> Dual Apex Authority
                        </span>
                      ) : (
                        <span style={{ color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>👑</span> Default: Apex (Owner & Admin)
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 500 }}>
                      {getHqName(u.hqId) || 'Head Office'}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setInspectUser(u)}
                          style={{ padding: '5px 10px', fontSize: '11.5px', fontWeight: 600, background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '6px', cursor: 'pointer' }}
                          title="View Full Reporting Chain"
                        >
                          🔍 Chain ({directSubsCount})
                        </button>
                        {!isApex && (
                          <button
                            type="button"
                            onClick={() => setAssignUser(u)}
                            style={{ padding: '5px 12px', fontSize: '11.5px', fontWeight: 700, background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
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
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13.5px', fontWeight: 600 }}>
                    No team members found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
