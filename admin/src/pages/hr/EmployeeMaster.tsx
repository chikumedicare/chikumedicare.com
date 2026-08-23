import React, { useState } from 'react';
import { Head } from '../../components/Head';
import type { Employee } from '../../domain/hr/employee.types';

export function EmployeeMaster({
  employees,
  onAdd,
  onEdit,
}: {
  employees: Employee[];
  users?: any[];
  onAdd: () => void;
  onEdit: (e: Employee) => void;
}) {
  const [q, setQ] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const list = employees.filter(
    (e) =>
      (deptFilter === 'ALL' || e.department === deptFilter) &&
      `${e.firstName} ${e.middleName || ''} ${e.lastName} ${e.empCode} ${e.mobile} ${e.email || ''}`
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  return (
    <>
      <Head
        title="Employee Master (Person Master)"
        sub={`${list.length} registered employee profiles (Personal KYC, Family, Identity & Bank Records)`}
        action={
          <button className="primary" onClick={onAdd}>
            + Add New Employee
          </button>
        }
      />
      <div className="toolbar">
        <input
          placeholder="Search by name, CHIKU code, mobile or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>Emp Code</th>
              <th>Employee Name & Contact</th>
              <th>Gender / Blood</th>
              <th>Qualification</th>
              <th>City / Emergency Contact</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td><code style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>{e.empCode}</code></td>
                <td>
                  <b style={{ color: '#0f172a' }}>
                    {e.firstName} {e.middleName || ''} {e.lastName}
                  </b>
                  <br />
                  <small style={{ color: '#64748b' }}>📱 {e.mobile} {e.email ? ` • ✉️ ${e.email}` : ''}</small>
                </td>
                <td><small>{e.gender || 'MALE'} • {e.bloodGroup || 'O+'}</small></td>
                <td><small>{e.qualification || '-'}</small></td>
                <td>
                  <small style={{ color: '#334155' }}>
                    {e.emergencyContactName ? `${e.emergencyContactName} (${e.emergencyContactRelation || 'Emergency'})` : (e.currentAddress ? e.currentAddress.split(',').pop()?.trim() : '-')}
                  </small>
                </td>
                <td>
                  <button className="link" onClick={() => onEdit(e)}>
                    View / Edit Profile
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No employee records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
