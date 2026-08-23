import { DoctorMaster } from './master/DoctorMaster';
import { ChemistMaster } from './master/ChemistMaster';
import { StockistMaster } from './master/StockistMaster';
import { ProductMaster } from './master/ProductMaster';
import { HolidayMaster } from './master/HolidayMaster';
﻿import React, { useState } from 'react';
import type { Page } from '../types';
import type { Employee } from '../domain/hr/employee.types';
import type { SfaUser } from '../domain/hr/user.types';
import { Dashboard } from './Dashboard';
import { HeadOfficeMaster } from './hr/headOffice/HeadOfficeMaster';
import { EmployeeMaster } from './hr/EmployeeMaster';
import { EmployeeFormModal } from './hr/EmployeeFormModal';
import { UserManagement } from './hr/UserManagement';
import { UserFormModal } from './hr/UserFormModal';
import { DeviceManagement } from './hr/DeviceManagement';
import { RoleHierarchy } from './hr/RoleHierarchy';
import { TransferWorkflow } from './hr/TransferWorkflow';
import { PromotionWorkflow } from './hr/PromotionWorkflow';
import { GeographyMaster } from './hr/GeographyMaster';
import { GeographyFormModal } from './hr/GeographyFormModal';
import { GeographyMapping } from './hr/GeographyMapping';
import { CoverageModal } from './hr/CoverageModal';
import { LeaveAllocation } from './hr/LeaveAllocation';
import { DaRates } from './hr/DaRates';
import { SfcMaster } from './hr/SfcMaster';
import { GenericModulePage } from './GenericModulePage';
import { useHrStore } from '../store/hr/useHrStore';
import { useGeographyStore, type TerritoryType } from '../store/hr/useGeographyStore';

interface PageContentRouterProps {
  page: Page;
  open: (p: Page) => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (e: Employee | null) => void;
  selectedUser: SfaUser | null;
  setSelectedUser: (u: SfaUser | null) => void;
}

export function PageContentRouter({
  page,
  open,
  selectedEmployee,
  setSelectedEmployee,
  selectedUser,
  setSelectedUser,
}: PageContentRouterProps) {
  const {
    employees,
    users,
    leaves,
    daRates,
    addOrUpdateEmployee,
    createSfaUser,
    addOrUpdateSfaUser,
    toggleUserActive,
    executeTransfer,
    executePromotion,
    updateUserHierarchy,
    executeResetDevice,
    getUserLoginAudit,
    fetchTransferHistory,
    fetchPromotionHistory,
    addOrUpdateLeaveAllocation,
    deleteLeaveAllocation,
    bulkAllocateLeaves,
    fetchLeaveApplications,
    updateLeaveApplicationStatus,
    addOrUpdateRoleDaRates,
    deleteRoleDaRates,
    bulkAdjustDaRates,
    refresh: refreshHr,
  } = useHrStore();

  const {
    zones,
    states,
    hqs,
    areas,
    beats,
    addOrUpdateTerritory,
    updateUserCoverage,
  } = useGeographyStore();

  // Local navigation state for Geography modals
  const [selectedTerritoryType, setSelectedTerritoryType] = useState<TerritoryType>('Zone');
  const [selectedTerritoryItem, setSelectedTerritoryItem] = useState<any | null>(null);

  // 1. Dashboard
  if (page === 'dashboard') return <Dashboard go={open} />;

  // 2. Head Office & Corporate Master
  if (page === 'head-office') return <HeadOfficeMaster />;

  // 3. HR & Management Suite
  if (page === 'employees') {
    return (
      <EmployeeMaster
        employees={employees}
        users={users}
        onAdd={() => {
          setSelectedEmployee(null);
          open('employee-form');
        }}
        onEdit={(e) => {
          setSelectedEmployee(e);
          open('employee-form');
        }}
      />
    );
  }
  if (page === 'employee-form') {
    return (
      <EmployeeFormModal
        employee={selectedEmployee}
        onSave={addOrUpdateEmployee}
        back={() => open('employees')}
      />
    );
  }
  if (page === 'users') {
    return (
      <UserManagement
        users={users}
        onAdd={() => {
          setSelectedUser(null);
          open('user-form');
        }}
        onEdit={(u) => {
          setSelectedUser(u);
          open('user-form');
        }}
        onTransfer={(u) => {
          setSelectedUser(u);
          open('transfer');
        }}
        onPromotion={(u) => {
          setSelectedUser(u);
          open('promotion');
        }}
        onResetDevice={executeResetDevice}
        onToggleActive={toggleUserActive}
      />
    );
  }
  if (page === 'user-form') {
    return (
      <UserFormModal
        user={selectedUser}
        users={users}
        employees={employees}
        onSave={addOrUpdateSfaUser}
        back={() => open('users')}
      />
    );
  }
  if (page === 'device-management') {
    return (
      <DeviceManagement
        users={users}
        onResetDevice={executeResetDevice}
        onFetchAudit={getUserLoginAudit}
      />
    );
  }
  if (page === 'hierarchy') {
    return <RoleHierarchy users={users} onUpdateHierarchy={updateUserHierarchy} />;
  }
  if (page === 'transfer') {
    return (
      <TransferWorkflow
        users={users}
        preselectedUser={selectedUser}
        onComplete={() => open('users')}
        back={() => open('users')}
      />
    );
  }
  if (page === 'promotion') {
    return (
      <PromotionWorkflow
        users={users}
        preselectedUser={selectedUser}
        onComplete={() => open('users')}
        back={() => open('users')}
      />
    );
  }

    // 3.5 Field Entity Masters
  if (page === 'doctors') return <DoctorMaster hqs={hqs} areas={areas} />;
  if (page === 'chemists') return <ChemistMaster hqs={hqs} areas={areas} />;
  if (page === 'stockists') return <StockistMaster hqs={hqs} areas={areas} />;
  if (page === 'products') return <ProductMaster />;
  if (page === 'holidays') return <HolidayMaster />;

  // 4. Geography Master & Mapping
  if (page === 'geography') {
    return (
      <GeographyMaster
        onAddTerritory={(type) => {
          setSelectedTerritoryType(type);
          setSelectedTerritoryItem(null);
          open('geography-form');
        }}
        onEditTerritory={(type, item) => {
          setSelectedTerritoryType(type);
          setSelectedTerritoryItem(item);
          open('geography-form');
        }}
      />
    );
  }
  if (page === 'geography-form') {
    return (
      <GeographyFormModal
        type={selectedTerritoryType}
        item={selectedTerritoryItem}
        zones={zones}
        states={states}
        hqs={hqs}
        areas={areas}
        onSave={(draft) => addOrUpdateTerritory(selectedTerritoryType, draft)}
        back={() => open('geography')}
      />
    );
  }
  if (page === 'mapping') {
    return (
      <GeographyMapping
        users={users}
        onManageCoverage={(u) => {
          setSelectedUser(u);
          open('coverage-form');
        }}
      />
    );
  }
  if (page === 'coverage-form') {
    return (
      <CoverageModal
        user={selectedUser}
        hqs={hqs}
        areas={areas}
        beats={beats}
        states={states}
        onSave={async (userId, cov) => {
          const res = await updateUserCoverage(userId, cov);
          if (res.success) {
            await refreshHr();
          }
          return res;
        }}
        back={() => open('mapping')}
      />
    );
  }

  if (page === 'leave') {
    return (
      <LeaveAllocation
        leaves={leaves}
        employees={employees}
        users={users}
        onSaveAllocation={addOrUpdateLeaveAllocation}
        onDeleteAllocation={deleteLeaveAllocation}
        onBulkAllocate={bulkAllocateLeaves}
        onFetchApplications={fetchLeaveApplications}
        onUpdateAppStatus={updateLeaveApplicationStatus}
      />
    );
  }
  if (page === 'da-rates') {
    return (
      <DaRates
        daRates={daRates}
        onSaveRoleRates={addOrUpdateRoleDaRates}
        onDeleteRoleRates={deleteRoleDaRates}
        onBulkAdjust={bulkAdjustDaRates}
      />
    );
  }
  if (page === 'sfc-master') {
    return (
      <SfcMaster
        hqs={hqs}
        areas={areas}
      />
    );
  }

  // 5. Generic Fallback
  return (
    <GenericModulePage
      title={page.replace(/-/g, ' ').toUpperCase()}
      category="Module View"
      description="Operational management & data view"
      columns={[
        { key: 'title', header: 'Item Name' },
        { key: 'status', header: 'Status' },
      ]}
      items={[
        { id: '1', title: `${page} item record 1`, status: 'ACTIVE' },
        { id: '2', title: `${page} item record 2`, status: 'ACTIVE' },
      ]}
    />
  );
}
