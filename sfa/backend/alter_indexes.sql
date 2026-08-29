-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_reports_to ON users(reports_to_id);
CREATE INDEX IF NOT EXISTS idx_users_hq_id ON users(hq_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_asm_id ON users(asm_id);
CREATE INDEX IF NOT EXISTS idx_users_rsm_id ON users(rsm_id);

-- Approvals table indexes
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approvals(type);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON approvals(requested_by);

-- DCR entries
CREATE INDEX IF NOT EXISTS idx_dcr_user_date ON dcr_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_dcr_date ON dcr_entries(date);

-- Sales entries
CREATE INDEX IF NOT EXISTS idx_sales_emp_month ON sales_entries(employee_id, month_year);
CREATE INDEX IF NOT EXISTS idx_sales_type ON sales_entries(type);

-- Customers (Geographic lookups)
CREATE INDEX IF NOT EXISTS idx_doctors_hq_area ON doctors(hq_id, area_id);
CREATE INDEX IF NOT EXISTS idx_chemists_hq_area ON chemists(hq_id, area_id);
CREATE INDEX IF NOT EXISTS idx_stockists_hq_area ON stockists(hq_id, area_id);

-- Master Data
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Geography
CREATE INDEX IF NOT EXISTS idx_areas_hq_id ON areas(hq_id);
CREATE INDEX IF NOT EXISTS idx_hqs_state_id ON hqs(state_id);
CREATE INDEX IF NOT EXISTS idx_states_zone_id ON states(zone_id);

-- Extra User Lookups
CREATE INDEX IF NOT EXISTS idx_users_emp_code ON users(emp_code);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

