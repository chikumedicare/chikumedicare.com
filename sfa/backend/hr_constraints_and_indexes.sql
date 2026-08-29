-- =========================================================================================
-- HR RELATIONS CONSTRAINTS, INTEGRITY RULES & PERFORMANCE INDEXES
-- SQLite / Cloudflare D1 Compatible DDL
-- =========================================================================================

-- 1. EMPLOYEES INDEXES & INTEGRITY
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_emp_code ON employees(emp_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_mobile ON employees(mobile);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employee_status, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);
CREATE INDEX IF NOT EXISTS idx_employees_aadhar ON employees(aadhar_number) WHERE aadhar_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_pan ON employees(pan_number) WHERE pan_number IS NOT NULL;

-- 2. USERS INDEXES & INTEGRITY
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_emp_code ON users(emp_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status_active ON users(is_active, status);
CREATE INDEX IF NOT EXISTS idx_users_hq ON users(hq_id);
CREATE INDEX IF NOT EXISTS idx_users_division ON users(division_id);
CREATE INDEX IF NOT EXISTS idx_users_reports_to ON users(reports_to_id);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_hierarchy_status ON users(hierarchy_status);

-- 3. LEAVE ALLOCATIONS (Unique Quota Per Employee Per FY)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leave_alloc_emp_year ON leave_allocations(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_alloc_status ON leave_allocations(is_active);

-- 4. LEAVE APPLICATIONS (Workflow & Audit Performance)
CREATE INDEX IF NOT EXISTS idx_leave_app_emp ON leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_app_status ON leave_applications(status, is_active);
CREATE INDEX IF NOT EXISTS idx_leave_app_dates ON leave_applications(from_date, to_date);
CREATE INDEX IF NOT EXISTS idx_leave_app_fy ON leave_applications(fy);
CREATE INDEX IF NOT EXISTS idx_leave_app_hq ON leave_applications(hq_id);

-- 5. TOUR PLANS (Unique Plan Per Employee Per Month)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tour_plans_emp_month ON tour_plans(employee_id, month_year);
CREATE INDEX IF NOT EXISTS idx_tour_plans_status ON tour_plans(status, is_active);
CREATE INDEX IF NOT EXISTS idx_tour_plans_fy ON tour_plans(fy);

-- 6. PAYROLL (Unique Payroll Record Per Employee Per Month)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_emp_month ON payroll(employee_id, month_year);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll(is_paid, is_active);

-- 7. LOANS & ADVANCES
CREATE INDEX IF NOT EXISTS idx_loans_emp ON loans(employee_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(is_active);

-- 8. DA & SFC RATES
CREATE INDEX IF NOT EXISTS idx_da_rates_role ON da_rates(role);
CREATE INDEX IF NOT EXISTS idx_sfc_rates_hq ON sfc_rates(from_hq_id, to_hq_id);

-- 9. APPROVALS ENGINE
CREATE INDEX IF NOT EXISTS idx_approvals_manager_status ON approvals(manager_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_status ON approvals(requested_by, status);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approvals(type);
CREATE INDEX IF NOT EXISTS idx_approvals_created ON approvals(created_at);

-- 10. AUDIT & LIFECYCLE HISTORY
CREATE INDEX IF NOT EXISTS idx_uh_user_date ON user_history(user_id, changed_at);
CREATE INDEX IF NOT EXISTS idx_rch_user_date ON role_change_history(user_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_al_user_module_time ON audit_logs(user_id, module, timestamp);
CREATE INDEX IF NOT EXISTS idx_al_entity ON audit_logs(entity_type, entity_id);
