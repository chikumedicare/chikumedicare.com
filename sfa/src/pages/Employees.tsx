import React, { useState } from 'react';
import { Head } from '../components/Head';
import { Badge } from '../components/Badge';
import { employees, hqs } from '../data';
import type { Employee } from '../types';

export function Employees({
  onAdd,
  onEdit,
}: {
  onAdd: () => void;
  onEdit: (e: Employee) => void;
}) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');

  const list = employees.filter(
    (e) =>
      (status === 'ALL' || e.status === status) &&
      `${e.firstName} ${e.middleName || ''} ${e.lastName} ${e.empCode} ${e.mobile}`
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  return (
    <>
      <Head
        title="Employee Master"
        sub={`${list.length} employee records`}
        action={
          <button className="primary" onClick={onAdd}>
            ＋ Add Employee
          </button>
        }
      />
      <div className="toolbar">
        <input
          placeholder="Search by name, code, mobile..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>ALL</option>
          <option>ACTIVE</option>
          <option>RESIGNED</option>
          <option>SUSPENDED</option>
          <option>TERMINATED</option>
        </select>
      </div>
      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Code</th>
              <th>Designation</th>
              <th>Department</th>
              <th>HQ</th>
              <th>Joining</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td>
                  <b>
                    {e.firstName} {e.middleName || ''} {e.lastName}
                  </b>
                  <small>{e.mobile}</small>
                </td>
                <td>{e.empCode}</td>
                <td>{e.designation}</td>
                <td>{e.department}</td>
                <td>{hqs.find((h) => h.id === e.hqId)?.name || '—'}</td>
                <td>{e.joiningDate}</td>
                <td>
                  <Badge v={e.status} />
                </td>
                <td>
                  <button className="link" onClick={() => onEdit(e)}>
                    View / Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
