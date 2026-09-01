import React, { useState, useEffect } from 'react';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useHrStore } from '../../../store/hr/useHrStore';
import { GeographyMappingFilters } from './GeographyMappingFilters';
import { GeographyMappingTable } from './GeographyMappingTable';
import { CoverageModal } from './CoverageModal';

interface GeographyMappingProps {
  users?: SfaUser[];
  onManageCoverage?: (user: SfaUser) => void;
}

export function GeographyMapping({ users: propUsers, onManageCoverage }: GeographyMappingProps) {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [coverageFilter, setCoverageFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<SfaUser | null>(null);

  const {
    getHqName,
    getStateName,
    hqs,
    areas,
    states,
    beats,
    updateUserCoverage,
    refresh: refreshGeo,
  } = useGeographyStore();

  const { divisions, refresh: refreshHo } = useHeadOfficeStore();
  const { users: storeUsers, employees, refresh: refreshHr } = useHrStore();

  const users = propUsers || storeUsers;

  // Auto-refresh all master stores on mount to ensure fresh live data
  useEffect(() => {
    refreshGeo(true);
    refreshHr(true);
    refreshHo(true);
  }, [refreshGeo, refreshHr, refreshHo]);

  // Filter out system admins and owners
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

  const filteredList = fieldUsers.filter((u) => {
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
      u.role === 'MR' || u.role === 'SR_MR'
        ? u.areaIds && u.areaIds.length > 0
        : u.coveringHqIds && u.coveringHqIds.length > 0;

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

  // Calculate Metrics for Inline Header Badges
  const mappedCount = fieldUsers.filter((u) =>
    u.role === 'MR' || u.role === 'SR_MR'
      ? u.areaIds && u.areaIds.length > 0
      : u.coveringHqIds && u.coveringHqIds.length > 0
  ).length;

  const unmappedCount = fieldUsers.length - mappedCount;

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Compact Header: Title + Inline KPI Pills in One Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🗺️</span>
            <span>Field Geography & Territory Mapping</span>
          </h2>
        </div>

        {/* Slim Inline KPI Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ padding: '3px 8px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            👥 {fieldUsers.length} Field Staff
          </span>
          <span style={{ padding: '3px 8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
            🟢 {mappedCount} Mapped
          </span>
          {unmappedCount > 0 && (
            <span style={{ padding: '3px 8px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '11.5px', fontWeight: 700 }}>
              ⚠️ {unmappedCount} Pending
            </span>
          )}
        </div>
      </div>

      {/* Single-Row Compact Filter Toolbar */}
      <GeographyMappingFilters
        q={q}
        setQ={setQ}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        divisionFilter={divisionFilter}
        setDivisionFilter={setDivisionFilter}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        coverageFilter={coverageFilter}
        setCoverageFilter={setCoverageFilter}
        divisions={divisions}
        states={states}
        onReset={handleClearFilters}
        isFiltersActive={isFiltersActive}
        totalFiltered={filteredList.length}
        totalStaff={fieldUsers.length}
      />

      {/* Data-Dense High-Efficiency Table */}
      <GeographyMappingTable
        users={filteredList}
        hqs={hqs}
        areas={areas}
        states={states}
        divisions={divisions}
        employees={employees}
        getHqName={getHqName}
        getStateName={getStateName}
        onManageCoverage={(u) => {
          setSelectedUser(u);
          onManageCoverage?.(u);
        }}
      />

      {/* Interactive Coverage Modal */}
      {selectedUser && (
        <CoverageModal
          user={selectedUser}
          hqs={hqs}
          areas={areas}
          beats={beats}
          states={states}
          onSave={async (userId, cov) => {
            const res = await updateUserCoverage(userId, cov);
            if (res.success) {
              await Promise.all([refreshGeo(true), refreshHr(true)]);
              setSelectedUser(null);
            }
            return res;
          }}
          back={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
