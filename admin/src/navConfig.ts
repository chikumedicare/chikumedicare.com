import type { Page } from './types';

export interface NavItem {
  id: Page;
  label: string;
  icon: string;
}

export interface NavCategory {
  key: string;
  label: string;
  icon: string;
  items: NavItem[];
}

export const navCategories: NavCategory[] = [
  {
    key: 'hr',
    label: 'HR & Personnel',
    icon: '👥',
    items: [
      { id: 'head-office', label: 'Head Office & Corporate HQ', icon: '🏢' },
      { id: 'employees', label: 'Employee Master', icon: '👤' },
      { id: 'users', label: 'User Management', icon: '🔐' },
      { id: 'hierarchy', label: 'Role & Hierarchy', icon: '🌳' },
      { id: 'transfer', label: 'Transfer', icon: '🔄' },
      { id: 'promotion', label: 'Promotion / Demotion', icon: '📈' },
      { id: 'geography', label: 'Field Geography Master', icon: '🗺️' },
      { id: 'mapping', label: 'Geography Mapping', icon: '📍' },
      { id: 'device-management', label: 'Device & Session Management', icon: '📱' },
      { id: 'leave', label: 'Leave Allocation', icon: '📅' },
      { id: 'da-rates', label: 'DA Rates Master', icon: '💰' },
      { id: 'sfc-master', label: 'SFC Master (Standard Fare Chart)', icon: '🛣️' },
    ],
  },
  {
    key: 'master',
    label: 'Master Data',
    icon: '📂',
    items: [
      { id: 'doctors', label: 'Doctor Master', icon: '👨‍⚕️' },
      { id: 'chemists', label: 'Chemist Master', icon: '💊' },
      { id: 'stockists', label: 'Stockist Master', icon: '📦' },
      { id: 'products', label: 'Product Master', icon: '🧪' },
    ],
  },
  {
    key: 'transaction',
    label: 'Transactions',
    icon: '📝',
    items: [
      { id: 'dcr-entry', label: 'DCR Call Entry', icon: '📋' },
      { id: 'tour-plan-entry', label: 'Tour Plan (TP)', icon: '🗓️' },
      { id: 'primary-sales', label: 'Primary Sales', icon: '📊' },
      { id: 'secondary-sales', label: 'Secondary Sales', icon: '📈' },
      { id: 'expense-entry', label: 'Expense Claim', icon: '💵' },
      { id: 'sampling', label: 'Sample / Gift Entry', icon: '🎁' },
    ],
  },
  {
    key: 'personal',
    label: 'Personal Info',
    icon: '👤',
    items: [
      { id: 'my-profile', label: 'My Profile', icon: '👤' },
      { id: 'my-attendance', label: 'My Attendance', icon: '⏱️' },
      { id: 'my-leaves', label: 'My Leave Requests', icon: '🌴' },
      { id: 'salary-slip', label: 'Salary Slip / Payslip', icon: '📄' },
      { id: 'my-documents', label: 'KYC & Documents', icon: '📁' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: '📊',
    items: [
      { id: 'dcr-reports', label: 'DCR Summary Report', icon: '📈' },
      { id: 'doctor-coverage-report', label: 'Doctor Coverage', icon: '🎯' },
      { id: 'sales-reports', label: 'Sales vs Target', icon: '📊' },
      { id: 'expense-reports', label: 'Expense Statements', icon: '📑' },
      { id: 'stock-reports', label: 'Stock & Secondary', icon: '📦' },
      { id: 'tp-reports', label: 'Tour Plan vs Actual', icon: '🗺️' },
    ],
  },
  {
    key: 'approvals',
    label: 'Approvals Engine',
    icon: '✅',
    items: [
      { id: 'dcr-approvals', label: 'DCR Approvals', icon: '📋' },
      { id: 'tp-approvals', label: 'TP Approvals', icon: '🗓️' },
      { id: 'expense-approvals', label: 'Expense Approvals', icon: '💵' },
      { id: 'leave-approvals', label: 'Leave Approvals', icon: '🌴' },
      { id: 'master-approvals', label: 'Master Edit Requests', icon: '⚙️' },
    ],
  },
  {
    key: 'utilities',
    label: 'System Utilities',
    icon: '⚙️',
    items: [
      { id: 'audit-logs', label: 'Audit Trail Logs', icon: '📜' },
      { id: 'financial-year', label: 'Financial Year Setup', icon: '🗓️' },
      { id: 'global-settings', label: 'Global Settings', icon: '⚙️' },
      { id: 'data-backup', label: 'Database Backup', icon: '💾' },
      { id: 'bulk-import-export', label: 'Bulk Import / Export', icon: '📥' },
    ],
  },
];
