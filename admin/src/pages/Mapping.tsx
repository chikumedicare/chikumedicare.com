import React from 'react';
import { Head } from '../components/Head';
import { users, hqs, areas } from '../data';

export function Mapping() {
  return (
    <>
      <Head
        title="Geography Mapping"
        sub="Manage primary HQ, covering HQs and Area coverage."
      />
      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Primary HQ</th>
              <th>Covering HQs</th>
              <th>Areas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) => u.role !== 'ADMIN')
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.fullName}</b>
                    <small>{u.empCode}</small>
                  </td>
                  <td>{u.role}</td>
                  <td>{hqs.find((h) => h.id === u.hqId)?.name || '—'}</td>
                  <td>
                    {u.coveringHqIds
                      .map((id) => hqs.find((h) => h.id === id)?.name)
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </td>
                  <td>
                    {u.areaIds
                      .map((id) => areas.find((a) => a.id === id)?.name)
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </td>
                  <td>
                    <button className="link">Manage</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
