PRAGMA foreign_keys = OFF;

-- 1. Master Entities Cleanup
DELETE FROM employees;
DELETE FROM doctors;
DELETE FROM chemists;
DELETE FROM stockists;
DELETE FROM products;
DELETE FROM holidays;
DELETE FROM hqs WHERE id != 'hq_super_ho';
DELETE FROM areas;
DELETE FROM beats;
DELETE FROM zones;
DELETE FROM states;

-- 2. Operational & Field Transactional Data Cleanup
DELETE FROM dcr_entries;
DELETE FROM sales_entries;
DELETE FROM sales_targets;
DELETE FROM tour_plans;
DELETE FROM expenses;
DELETE FROM payroll;
DELETE FROM loans;
DELETE FROM approvals;
DELETE FROM audit_logs;
DELETE FROM location_checkpoints;
DELETE FROM back_date_permissions;
DELETE FROM leave_applications;
DELETE FROM leave_allocations;
DELETE FROM sponsorships;
DELETE FROM da_rates;
DELETE FROM sfc_rates;
DELETE FROM notification_logs;
DELETE FROM user_devices;
DELETE FROM password_history;
DELETE FROM login_history;
DELETE FROM user_history;
DELETE FROM role_change_history;
DELETE FROM user_covering_hq;
DELETE FROM user_covering_area;

-- 3. Clear Users except ADMIN & OWNER
DELETE FROM users WHERE role NOT IN ('ADMIN', 'OWNER') AND user_id NOT IN ('admin', 'owner');

-- 4. Reset ID Sequences
DELETE FROM entity_sequences;
DELETE FROM system_sequences;

-- 5. Ensure Super HQ in HQS Table
INSERT OR IGNORE INTO hqs (id, hq_name, hq_code, division_id, is_active, created_at)
VALUES ('hq_super_ho', 'Corporate Head Office (Super HQ)', 'HQ000', 'DIV01', 1, CURRENT_TIMESTAMP);

-- 6. Ensure Primary Head Office Record
INSERT OR IGNORE INTO head_office (id, company_name, brand_name, city, state_name, active_financial_year, working_days_per_month, is_active)
VALUES ('ho_001', 'CHIKU MEDICARE PRIVATE LIMITED', 'CHIKU MEDICARE', 'Bhopal', 'Madhya Pradesh', '2026-27', 26, 1);

PRAGMA foreign_keys = ON;
