import React, { useState } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { SfaUser } from '../../domain/hr/user.types';
import { useGeographyStore } from '../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';

export function UserManagement({
  users,
  onAdd,
  onEdit,
  onToggleActive,
}: {
  users: SfaUser[];
  onAdd: () => void;
  onEdit: (u: SfaUser) => void;
  onToggleActive: (u: SfaUser) => void;
  onTransfer?: (u: SfaUser) => void;
  onPromotion?: (u: SfaUser) => void;
  onResetDevice?: (u: SfaUser) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (u: SfaUser) => void;
}) {
  const [q, setQ] = useState('');

  const { getHqName } = useGeographyStore();
  const { divisions } = useHeadOfficeStore();

  const getDivisionName = (divId?: string) => {
    if (!divId) return '-';
    return divisions.find((d) => d.id === divId)?.name || divId;
  };

  const list = users.filter((u) =>
    `${u.fullName} ${u.userId} ${u.empCode}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <Head
        title="User Management"
        sub="Create SFA logins, manage credentials and assign roles & HQ mappings."
        action={
          <button className="primary" onClick={onAdd}>
            + Create SFA User
          </button>
        }
      />
      <div className="toolbar">
        <input
          placeholder="Search by ID, Name or Code..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Employee Name</th>
              <th>Role</th>
              <th>Division</th>
              <th>Joining Date</th>
              <th>Assigned HQ</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.userId}</b>
                  <small>{u.empCode}</small>
                </td>
                <td>
                  <b>{u.fullName}</b>
                  <small>{u.designation}</small>
                </td>
                <td>
                  <Badge v={u.role} />
                </td>
                <td>
                  <small style={{ color: '#0284c7', fontWeight: 500 }}>
                    {getDivisionName((u as any).divisionId || (u as any).division_id)}
                  </small>
                </td>
                <td>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    {u.joiningDate || (u as any).joining_date || '-'}
                  </span>
                </td>
                <td>{getHqName(u.hqId)}</td>
                <td>
                  <span
                    onClick={() => onToggleActive(u)}
                    style={{ cursor: 'pointer' }}
                    title="Click to toggle active status"
                  >
                    <Badge v={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="link" onClick={() => onEdit(u)}>
                    Edit Profile
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No user records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
