import React, { useState } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { SfaUser } from '../../domain/hr/user.types';
import { useGeographyStore } from '../../store/hr/useGeographyStore';
import { HierarchyTree } from './HierarchyTree';
import { HierarchyAssignModal } from './HierarchyAssignModal';
import { HierarchyChainInspectorModal } from './HierarchyChainInspectorModal';

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

export function RoleHierarchy({
  users,
  onUpdateHierarchy,
}: {
  users: SfaUser[];
  onUpdateHierarchy: (userId: string, reportsToId: string | null) => Promise<{ success: boolean; error?: string }>;
}) {
  const [viewMode, setViewMode] = useState<'TREE' | 'MATRIX'>('TREE');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [assignUser, setAssignUser] = useState<SfaUser | null>(null);
  const [inspectUser, setInspectUser] = useState<SfaUser | null>(null);

  const { getHqName } = useGeographyStore();

  const handleSaveHierarchy = async (userId: string, reportsToId: string | null) => {
    return await onUpdateHierarchy(userId, reportsToId);
  };

  const filteredUsers = users.filter((u) => {
    const qLower = q.toLowerCase();
    const matchesQ =
      u.fullName.toLowerCase().includes(qLower) ||
      u.userId.toLowerCase().includes(qLower) ||
      (u.empCode && u.empCode.toLowerCase().includes(qLower)) ||
      u.role.toLowerCase().includes(qLower);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesQ && matchesRole;
  });

  const fieldUsers = users.filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER');
  const totalUsers = users.length;
  const assignedWithManager = fieldUsers.filter((u) => !!u.reportsToId).length;
  const directToHo = fieldUsers.length - assignedWithManager;

  return (
    <>
      <Head
        title="Role & Hierarchy Management"
        sub="Organize Division-wise reporting structures, multi-level approval chains and supervisor assignments."
      />

      {/* Overview Headcount Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Headcount</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>👥 {totalUsers}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>Field Representatives</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>💊 {fieldUsers.length}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Mapped to Supervisor</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '4px' }}>✅ {assignedWithManager}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: directToHo > 0 ? '#f59e0b' : '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Direct to Head Office</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: directToHo > 0 ? '#f59e0b' : '#0f172a', marginTop: '4px' }}>
            👑 {directToHo}
          </div>
        </div>
      </div>

      {/* Toolbar & View Mode Switcher */}
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
          <input
            placeholder="Search by Employee, User ID, Role or HQ..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1 }}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <option value="ALL">All Roles</option>
            <option value="MR">MR</option>
            <option value="ASM">ASM</option>
            <option value="RSM">RSM</option>
            <option value="ZSM">ZSM</option>
            <option value="NSM">NSM</option>
            <option value="VP">VP</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OWNER">OWNER</option>
          </select>
        </div>

        {/* Toggle Button */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={viewMode === 'TREE' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('TREE')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
          >
            🌳 Visual Org Tree
          </button>
          <button
            type="button"
            className={viewMode === 'MATRIX' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('MATRIX')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
          >
            📋 Hierarchy Matrix List
          </button>
        </div>
      </div>

      {/* 1. View Mode: Visual Org Tree */}
      {viewMode === 'TREE' && (
        <HierarchyTree
          users={filteredUsers}
          onSelectUser={(u) => setInspectUser(u)}
          onAssignManager={(u) => setAssignUser(u)}
        />
      )}

      {/* 2. View Mode: Hierarchy Matrix List */}
      {viewMode === 'MATRIX' && (
        <div className="panel table">
          <table>
            <thead>
              <tr>
                <th>Employee & User ID</th>
                <th>Role & Title</th>
                <th>Direct Reporting Supervisor</th>
                <th>Full Escalation Approval Chain</th>
                <th>Base HQ</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const manager = users.find((x) => x.id === u.reportsToId);
                const upwardChain = getUpwardChain(u, users);
                const directSubsCount = users.filter((x) => x.reportsToId === u.id).length;

                return (
                  <tr key={u.id}>
                    <td>
                      <b>{u.fullName}</b>
                      <small style={{ display: 'block' }}>Code: <code>{u.empCode || u.userId}</code></small>
                    </td>
                    <td>
                      <Badge v={u.role} />
                      <small style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>
                        {u.designation || u.role}
                      </small>
                    </td>
                    <td>
                      {manager ? (
                        <div>
                          <b style={{ color: '#0f766e' }}>{manager.fullName}</b>
                          <small style={{ display: 'block', color: '#64748b' }}>({manager.role} • <code>{manager.empCode || manager.userId}</code>)</small>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontWeight: 500 }}>
                          👑 Direct to Head Office
                        </span>
                      )}
                    </td>
                    <td>
                      {upwardChain.length > 0 ? (
                        <small style={{ color: '#0284c7', fontWeight: 600 }}>
                          {upwardChain.map((m) => `${m.fullName} (${m.role})`).join(' ➔ ')}
                        </small>
                      ) : (
                        <small style={{ color: '#94a3b8' }}>Top Authority / HO</small>
                      )}
                    </td>
                    <td>{getHqName(u.hqId)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="links" style={{ gap: '8px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="link"
                          style={{ color: '#0284c7', fontWeight: 600 }}
                          title="Inspect Multi-Level Approval Chain and Team Members"
                          onClick={() => setInspectUser(u)}
                        >
                          👁️ Chain ({directSubsCount})
                        </button>
                        {u.role !== 'OWNER' && (
                          <button
                            type="button"
                            className="link"
                            style={{ color: '#16a34a', fontWeight: 600 }}
                            title="Assign or change supervisor"
                            onClick={() => setAssignUser(u)}
                          >
                            ⚡ Assign Manager
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Assign Reporting Manager Modal */}
      {assignUser && (
        <HierarchyAssignModal
          user={assignUser}
          allUsers={users}
          onSave={handleSaveHierarchy}
          onClose={() => setAssignUser(null)}
        />
      )}

      {/* 4. Hierarchy Chain Inspector Modal */}
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
