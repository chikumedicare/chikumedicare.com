import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import { Badge } from '../../../components/Badge';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useHrStore } from '../../../store/hr/useHrStore';

interface GeographyMappingProps {
  users: SfaUser[];
  onManageCoverage?: (user: SfaUser) => void;
}

export function GeographyMapping({ users, onManageCoverage }: GeographyMappingProps) {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [coverageFilter, setCoverageFilter] = useState('ALL');

  const { getHqName, getStateName, hqs, areas, states } = useGeographyStore();
  const { divisions } = useHeadOfficeStore();
  const { employees } = useHrStore();

  const fieldUsers = users.filter((u) => u.role !== 'ADMIN' && u.role !== 'OWNER');

  // Smart User Division Resolver
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

  const isFiltersActive =
    q.trim() !== '' ||
    roleFilter !== 'ALL' ||
    divisionFilter !== 'ALL' ||
    stateFilter !== 'ALL' ||
    coverageFilter !== 'ALL';

  const handleClearFilters = () => {
    setQ('');
    setRoleFilter('ALL');
    setDivisionFilter('ALL');
    setStateFilter('ALL');
    setCoverageFilter('ALL');
  };

  const list = fieldUsers.filter((u) => {
    // 1. Role Filter
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

    // 2. Division Filter
    if (divisionFilter !== 'ALL') {
      const userDivId = getUserDivisionId(u);
      if (userDivId !== divisionFilter) return false;
    }

    // 3. State Filter
    const userHq = hqs.find((h) => h.id === u.hqId);
    if (stateFilter !== 'ALL') {
      if (!userHq || userHq.stateId !== stateFilter) return false;
    }

    // 4. Coverage Filter
    const hasCoverage =
      u.role === 'MR'
        ? (u.areaIds && u.areaIds.length > 0)
        : (u.coveringHqIds && u.coveringHqIds.length > 0);

    if (coverageFilter === 'MAPPED' && !hasCoverage) return false;
    if (coverageFilter === 'UNMAPPED' && hasCoverage) return false;

    // 5. Search Text Filter
    if (q.trim()) {
      const hqName = getHqName(u.hqId);
      const stateName = userHq?.stateId ? getStateName(userHq.stateId) : '';
      const divName = getDivisionName(getUserDivisionId(u));
      const coveringNames = (u.coveringHqIds || [])
        .map((id) => hqs.find((h) => h.id === id)?.name || '')
        .join(' ');
      const areaNames = (u.areaIds || [])
        .map((id) => areas.find((a) => a.id === id)?.name || '')
        .join(' ');

      const searchHaystack = [
        u.fullName,
        u.empCode || '',
        u.userId,
        u.role,
        hqName,
        stateName,
        divName,
        coveringNames,
        areaNames,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchHaystack.includes(q.toLowerCase().trim())) return false;
    }

    return true;
  });

  return (
    <>
      <Head
        title="Field Geography & Territory Mapping"
        sub="Assigned Base HQ, Multi-HQ Coverage, and Beat Area assignments for field staff."
      />

      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Search by representative, emp code, role, HQ, state or area..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: '200px' }}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Roles</option>
          <option value="MR">MR (Medical Rep)</option>
          <option value="SR_MR">Sr. MR (Senior Medical Rep)</option>
          <option value="ASM">ASM (Area Sales Manager)</option>
          <option value="SR_ASM">Sr. ASM (Senior Area Sales Manager)</option>
          <option value="RSM">RSM (Regional Manager)</option>
          <option value="ZSM">ZSM (Zonal Manager)</option>
          <option value="NSM">NSM (National Manager)</option>
          <option value="VP">VP (Vice President)</option>
        </select>
        <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Marketing Divisions</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
          ))}
        </select>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All States</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select value={coverageFilter} onChange={(e) => setCoverageFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Coverage Status</option>
          <option value="MAPPED">🟢 Mapped (With Coverage)</option>
          <option value="UNMAPPED">⚠️ Unmapped / Pending</option>
        </select>
        {isFiltersActive && (
          <button
            type="button"
            className="secondary"
            onClick={handleClearFilters}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px', fontSize: '13px', color: '#64748b' }}>
        <span>Showing <b>{list.length}</b> of <b>{fieldUsers.length}</b> field representatives</span>
      </div>

      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>Representative & User ID</th>
              <th>Role & Division</th>
              <th>Primary Base HQ</th>
              <th>Covering HQs (Managers)</th>
              <th>Assigned Areas (MR)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => {
              const currentHq = hqs.find((h) => h.id === u.hqId);
              const stateName = currentHq?.stateId ? getStateName(currentHq.stateId) : '';
              const userDivId = getUserDivisionId(u);

              const coveringHqNames = (u.coveringHqIds || [])
                .map((id) => hqs.find((h) => h.id === id)?.name)
                .filter(Boolean);

              const assignedAreaNames = (u.areaIds || [])
                .map((id) => areas.find((a) => a.id === id)?.name)
                .filter(Boolean);

              return (
                <tr key={u.id}>
                  <td>
                    <b>{u.fullName}</b>
                    <small style={{ color: '#64748b', display: 'block' }}>
                      <code>{u.userId}</code> {u.empCode ? `• Emp: ${u.empCode}` : ''}
                    </small>
                  </td>
                  <td>
                    <Badge v={u.role} />
                    {userDivId && (
                      <small style={{ color: '#0284c7', display: 'block', marginTop: '3px', fontWeight: 500 }}>
                        {getDivisionName(userDivId)}
                      </small>
                    )}
                  </td>
                  <td>
                    <b>{getHqName(u.hqId)}</b>
                    {stateName && (
                      <small style={{ color: '#64748b', display: 'block' }}>
                        State: {stateName}
                      </small>
                    )}
                  </td>
                  <td>
                    {u.role === 'MR' ? (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>N/A (MR Base Territory)</span>
                    ) : coveringHqNames.length > 0 ? (
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {coveringHqNames.slice(0, 2).join(', ')}
                        </span>
                        {coveringHqNames.length > 2 && (
                          <span style={{ fontSize: '11px', color: '#0284c7', background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px', fontWeight: 600 }}>
                            +{coveringHqNames.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>⚠️ None mapped</span>
                    )}
                  </td>
                  <td>
                    {u.role !== 'MR' ? (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>N/A (HQ-Level Supervision)</span>
                    ) : assignedAreaNames.length > 0 ? (
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {assignedAreaNames.slice(0, 2).join(', ')}
                        </span>
                        {assignedAreaNames.length > 2 && (
                          <span style={{ fontSize: '11px', color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px', fontWeight: 600 }}>
                            +{assignedAreaNames.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>⚠️ No areas assigned</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="link"
                      onClick={() => onManageCoverage?.(u)}
                      style={{ fontWeight: 600 }}
                    >
                      Manage Coverage
                    </button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No field representatives found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
