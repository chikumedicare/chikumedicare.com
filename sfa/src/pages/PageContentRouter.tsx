import { ApprovalsEngineContainer } from './approvals/ApprovalsEngineContainer';
import { LeaveApplicationEntry } from './transaction/LeaveApplicationEntry';
import React from 'react';
import type { Page } from '../types';
import type { Employee } from '../core/domain/hr/employee.types';
import type { SfaUser } from '../core/domain/hr/user.types';
import { Dashboard } from './Dashboard';
import { HeadOfficeMaster } from './hr/headOffice/HeadOfficeMaster';
import { EmployeeMaster } from './hr/EmployeeMaster';
import { UserManagement } from './hr/UserManagement';
import { DeviceManagement } from './hr/DeviceManagement';
import { RoleHierarchy } from './hr/RoleHierarchy';
import { TransferWorkflow } from './hr/TransferWorkflow';
import { PromotionWorkflow } from './hr/PromotionWorkflow';
import { GeographyMaster } from './hr/GeographyMaster';
import { GeographyMapping } from './hr/GeographyMapping';
import { LeaveAllocation } from './hr/LeaveAllocation';
import { DaRates } from './hr/DaRates';
import { SfcMaster } from './hr/SfcMaster';
import { GenericModulePage } from './GenericModulePage';
import { useHrStore } from '../store/hr/useHrStore';

// Masters
import { DoctorMaster } from './master/DoctorMaster';
import { ChemistMaster } from './master/ChemistMaster';
import { StockistMaster } from './master/StockistMaster';
import { ProductMaster } from './master/ProductMaster';
import { HolidayMaster } from './master/HolidayMaster';

// Transactions
import { TourPlanEntry } from './transaction/TourPlanEntry';
import { PrimarySalesEntry } from './transaction/PrimarySalesEntry';
import { SecondarySalesEntry } from './transaction/SecondarySalesEntry';
import { DoctorSalesEntry } from './transaction/DoctorSalesEntry';
import { SponsorshipEntry } from './transaction/SponsorshipEntry';

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
}: PageContentRouterProps) {
  const hrStore = useHrStore();

  // Transactions Routing
  const pageStr = page as string;
  if (pageStr === 'tp-entry') return <TourPlanEntry />;
  if (pageStr === 'primary-sales') return <PrimarySalesEntry />;
  if (pageStr === 'secondary-sales') return <SecondarySalesEntry />;
  if (pageStr === 'dr-sales-entry') return <DoctorSalesEntry />;
  if (pageStr === 'sponsorship-entry') return <SponsorshipEntry />;
  if (pageStr === 'leave-application-entry' || pageStr === 'leave-application') return <LeaveApplicationEntry />;

  // Approvals Engine Routing
  if (pageStr === 'tp-approvals' || pageStr === 'tour-plan-approvals') return <ApprovalsEngineContainer category="TOUR_PLAN" categoryTitle="Tour Plan Approvals" />;
  if (pageStr === 'leave-approvals') return <ApprovalsEngineContainer category="LEAVE" categoryTitle="Leave Approvals" />;
  if (pageStr === 'dr-add-approval') return <ApprovalsEngineContainer category="DR_ADD" categoryTitle="Doctor Addition Approvals" />;
  if (pageStr === 'dr-edit-approval') return <ApprovalsEngineContainer category="DR_EDIT" categoryTitle="Doctor Edit Approvals" />;
  if (pageStr === 'dr-delete-approval') return <ApprovalsEngineContainer category="DR_DELETE" categoryTitle="Doctor Delete Approvals" />;
  if (pageStr === 'sponsorship-approval') return <ApprovalsEngineContainer category="SPONSORSHIP" categoryTitle="Sponsorship Approvals" />;

  // Masters Routing
  if (pageStr === 'doctors') return <DoctorMaster />;
  if (pageStr === 'chemists') return <ChemistMaster />;
  if (pageStr === 'stockists') return <StockistMaster />;
  if (pageStr === 'products') return <ProductMaster />;
  if (pageStr === 'holidays') return <HolidayMaster />;

  if (pageStr === 'dashboard') return <Dashboard go={open} />;
  if (pageStr === 'head-office') return <HeadOfficeMaster />;
  if (pageStr === 'employees' || pageStr === 'hr' || pageStr === 'hr-hub') return <EmployeeMaster employees={hrStore.employees} users={hrStore.users} onAdd={() => {}} onEdit={() => {}} />;
  if (pageStr === 'users') return <UserManagement users={hrStore.users} onAdd={() => {}} onEdit={() => {}} onToggleActive={() => {}} />;
  if (pageStr === 'device-management') return <DeviceManagement users={hrStore.users} onResetDevice={async () => ({ success: true })} onFetchAudit={async () => []} />;
  if (pageStr === 'hierarchy') return <RoleHierarchy users={hrStore.users} onUpdateHierarchy={async () => ({ success: true })} />;
  if (pageStr === 'transfer') return <TransferWorkflow users={hrStore.users} onComplete={() => {}} back={() => open('dashboard')} />;
  if (pageStr === 'promotion') return <PromotionWorkflow users={hrStore.users} onComplete={() => {}} back={() => open('dashboard')} />;
  if (pageStr === 'geography') return <GeographyMaster />;
  if (pageStr === 'mapping') return <GeographyMapping users={hrStore.users} />;
  if (pageStr === 'leave-allocation') return <LeaveAllocation users={hrStore.users} onBulkAllocate={async () => ({ success: true, count: 0 })} />;
  if (pageStr === 'da-rates') return <DaRates daRates={hrStore.daRates} />;
  if (pageStr === 'sfc-master') return <SfcMaster />;

  return <GenericModulePage page={page} />;
}
