import React from 'react';
import { Head } from '../components/Head';
import { users, hqs } from '../data';

export function Hierarchy() {
  return (
    <>
      <Head
        title="Role & Hierarchy"
        sub="Chain Builder • reporting manager, role and territory assignment."
        action={<button className="primary">＋ Assign Chain</button>}
      />
      <div className="cards">
        {users
          .filter((u) => u.role !== 'ADMIN')
          .map((u) => {
            const m = users.find((x) => x.id === u.reportsToId);
            return (
              <div className="panel hcard" key={u.id}>
                <div className="avatar">
                  {u.fullName
                    .split(' ')
                    .map((x) => x[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <b>{u.fullName}</b>
                  <small>
                    {u.role} • {u.designation}
                  </small>
                  <small>Reports to: {m?.fullName || 'Not assigned'}</small>
                  <small>
                    HQ: {hqs.find((h) => h.id === u.hqId)?.name || 'Not assigned'}
                  </small>
                </div>
                <button className="link">Edit</button>
              </div>
            );
          })}
      </div>
    </>
  );
}
