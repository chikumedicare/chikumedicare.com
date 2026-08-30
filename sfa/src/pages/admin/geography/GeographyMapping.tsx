import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useHrStore } from '../../../store/hr/useHrStore';
import { GeographyMappingStats } from './GeographyMappingStats';
import { GeographyMappingFilters } from './GeographyMappingFilters';
import { GeographyMappingTable } from './GeographyMappingTable';
import { CoverageModal } from './CoverageModal';

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

  const { divisions } = useHeadOfficeStore();
  const { employees, refresh: refreshHr } = useHrStore();

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

  // Calculate Metrics for Stats Bar
  const mappedCount = fieldUsers.filter((u) =>
    u.role === 'MR' || u.role === 'SR_MR'
      ? u.areaIds && u.areaIds.length > 0
      : u.coveringHqIds && u.coveringHqIds.length > 0
  ).length;

  const unmappedCount = fieldUsers.length - mappedCount;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Head
        title="Field Geography & Territory Mapping"
        sub="Configure Primary Base HQ, Multi-HQ Branch Supervision, and Customer Beat Areas for all field representatives."
      />

      {/* KPI Stats Bar */}
      <GeographyMappingStats
        totalStaff={fieldUsers.length}
        mappedCount={mappedCount}
        unmappedCount={unmappedCount}
        totalHqsCount={hqs.length}
      />

      {/* Search & Filter Toolbar */}
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

      {/* High-Definition Table */}
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
