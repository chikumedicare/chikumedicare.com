import type { Page } from './types';

export interface NavSubItem {
  id: Page;
  label: string;
  icon: string;
}

export interface NavItem {
  id?: Page;
  key?: string;
  label: string;
  icon: string;
  subItems?: NavSubItem[];
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
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'employees', label: 'Employee & User Master', icon: '👥' },
      { id: 'hierarchy', label: 'Role & Hierarchy', icon: '🌳' },
      { id: 'division-manage', label: 'Division Manage', icon: '💼' },
      { id: 'transfer', label: 'Transfer', icon: '🔄' },
      { id: 'promotion', label: 'Promotion / Demotion', icon: '📈' },
      { id: 'geography', label: 'Field Geography Master', icon: '🗺️' },
      { id: 'mapping', label: 'Geography Mapping', icon: '🔗' },
      { id: 'device-management', label: 'Device & Session Management', icon: '📱' },
      { id: 'leave', label: 'Leave Allocation', icon: '🏖️' },
      { id: 'da-rates', label: 'DA Rates Master', icon: '💵' },
      { id: 'sfc-master', label: 'SFC Master (Standard Fare Chart)', icon: '🚌' },
    ],
  },
  {
    key: 'master',
    label: 'Master Data',
    icon: '📦',
    items: [
      {
        key: 'doctor-master',
        label: 'Doctor Master',
        icon: '🩺',
        subItems: [
          { id: 'doctors', label: 'Doctor List & Add', icon: '📋' },
          { id: 'doctor-edit', label: 'Edit Doctor', icon: '✏️' },
          { id: 'doctor-delete', label: 'Delete Doctor', icon: '🗑️' },
        ],
      },
      {
        key: 'chemist-master',
        label: 'Chemist Master',
        icon: '💊',
        subItems: [
          { id: 'chemists', label: 'Chemist List & Add', icon: '📋' },
          { id: 'chemist-edit', label: 'Edit Chemist', icon: '✏️' },
          { id: 'chemist-delete', label: 'Delete Chemist', icon: '🗑️' },
        ],
      },
      {
        key: 'stockist-master',
        label: 'Stockist Master',
        icon: '🏢',
        subItems: [
          { id: 'stockists', label: 'Stockist List & Add', icon: '📋' },
          { id: 'stockist-edit', label: 'Edit Stockist', icon: '✏️' },
          { id: 'stockist-delete', label: 'Delete Stockist', icon: '🗑️' },
        ],
      },
      {
        key: 'product-master',
        label: 'Product Master',
        icon: '🧪',
        subItems: [
          { id: 'products', label: 'Product List & Add', icon: '📋' },
          { id: 'product-edit', label: 'Edit Product', icon: '✏️' },
          { id: 'product-delete', label: 'Delete Product', icon: '🗑️' },
        ],
      },
      {
        key: 'holiday-master',
        label: 'Holiday Master',
        icon: '🌴',
        subItems: [
          { id: 'holidays', label: 'Holiday List & Add', icon: '📋' },
          { id: 'holiday-edit', label: 'Edit Holiday', icon: '✏️' },
          { id: 'holiday-delete', label: 'Delete Holiday', icon: '🗑️' },
        ],
      },
    ],
  },
  {
    key: 'transaction',
    label: 'Transactions',
    icon: '📊',
    items: [
      { id: 'tour-plan-entry', label: 'Tour Plan (TP)', icon: '📝' },
      { id: 'primary-sales', label: 'Primary Sales', icon: '🛒' },
      { id: 'secondary-sales', label: 'Secondary Sales', icon: '🛍️' },
      { id: 'dr-sales-entry', label: 'Doctor Sales Entry', icon: '💊' },
      { id: 'sponsorship-entry', label: 'Sponsorship Addition', icon: '🤝' },
      { id: 'leave-application-entry', label: 'Leave Application', icon: '📄' },
    ],
  },
  {
    key: 'personal',
    label: 'Personal Info',
    icon: '👤',
    items: [
      { id: 'my-profile', label: 'My Profile', icon: '👨‍💼' },
      { id: 'salary-slip', label: 'Salary Slip / Payslip', icon: '🧾' },
      { id: 'my-documents', label: 'KYC & Documents', icon: '📁' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    icon: '📈',
    items: [
      { id: 'dcr-report', label: 'DCR Report', icon: '📄' },
      { id: 'dr-visit-report', label: 'Dr Visit Reports', icon: '🩺' },
      { id: 'chemist-visit-report', label: 'Chemist Visit Reports', icon: '💊' },
      { id: 'employee-work-report', label: 'Employee Work Reports', icon: '👥' },
      { id: 'missed-call-report', label: 'Missed Call Reports', icon: '📞' },
      { id: 'dr-sales-report', label: 'Dr Sales Report', icon: '💰' },
      { id: 'primary-sales-report', label: 'Primary Sales Report', icon: '📊' },
      { id: 'secondary-sales-report', label: 'Secondary Sales Report', icon: '📈' },
      { id: 'stockist-sales-report', label: 'Stockist Sales Report', icon: '🏬' },
      { id: 'employee-route-map', label: 'Employee Route Map', icon: '🗺️' },
    ],
  },
  {
    key: 'approvals',
    label: 'Approvals Engine',
    icon: '✅',
    items: [
      { id: 'tp-approvals', label: 'TP Approvals', icon: '📝' },
      { id: 'leave-approvals', label: 'Leave Approvals', icon: '🏖️' },
      { id: 'dr-add-approval', label: 'Doctor Add Approval', icon: '🩺' },
      { id: 'dr-edit-approval', label: 'Doctor Edit Approval', icon: '✏️' },
      { id: 'dr-delete-approval', label: 'Doctor Delete Approval', icon: '🗑️' },
      { id: 'sponsorship-approval', label: 'Sponsorship Approval', icon: '🤝' },
    ],
  },
  {
    key: 'settings-menu',
    label: 'System Settings',
    icon: '⚙️',
    items: [
      { id: 'global-settings', label: 'Global System Settings', icon: '⚙️' },
      { id: 'head-office', label: 'Company Profile', icon: '🏢' },
      { id: 'financial-year', label: 'Financial Year Controls', icon: '📅' },
      { id: 'audit-logs', label: 'Audit Logs & Traces', icon: '📋' },
      { id: 'data-backup', label: 'Database Backup & Restore', icon: '💾' },
    ],
  },
];
