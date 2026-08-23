import React, { useState } from 'react';
import { Badge } from '../../components/Badge';
import type { SfaUser } from '../../domain/hr/user.types';
import { useGeographyStore } from '../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';

interface TreeNodeProps {
  user: SfaUser;
  allUsers: SfaUser[];
  onSelectUser: (u: SfaUser) => void;
  onAssignManager: (u: SfaUser) => void;
}

function TreeNode({ user, allUsers, onSelectUser, onAssignManager }: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { getHqName } = useGeographyStore();

  const directSubordinates = allUsers.filter((u) => u.reportsToId === user.id && u.id !== user.id);
  const hasSubordinates = directSubordinates.length > 0;

  return (
    <div style={{ marginLeft: '24px', position: 'relative', marginTop: '10px' }}>
      {/* Node Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 14px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          maxWidth: '620px',
          position: 'relative',
        }}
      >
        {/* Expand / Collapse Button */}
        {hasSubordinates ? (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              padding: 0,
            }}
            title={collapsed ? 'Expand team' : 'Collapse team'}
          >
            {collapsed ? '+' : '−'}
          </button>
        ) : (
          <span style={{ width: '24px', textAlign: 'center', color: '#cbd5e1' }}>•</span>
        )}

        {/* Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: user.role === 'OWNER' ? '#fef3c7' : user.role === 'ADMIN' ? '#e0f2fe' : user.role === 'VP' ? '#f3e8ff' : '#f1f5f9',
            color: user.role === 'OWNER' ? '#b45309' : user.role === 'ADMIN' ? '#0284c7' : user.role === 'VP' ? '#7e22ce' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
          }}
        >
          {user.fullName.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
        </div>

        {/* User Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <b style={{ fontSize: '14px', color: '#0f172a' }}>{user.fullName}</b>
            <Badge v={user.role} />
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Code: <b>{user.empCode || user.userId}</b> • HQ: <b>{getHqName(user.hqId)}</b>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="secondary"
            onClick={() => onSelectUser(user)}
            style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
            title="Inspect Upward Approval Chain & Downward Subordinates"
          >
            👁️ Chain ({directSubordinates.length})
          </button>
          {user.role !== 'OWNER' && (
            <button
              type="button"
              className="primary"
              onClick={() => onAssignManager(user)}
              style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
              title="Assign or Change Reporting Manager"
            >
              ⚡ Assign
            </button>
          )}
        </div>
      </div>

      {/* Subordinates Recursive Tree */}
      {hasSubordinates && !collapsed && (
        <div
          style={{
            borderLeft: '2px dashed #cbd5e1',
            marginLeft: '12px',
            paddingLeft: '6px',
          }}
        >
          {directSubordinates.map((sub) => (
            <TreeNode
              key={sub.id}
              user={sub}
              allUsers={allUsers}
              onSelectUser={onSelectUser}
              onAssignManager={onAssignManager}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchyTree({
  users,
  onSelectUser,
  onAssignManager,
}: {
  users: SfaUser[];
  onSelectUser: (u: SfaUser) => void;
  onAssignManager: (u: SfaUser) => void;
}) {
  const { divisions } = useHeadOfficeStore();
  const [activeDivTab, setActiveDivTab] = useState<string>('ALL');

  // Group Users Division-Wise
  const owner = users.find((u) => u.role === 'OWNER');
  const admins = users.filter((u) => u.role === 'ADMIN');

  const getDivisionUsers = (divId: string) => {
    return users.filter((u) => {
      const uDiv = (u as any).divisionId || (u as any).division_id || '';
      return uDiv === divId && u.role !== 'ADMIN' && u.role !== 'OWNER';
    });
  };

  const getDivisionRoots = (divUsers: SfaUser[]) => {
    const userIds = new Set(divUsers.map((u) => u.id));
    return divUsers.filter((u) => !u.reportsToId || !userIds.has(u.reportsToId));
  };

  const activeDivisions = divisions.filter((d) => d.isActive !== false);

  return (
    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            🌳 Division-Wise Organizational Hierarchy Tree
          </h4>
          <small style={{ color: '#64748b' }}>
            Interactive reporting structure organized by Marketing Division from HO down to Field Representatives.
          </small>
        </div>
      </div>

      {/* Division Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveDivTab('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            background: activeDivTab === 'ALL' ? '#0284c7' : '#e2e8f0',
            color: activeDivTab === 'ALL' ? '#fff' : '#475569',
          }}
        >
          All Divisions ({users.length})
        </button>

        {activeDivisions.map((div) => {
          const divUsersCount = getDivisionUsers(div.id).length;
          return (
            <button
              key={div.id}
              type="button"
              onClick={() => setActiveDivTab(div.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                background: activeDivTab === div.id ? '#0284c7' : '#e2e8f0',
                color: activeDivTab === div.id ? '#fff' : '#475569',
              }}
            >
              🏢 {div.name} ({divUsersCount})
            </button>
          );
        })}
      </div>

      {/* 1. Global Head Office Top Authorities (Owner & Admin) */}
      {(activeDivTab === 'ALL' || activeDivTab === 'HO') && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <b style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
            👑 Head Office & Master Super Administrators
          </b>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px' }}>
                <b>👑 {owner.fullName}</b>
                <Badge v="OWNER" />
                <small style={{ color: '#b45309' }}>Code: {owner.empCode || owner.userId}</small>
              </div>
            )}
            {admins.map((adm) => (
              <div key={adm.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px' }}>
                <b>🛡️ {adm.fullName}</b>
                <Badge v="ADMIN" />
                <small style={{ color: '#0369a1' }}>Code: {adm.empCode || adm.userId}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Division Trees */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeDivisions
          .filter((d) => activeDivTab === 'ALL' || activeDivTab === d.id)
          .map((div) => {
            const divUsers = getDivisionUsers(div.id);
            const roots = getDivisionRoots(divUsers);

            return (
              <div key={div.id} style={{ padding: '18px', background: '#fff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <b style={{ fontSize: '15px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏢 Division: {div.name} ({div.code})
                  </b>
                  <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {divUsers.length} Members
                  </span>
                </div>

                <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                  {roots.map((root) => (
                    <TreeNode
                      key={root.id}
                      user={root}
                      allUsers={users}
                      onSelectUser={onSelectUser}
                      onAssignManager={onAssignManager}
                    />
                  ))}

                  {roots.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                      No staff mapped to Division {div.name} yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
