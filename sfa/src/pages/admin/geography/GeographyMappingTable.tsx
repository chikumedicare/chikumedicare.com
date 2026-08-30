import React from 'react';
import { Badge } from '../../../components/Badge';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import type { Headquarter, Area, State } from '../../../core/domain/hr/geography.types';
import type { Division } from '../../../core/domain/hr/headOffice.types';
import type { Employee } from '../../../core/domain/hr/employee.types';

interface GeographyMappingTableProps {
  users: SfaUser[];
  hqs: Headquarter[];
  areas: Area[];
  states: State[];
  divisions: Division[];
  employees: Employee[];
  getHqName: (id?: string) => string;
  getStateName: (id?: string) => string;
  onManageCoverage: (user: SfaUser) => void;
}

export function GeographyMappingTable({
  users,
  hqs,
  areas,
  states,
  divisions,
  employees,
  getHqName,
  getStateName,
  onManageCoverage,
}: GeographyMappingTableProps) {
  const getUserDivisionId = (u: SfaUser): string => {
    if (u.divisionId) return u.divisionId;
    const userHq = hqs.find((h) => h.id === u.hqId);
    if (userHq?.divisionId) return userHq.divisionId;
    const userEmp = employees.find((e) => e.empCode && e.empCode === u.empCode);
    if (userEmp?.divisionId) return userEmp.divisionId;
    return '';
  };

  const getDivisionName = (divId?: string) => {
    if (!divId) return '-';
    return divisions.find((d) => d.id === divId)?.name || divId;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Representative & Code</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Role & Division</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Base Headquarter</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Covering HQs (Managers)</th>
              <th style={{ padding: '8px 12px', fontWeight: 700 }}>Assigned Beat Areas (MR)</th>
              <th style={{ padding: '8px 12px', fontWeight: 700, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const currentHq = hqs.find((h) => h.id === u.hqId);
              const stateName = currentHq?.stateId ? getStateName(currentHq.stateId) : '';
              const userDivId = getUserDivisionId(u);

              const coveringHqNames = (u.coveringHqIds || [])
                .map((id) => hqs.find((h) => h.id === id)?.name)
                .filter(Boolean);

              const assignedAreaNames = (u.areaIds || [])
                .map((id) => areas.find((a) => a.id === id)?.name)
                .filter(Boolean);

              const isMr = u.role === 'MR' || u.role === 'SR_MR';
              const isMapped = isMr ? assignedAreaNames.length > 0 : coveringHqNames.length > 0;

              return (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '12px',
                          flexShrink: 0,
                        }}
                      >
                        {u.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <b style={{ color: '#0f172a' }}>{u.fullName}</b>
                        <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>
                          <code>{u.userId}</code> {u.empCode ? `• ${u.empCode}` : ''}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '8px 12px' }}>
                    <Badge v={u.role} />
                    {userDivId && (
                      <small style={{ color: '#0284c7', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                        {getDivisionName(userDivId)}
                      </small>
                    )}
                  </td>

                  <td style={{ padding: '8px 12px' }}>
                    {u.hqId ? (
                      <div>
                        <b style={{ color: '#0f172a' }}>📍 {getHqName(u.hqId)}</b>
                        {stateName && <small style={{ color: '#64748b', display: 'block' }}>{stateName}</small>}
                      </div>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '11.5px', fontWeight: 600 }}>⚠️ No Base HQ</span>
                    )}
                  </td>

                  <td style={{ padding: '8px 12px' }}>
                    {isMr ? (
                      <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>N/A (MR Base)</span>
                    ) : coveringHqNames.length > 0 ? (
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {coveringHqNames.slice(0, 2).join(', ')}
                        </span>
                        {coveringHqNames.length > 2 && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: '#0284c7',
                              background: '#e0f2fe',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              marginLeft: '4px',
                              fontWeight: 700,
                            }}
                          >
                            +{coveringHqNames.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '11.5px', fontWeight: 600 }}>
                        ⚠️ None mapped
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '8px 12px' }}>
                    {!isMr ? (
                      <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>N/A (Supervisory)</span>
                    ) : assignedAreaNames.length > 0 ? (
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {assignedAreaNames.slice(0, 2).join(', ')}
                        </span>
                        {assignedAreaNames.length > 2 && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: '#16a34a',
                              background: '#dcfce7',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              marginLeft: '4px',
                              fontWeight: 700,
                            }}
                          >
                            +{assignedAreaNames.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '11.5px', fontWeight: 600 }}>
                        ⚠️ No areas
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => onManageCoverage(u)}
                      style={{
                        padding: '4px 10px',
                        background: isMapped
                          ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                          : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>⚡</span>
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No representatives found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
