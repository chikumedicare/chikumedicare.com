import React from 'react';
import type { Page } from '../types';
import type { Employee } from '../core/domain/hr/employee.types';
import type { SfaUser } from '../core/domain/hr/user.types';
import { useHrStore } from '../store/hr/useHrStore';

// 👑 Portal 1: Admin / Owner Governance Components
import { Dashboard } from './admin/dashboard/Dashboard';
import { EmployeeUserMaster } from './admin/employee_user/EmployeeUserMaster';
import { DeviceManagement } from './admin/device/DeviceManagement';
import { RoleHierarchy } from './admin/hierarchy/RoleHierarchy';
import { DivisionManage } from './admin/division/DivisionManage';
import { TransferWorkflow } from './admin/transfer/TransferWorkflow';
import { PromotionWorkflow } from './admin/promotion/PromotionWorkflow';
import { GeographyMaster } from './admin/geography/GeographyMaster';
import { GeographyMapping } from './admin/geography/GeographyMapping';
import { LeaveAllocation } from './admin/leave-allocation/LeaveAllocation';
import { DaRates } from './admin/da-rates/DaRates';
import { SfcMaster } from './admin/sfc/SfcMaster';
import { HeadOfficeMaster } from './admin/head-office/HeadOfficeMaster';
import { SystemSettings } from './admin/settings/SystemSettings';

// 🚀 Portal 2: Users / Field Operations Components
// Masters
import { DoctorMaster } from './users/master/doctor/DoctorMaster';
import { ChemistMaster } from './users/master/chemist/ChemistMaster';
import { StockistMaster } from './users/master/stockist/StockistMaster';
import { ProductMaster } from './users/master/product/ProductMaster';
import { HolidayMaster } from './users/master/holiday/HolidayMaster';

// Transactions
import { TourPlanEntry } from './users/transaction/tour-plan/TourPlanEntry';
import { PrimarySalesEntry } from './users/transaction/primary-sales/PrimarySalesEntry';
import { SecondarySalesEntry } from './users/transaction/secondary-sales/SecondarySalesEntry';
import { DoctorSalesEntry } from './users/transaction/doctor-sales/DoctorSalesEntry';
import { SponsorshipEntry } from './users/transaction/sponsorship/SponsorshipEntry';
import { LeaveApplicationEntry } from './users/transaction/leave-application/LeaveApplicationEntry';

// Approvals & Personal & Reports
import { ApprovalsEngineContainer } from './users/approvals/ApprovalsEngineContainer';
import { AdminProfile } from './users/personal/profile/AdminProfile';
import { GenericModulePage } from './users/reports/GenericModulePage';

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
  const pageStr = page as string;

  // 📝 Transactions Routing
  if (pageStr === 'tp-entry' || pageStr === 'tour-plan-entry') return <TourPlanEntry />;
  if (pageStr === 'primary-sales') return <PrimarySalesEntry />;
  if (pageStr === 'secondary-sales') return <SecondarySalesEntry />;
  if (pageStr === 'dr-sales-entry') return <DoctorSalesEntry />;
  if (pageStr === 'sponsorship-entry') return <SponsorshipEntry />;
  if (pageStr === 'leave-application-entry' || pageStr === 'leave-application') return <LeaveApplicationEntry />;

  // ✅ Approvals Engine Routing
  if (pageStr === 'tp-approvals' || pageStr === 'tour-plan-approvals') return <ApprovalsEngineContainer category="TOUR_PLAN" categoryTitle="Tour Plan Approvals" />;
  if (pageStr === 'leave-approvals') return <ApprovalsEngineContainer category="LEAVE" categoryTitle="Leave Approvals" />;
  if (pageStr === 'dr-add-approval') return <ApprovalsEngineContainer category="DR_ADD" categoryTitle="Doctor Addition Approvals" />;
  if (pageStr === 'dr-edit-approval') return <ApprovalsEngineContainer category="DR_EDIT" categoryTitle="Doctor Edit Approvals" />;
  if (pageStr === 'dr-delete-approval') return <ApprovalsEngineContainer category="DR_DELETE" categoryTitle="Doctor Delete Approvals" />;
  if (pageStr === 'sponsorship-approval') return <ApprovalsEngineContainer category="SPONSORSHIP" categoryTitle="Sponsorship Approvals" />;

  // 📦 Masters Routing
  if (pageStr === 'doctors' || pageStr === 'doctor-edit' || pageStr === 'doctor-delete') return <DoctorMaster />;
  if (pageStr === 'chemists' || pageStr === 'chemist-edit' || pageStr === 'chemist-delete') return <ChemistMaster />;
  if (pageStr === 'stockists' || pageStr === 'stockist-edit' || pageStr === 'stockist-delete') return <StockistMaster />;
  if (pageStr === 'products' || pageStr === 'product-edit' || pageStr === 'product-delete') return <ProductMaster />;
  if (pageStr === 'holidays' || pageStr === 'holiday-edit' || pageStr === 'holiday-delete') return <HolidayMaster />;

  // 👑 Admin & Owner Governance Routing
  if (pageStr === 'dashboard') return <Dashboard go={open} />;
  if (pageStr === 'head-office') return <HeadOfficeMaster />;
  if (pageStr === 'employees' || pageStr === 'users' || pageStr === 'hr' || pageStr === 'hr-hub') return <EmployeeUserMaster />;
  if (pageStr === 'division-manage') return <DivisionManage />;
  if (pageStr === 'device-management') return <DeviceManagement users={hrStore.users} onResetDevice={async () => ({ success: true })} onFetchAudit={async () => []} />;
  if (pageStr === 'hierarchy') return <RoleHierarchy />;
  if (pageStr === 'transfer') return <TransferWorkflow users={hrStore.users} onComplete={() => {}} back={() => open('dashboard')} />;
  if (pageStr === 'promotion') return <PromotionWorkflow users={hrStore.users} onComplete={() => {}} back={() => open('dashboard')} />;
  if (pageStr === 'geography') return <GeographyMaster />;
  if (pageStr === 'mapping') return <GeographyMapping />;
  if (pageStr === 'leave' || pageStr === 'leave-allocation') return <LeaveAllocation />;
  if (pageStr === 'da-rates') return <DaRates daRates={hrStore.daRates} />;
  if (pageStr === 'sfc-master') return <SfcMaster />;
  if (pageStr === 'global-settings' || pageStr === 'financial-year' || pageStr === 'audit-logs' || pageStr === 'data-backup') return <SystemSettings />;

  // 👤 Personal Self-Service
  if (pageStr === 'my-profile') return <AdminProfile go={open} />;

  // 📊 Reports & Fallback
  return <GenericModulePage page={page} />;
}
