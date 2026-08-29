import React, { useState } from 'react';
import { Head } from '../../components/Head';
import type { Employee } from '../../core/domain/hr/employee.types';
import type { SfaUser } from '../../core/domain/hr/user.types';

export function EmployeeMaster({
  employees,
  onAdd,
  onEdit,
}: {
  employees: Employee[];
  users?: SfaUser[];
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
          <button className="primary" onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>➕</span>
            <span>Add New Employee</span>
          </button>
        }
      />
      <div className="toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <input
          placeholder="🔍 Search by name, CHIKU code, mobile or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1, padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        />
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
        >
          <option value="ALL">🏢 All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="panel table" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', fontSize: '12px', color: '#475569' }}>
              <th style={{ padding: '12px 16px' }}>Emp Code</th>
              <th style={{ padding: '12px 16px' }}>Employee Name & Contact</th>
              <th style={{ padding: '12px 16px' }}>Gender / Blood</th>
              <th style={{ padding: '12px 16px' }}>Qualification</th>
              <th style={{ padding: '12px 16px' }}>City / Emergency Contact</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px' }}>
                  <code style={{ fontSize: '12px', color: '#0284c7', fontWeight: 700, background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                    {e.empCode}
                  </code>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <b style={{ color: '#0f172a', fontSize: '13px' }}>
                    {e.firstName} {e.middleName || ''} {e.lastName}
                  </b>
                  <br />
                  <small style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span>📞 {e.mobile}</span>
                    {e.email && <span>✉️ {e.email}</span>}
                  </small>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                  <span>{e.gender || 'MALE'}</span> • <span style={{ fontWeight: 600, color: '#dc2626' }}>{e.bloodGroup || 'O+'}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                  {e.qualification || '-'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#334155' }}>
                  {e.emergencyContactName ? (
                    <span>🚨 {e.emergencyContactName} ({e.emergencyContactRelation || 'Emergency'})</span>
                  ) : (
                    <span>📍 {e.currentAddress ? e.currentAddress.split(',').pop()?.trim() : '-'}</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    className="link"
                    onClick={() => onEdit(e)}
                    style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ✏️ View / Edit Profile
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '13px' }}>
                  No employee records found matching your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
