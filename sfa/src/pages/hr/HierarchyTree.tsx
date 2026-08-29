import React, { useState } from 'react';
import { Badge } from '../../components/Badge';
import type { SfaUser } from '../../core/domain/hr/user.types';
import { useGeographyStore } from '../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';

const roleRank: Record<string, number> = {
  OWNER: 1,
  ADMIN: 2,
  VP: 3,
  NSM: 4,
  ZSM: 5,
  RSM: 6,
  ASM: 7,
  MR: 8,
};

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
  const { getHqName } = useGeographyStore();
  const [selectedDiv, setSelectedDiv] = useState<string>('ALL');

  // Filter users by selected division
  const displayUsers = users.filter((u) => {
    if (selectedDiv === 'ALL') return true;
    const uDiv = u.divisionId;
    return uDiv === selectedDiv || u.role === 'ADMIN' || u.role === 'OWNER';
  });

  // Sort by role hierarchy rank
  const sortedUsers = [...displayUsers].sort(
    (a, b) => (roleRank[a.role] || 99) - (roleRank[b.role] || 99)
  );

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      {/* Header & Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌳</span> <span>Organizational Reporting Hierarchy</span>
          </h4>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Simple view of team members, reporting bosses and supervisor assignments.
          </p>
        </div>

        {/* Division Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedDiv('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: selectedDiv === 'ALL' ? '#0284c7' : '#f1f5f9',
              color: selectedDiv === 'ALL' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            All Staff ({users.length})
          </button>
          {divisions.map((div) => {
            const count = users.filter((u) => {
              const uDiv = u.divisionId;
              return uDiv === div.id;
            }).length;

            return (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDiv(div.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedDiv === div.id ? '#0284c7' : '#f1f5f9',
                  color: selectedDiv === div.id ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                💼 {div.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* User Hierarchy Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedUsers.map((u) => {
          const manager = users.find((m) => m.id === u.reportsToId);
          const subordinatesCount = users.filter((x) => x.reportsToId === u.id).length;

          return (
            <div
              key={u.id}
              style={{
                background: '#f8fafc',
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              {/* Left Info: Name, Role Badge, Code & HQ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: u.role === 'OWNER' ? '#fef3c7' : u.role === 'ADMIN' ? '#fff1f2' : '#e0f2fe',
                    color: u.role === 'OWNER' ? '#b45309' : u.role === 'ADMIN' ? '#be123c' : '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 700,
                  }}
                >
                  {u.role === 'OWNER' ? '👑' : u.role === 'ADMIN' ? '🛡️' : '👤'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {u.fullName}
                    </h5>
                    <Badge v={u.role} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    Emp Code / User ID: <b style={{ color: '#0284c7' }}>{u.empCode || u.userId}</b> | HQ: <b>{getHqName(u.hqId)}</b>
                  </div>
                </div>
              </div>

              {/* Middle Info: Reporting Supervisor */}
              <div style={{ minWidth: '220px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Reporting Supervisor
                </div>
                {manager ? (
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f766e', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👨‍💼</span>
                    <span>{manager.fullName} ({manager.role})</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👑</span>
                    <span>Top Level Authority</span>
                  </div>
                )}
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onSelectUser(u)}
                  style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px' }}
                  title="Inspect Approval Chain and Team Members"
                >
                  🔍 Chain ({subordinatesCount})
                </button>
                {u.role !== 'OWNER' && (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => onAssignManager(u)}
                    style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', background: '#0284c7', borderColor: '#0284c7' }}
                    title="Assign or Change Reporting Supervisor"
                  >
                    ✏️ Assign Manager
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {sortedUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
            No staff records found in this division.
          </div>
        )}
      </div>
    </div>
  );
}
