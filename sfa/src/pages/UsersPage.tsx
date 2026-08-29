import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Badge } from '../components/Badge';
import { users, hqs } from '../data';
import type { User } from '../types';

export function UsersPage({
  onAdd,
  onEdit,
  onTransfer,
  onPromotion,
}: {
  onAdd: () => void;
  onEdit: (u: User) => void;
  onTransfer: (u: User) => void;
  onPromotion: (u: User) => void;
}) {
  const [q, setQ] = useState('');

  const list = users.filter((u) =>
    `${u.fullName} ${u.userId} ${u.empCode}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <>
      <Head
        title="User Management"
        sub="Create SFA logins, manage lifecycle and assign roles."
        action={
          <button className="primary" onClick={onAdd}>
            ＋ Create User
          </button>
        }
      />
      <div className="toolbar">
        <input
          placeholder="Search by ID or Name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Employee</th>
              <th>Role</th>
              <th>HQ</th>
              <th>Status</th>
              <th>Lifecycle</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.fullName}</b>
                  <small>{u.userId}</small>
                </td>
                <td>{u.empCode}</td>
                <td>
                  <Badge v={u.role} />
                </td>
                <td>{hqs.find((h) => h.id === u.hqId)?.name || '—'}</td>
                <td>
                  <Badge v={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </td>
                <td>
                  <div className="links">
                    <button className="link" onClick={() => onEdit(u)}>
                      Edit
                    </button>
                    <button className="link" onClick={() => onTransfer(u)}>
                      Transfer
                    </button>
                    <button className="link" onClick={() => onPromotion(u)}>
                      Promote
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
