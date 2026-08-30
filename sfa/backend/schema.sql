-- ChikuSFA Production D1 Schema (SQLite Optimized)
-- Complete HR and Operations Relational Schema with Constraints, Foreign Keys & Indexes

-- 1. GEOGRAPHY & STRUCTURE
CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    division_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    head_office_id TEXT REFERENCES head_office(id),
    head_user_id TEXT REFERENCES users(id),
    head_user_name TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_divisions_code ON divisions(division_code);
CREATE INDEX IF NOT EXISTS idx_divisions_status ON divisions(is_active);

CREATE TABLE IF NOT EXISTS zones (
    id TEXT PRIMARY KEY,
    zone_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    head_user_id TEXT,
    head_user_name TEXT,
    division_id TEXT NOT NULL REFERENCES divisions(id),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_zones_code ON zones(zone_code);
CREATE INDEX IF NOT EXISTS idx_zones_division ON zones(division_id);
CREATE INDEX IF NOT EXISTS idx_zones_status ON zones(is_active);

CREATE TABLE IF NOT EXISTS states (
    id TEXT PRIMARY KEY,
    state_code TEXT NOT NULL UNIQUE,
    state_name TEXT NOT NULL,
    description TEXT,
    zone_id TEXT REFERENCES zones(id),
    display_order INTEGER DEFAULT 0,
    division_id TEXT NOT NULL REFERENCES divisions(id),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_states_code ON states(state_code);
CREATE INDEX IF NOT EXISTS idx_states_zone ON states(zone_id);
CREATE INDEX IF NOT EXISTS idx_states_division ON states(division_id);
CREATE INDEX IF NOT EXISTS idx_states_status ON states(is_active);

CREATE TABLE IF NOT EXISTS hqs (
    id TEXT PRIMARY KEY,
    hq_name TEXT NOT NULL,
    hq_code TEXT NOT NULL UNIQUE,
    state_id TEXT REFERENCES states(id),
    zone_id TEXT REFERENCES zones(id),
    hq_type TEXT,
    city TEXT,
    district TEXT,
    pin_code TEXT,
    latitude REAL,
    longitude REAL,
    state_code TEXT,
    is_pool_hq INTEGER DEFAULT 0 CHECK(is_pool_hq IN (0, 1)),
    parent_pool_hq_id TEXT REFERENCES hqs(id),
    display_order INTEGER DEFAULT 0,
    division_id TEXT NOT NULL REFERENCES divisions(id),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hqs_code ON hqs(hq_code);
CREATE INDEX IF NOT EXISTS idx_hqs_zone ON hqs(zone_id);
CREATE INDEX IF NOT EXISTS idx_hqs_state ON hqs(state_id);
CREATE INDEX IF NOT EXISTS idx_hqs_division ON hqs(division_id);
CREATE INDEX IF NOT EXISTS idx_hqs_status ON hqs(is_active);

CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    area_name TEXT NOT NULL,
    area_code TEXT NOT NULL UNIQUE,
    territory_type TEXT CHECK(territory_type IN ('LOCAL', 'EX_HQ', 'OUTSTATION')),
    zone_id TEXT REFERENCES zones(id),
    state_id TEXT REFERENCES states(id),
    hq_id TEXT REFERENCES hqs(id),
    default_travel_mode TEXT,
    both_side_allowed INTEGER DEFAULT 1 CHECK(both_side_allowed IN (0, 1)),
    travel_mode TEXT DEFAULT 'TWO_SIDE',
    display_order INTEGER DEFAULT 0,
    division_id TEXT NOT NULL REFERENCES divisions(id),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_areas_code ON areas(area_code);
CREATE INDEX IF NOT EXISTS idx_areas_hq ON areas(hq_id);
CREATE INDEX IF NOT EXISTS idx_areas_territory ON areas(territory_type);
CREATE INDEX IF NOT EXISTS idx_areas_status ON areas(is_active);

CREATE TABLE IF NOT EXISTS beats (
    id TEXT PRIMARY KEY,
    zone_id TEXT REFERENCES zones(id),
    state_id TEXT REFERENCES states(id),
    hq_id TEXT REFERENCES hqs(id),
    area_id TEXT REFERENCES areas(id),
    beat_code TEXT NOT NULL UNIQUE,
    beat_name TEXT NOT NULL,
    beat_type TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    division_id TEXT NOT NULL REFERENCES divisions(id),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_beats_code ON beats(beat_code);
CREATE INDEX IF NOT EXISTS idx_beats_area ON beats(area_id);
CREATE INDEX IF NOT EXISTS idx_beats_hq ON beats(hq_id);
CREATE INDEX IF NOT EXISTS idx_beats_status ON beats(is_active);

-- 2. USERS & USER LIFECYCLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'OWNER', 'VP', 'NSM', 'ZSM', 'RSM', 'ASM', 'SR_ASM', 'MR')),
    hq_id TEXT REFERENCES hqs(id),
    covering_hq_ids TEXT DEFAULT '[]',
    reports_to_ids TEXT DEFAULT '[]',
    reports_to_id TEXT REFERENCES users(id),
    reports_to_name TEXT,
    area_ids TEXT DEFAULT '[]',
    emp_code TEXT,
    division_id TEXT REFERENCES divisions(id),
    joining_date TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT,
    primary_zone_id TEXT REFERENCES zones(id),
    primary_state_id TEXT REFERENCES states(id),
    primary_area_id TEXT REFERENCES areas(id),
    remarks TEXT,
    manager_id TEXT REFERENCES users(id),
    asm_id TEXT REFERENCES users(id),
    rsm_id TEXT REFERENCES users(id),
    zsm_id TEXT REFERENCES users(id),
    vp_id TEXT REFERENCES users(id),
    admin_id TEXT REFERENCES users(id),
    hierarchy_status TEXT DEFAULT 'ACTIVE' CHECK(hierarchy_status IN ('ACTIVE', 'VACANT', 'UNASSIGNED', 'BLOCKED')),
    status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED')),
    device_id TEXT,
    device_name TEXT,
    device_model TEXT,
    os_version TEXT,
    app_version TEXT,
    last_login DATETIME,
    registered_on DATETIME,
    failed_login_attempts INTEGER DEFAULT 0 CHECK(failed_login_attempts >= 0),
    locked_until DATETIME
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_emp_code ON users(emp_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status_active ON users(is_active, status);
CREATE INDEX IF NOT EXISTS idx_users_hq ON users(hq_id);
CREATE INDEX IF NOT EXISTS idx_users_division ON users(division_id);
CREATE INDEX IF NOT EXISTS idx_users_reports_to ON users(reports_to_id);
CREATE INDEX IF NOT EXISTS idx_users_manager ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_hierarchy_status ON users(hierarchy_status);

CREATE TABLE IF NOT EXISTS user_covering_hq (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    hq_id TEXT NOT NULL REFERENCES hqs(id),
    display_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1 CHECK(status IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    UNIQUE(user_id, hq_id)
);
CREATE INDEX IF NOT EXISTS idx_uch_user ON user_covering_hq(user_id);
CREATE INDEX IF NOT EXISTS idx_uch_hq ON user_covering_hq(hq_id);

CREATE TABLE IF NOT EXISTS user_covering_area (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    area_id TEXT NOT NULL REFERENCES areas(id),
    display_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1 CHECK(status IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    UNIQUE(user_id, area_id)
);
CREATE INDEX IF NOT EXISTS idx_uca_user ON user_covering_area(user_id);
CREATE INDEX IF NOT EXISTS idx_uca_area ON user_covering_area(area_id);

CREATE TABLE IF NOT EXISTS password_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_ph_user ON password_history(user_id);

CREATE TABLE IF NOT EXISTS login_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    device_id TEXT,
    result TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_lh_user ON login_history(user_id);

CREATE TABLE IF NOT EXISTS user_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    old_data TEXT,
    new_data TEXT,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT
);
CREATE INDEX IF NOT EXISTS idx_uh_user_date ON user_history(user_id, changed_at);

CREATE TABLE IF NOT EXISTS role_change_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    previous_role TEXT,
    new_role TEXT NOT NULL,
    effective_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by TEXT,
    remarks TEXT
);
CREATE INDEX IF NOT EXISTS idx_rch_user_date ON role_change_history(user_id, effective_date);

CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_ur_user ON user_roles(user_id);

CREATE TABLE IF NOT EXISTS permission_cache (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
    permissions TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pc_user ON permission_cache(user_id);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    dr_code TEXT,
    name TEXT NOT NULL,
    qualification TEXT,
    speciality TEXT,
    category TEXT DEFAULT 'B',
    hq_id TEXT REFERENCES hqs(id),
    area_id TEXT REFERENCES areas(id),
    beat_id TEXT REFERENCES beats(id),
    mobile TEXT,
    email TEXT,
    clinic_address TEXT,
    dob TEXT,
    anniversary_date TEXT,
    visit_frequency INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_doctors_hq ON doctors(hq_id);
CREATE INDEX IF NOT EXISTS idx_doctors_area ON doctors(area_id);
CREATE INDEX IF NOT EXISTS idx_doctors_beat ON doctors(beat_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(is_active);

CREATE TABLE IF NOT EXISTS chemists (
    id TEXT PRIMARY KEY,
    chemist_code TEXT,
    shop_name TEXT NOT NULL,
    owner_name TEXT,
    contact_person TEXT,
    hq_id TEXT REFERENCES hqs(id),
    area_id TEXT REFERENCES areas(id),
    beat_id TEXT REFERENCES beats(id),
    mobile TEXT,
    email TEXT,
    address TEXT,
    gst_number TEXT,
    drug_license_number TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_chemists_hq ON chemists(hq_id);
CREATE INDEX IF NOT EXISTS idx_chemists_area ON chemists(area_id);
CREATE INDEX IF NOT EXISTS idx_chemists_status ON chemists(is_active);

CREATE TABLE IF NOT EXISTS stockists (
    id TEXT PRIMARY KEY,
    stockist_code TEXT,
    firm_name TEXT NOT NULL,
    owner_name TEXT,
    contact_person TEXT,
    hq_id TEXT REFERENCES hqs(id),
    area_id TEXT REFERENCES areas(id),
    beat_id TEXT REFERENCES beats(id),
    mobile TEXT,
    email TEXT,
    address TEXT,
    gst_number TEXT,
    drug_license_number TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_stockists_hq ON stockists(hq_id);
CREATE INDEX IF NOT EXISTS idx_stockists_status ON stockists(is_active);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    product_code TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    pack_size TEXT,
    mrp REAL NOT NULL CHECK(mrp >= 0),
    pts REAL CHECK(pts >= 0),
    ptr REAL CHECK(ptr >= 0),
    gst_percent REAL DEFAULT 0 CHECK(gst_percent >= 0),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(is_active);

-- 5. APPROVALS ENGINE
CREATE TABLE IF NOT EXISTS approvals (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    requested_by TEXT REFERENCES users(id),
    manager_id TEXT REFERENCES users(id),
    assigned_manager_ids TEXT DEFAULT '[]',
    requester_role TEXT,
    requester_hq_id TEXT,
    entity_data TEXT NOT NULL,
    old_data TEXT,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    manager_remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_approvals_manager_status ON approvals(manager_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_status ON approvals(requested_by, status);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approvals(type);
CREATE INDEX IF NOT EXISTS idx_approvals_created ON approvals(created_at);

-- 6. DCR (Daily Call Report)
CREATE TABLE IF NOT EXISTS dcr_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    date TEXT NOT NULL,
    work_type TEXT,
    work_with_mode TEXT DEFAULT 'ALONE',
    area_type TEXT,
    is_submitted INTEGER DEFAULT 0 CHECK(is_submitted IN (0, 1)),
    ta_amount REAL DEFAULT 0,
    da_amount REAL DEFAULT 0,
    misc_amount REAL DEFAULT 0,
    misc_note TEXT,
    dr_calls TEXT DEFAULT '[]',
    chemist_calls TEXT DEFAULT '[]',
    stockist_calls TEXT DEFAULT '[]',
    submitted_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    employee_id TEXT REFERENCES users(id),
    employee_name TEXT,
    employee_role TEXT,
    employee_hq_id TEXT,
    employee_hq_name TEXT,
    working_area_ids TEXT,
    beat_id TEXT REFERENCES beats(id),
    from_id TEXT,
    to_id TEXT,
    both_side_allowed INTEGER DEFAULT 0 CHECK(both_side_allowed IN (0, 1)),
    joint_with_ids TEXT,
    plan_at TEXT,
    day_remarks TEXT DEFAULT '',
    server_id TEXT,
    local_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_dcr_user_date ON dcr_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_dcr_employee ON dcr_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_dcr_status ON dcr_entries(is_submitted, is_active);

-- 7. HOLIDAYS
CREATE TABLE IF NOT EXISTS holidays (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    fy TEXT NOT NULL,
    type TEXT DEFAULT 'NATIONAL',
    description TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_holidays_fy_date ON holidays(fy, date);

-- 8. TARGETS
CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY,
    hq_id TEXT REFERENCES hqs(id),
    hq_name TEXT,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    sales_target REAL DEFAULT 0,
    call_target INTEGER DEFAULT 0,
    secondary_target REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_targets_hq_date ON targets(hq_id, year, month);

-- 9. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    month_year TEXT NOT NULL,
    total_amount REAL DEFAULT 0 CHECK(total_amount >= 0),
    status TEXT DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')),
    submitted_at TEXT,
    approved_at TEXT,
    approved_by TEXT REFERENCES users(id),
    manager_remarks TEXT,
    items TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_expenses_emp_month ON expenses(employee_id, month_year);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status, is_active);

-- 10. PAYROLL
CREATE TABLE IF NOT EXISTS payroll (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    month_year TEXT NOT NULL,
    basic_salary REAL DEFAULT 0 CHECK(basic_salary >= 0),
    allowances REAL DEFAULT 0 CHECK(allowances >= 0),
    deductions REAL DEFAULT 0 CHECK(deductions >= 0),
    net_pay REAL DEFAULT 0 CHECK(net_pay >= 0),
    is_paid INTEGER DEFAULT 0 CHECK(is_paid IN (0, 1)),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    UNIQUE(employee_id, month_year)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_emp_month ON payroll(employee_id, month_year);
CREATE INDEX IF NOT EXISTS idx_payroll_status ON payroll(is_paid, is_active);

-- 11. LEAVE ALLOCATIONS (Quotas)
CREATE TABLE IF NOT EXISTS leave_allocations (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    employee_name TEXT,
    designation TEXT,
    hq_name TEXT,
    balance_cl REAL DEFAULT 0 CHECK(balance_cl >= 0),
    balance_sl REAL DEFAULT 0 CHECK(balance_sl >= 0),
    balance_pl REAL DEFAULT 0 CHECK(balance_pl >= 0),
    year TEXT NOT NULL,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    UNIQUE(employee_id, year)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leave_alloc_emp_year ON leave_allocations(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_alloc_status ON leave_allocations(is_active);

-- 12. LEAVE APPLICATIONS
CREATE TABLE IF NOT EXISTS leave_applications (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    employee_name TEXT,
    leave_type TEXT NOT NULL CHECK(leave_type IN ('CL', 'SL', 'PL', 'LWP')),
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    num_days REAL NOT NULL CHECK(num_days > 0),
    reason TEXT,
    emergency_contact TEXT DEFAULT '',
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    approved_by TEXT REFERENCES users(id),
    approved_at DATETIME,
    fy TEXT,
    hq_id TEXT REFERENCES hqs(id),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_leave_app_emp ON leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_app_status ON leave_applications(status, is_active);
CREATE INDEX IF NOT EXISTS idx_leave_app_dates ON leave_applications(from_date, to_date);
CREATE INDEX IF NOT EXISTS idx_leave_app_fy ON leave_applications(fy);
CREATE INDEX IF NOT EXISTS idx_leave_app_hq ON leave_applications(hq_id);

-- 13. LOANS
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    principal_amount REAL DEFAULT 0 CHECK(principal_amount >= 0),
    outstanding_amount REAL DEFAULT 0 CHECK(outstanding_amount >= 0),
    emi_amount REAL DEFAULT 0 CHECK(emi_amount >= 0),
    next_emi_date TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_loans_emp ON loans(employee_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(is_active);

-- 14. SALES ENTRIES
CREATE TABLE IF NOT EXISTS sales_entries (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    employee_id TEXT REFERENCES users(id),
    employee_name TEXT,
    target_id TEXT NOT NULL,
    target_name TEXT NOT NULL,
    month_year TEXT,
    total_amount REAL DEFAULT 0,
    items TEXT DEFAULT '[]',
    date TEXT NOT NULL,
    employee_hq_id TEXT,
    target_hq_id TEXT,
    target_hq_name TEXT,
    target_area_id TEXT,
    target_area_name TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_sales_entries_emp_date ON sales_entries(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_sales_entries_target ON sales_entries(target_id);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    module TEXT,
    type TEXT,
    status TEXT,
    records_affected INTEGER DEFAULT 0,
    message TEXT,
    user_id TEXT,
    user_name TEXT,
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_al_user_module_time ON audit_logs(user_id, module, timestamp);
CREATE INDEX IF NOT EXISTS idx_al_entity ON audit_logs(entity_type, entity_id);

-- 16. SALES TARGETS (Product-wise)
CREATE TABLE IF NOT EXISTS sales_targets (
    id TEXT PRIMARY KEY,
    hq_id TEXT REFERENCES hqs(id),
    hq_name TEXT,
    fy TEXT NOT NULL,
    product_id TEXT REFERENCES products(id),
    product_name TEXT,
    pts REAL DEFAULT 0,
    target_rate REAL DEFAULT 0,
    apr REAL DEFAULT 0,
    may REAL DEFAULT 0,
    jun REAL DEFAULT 0,
    jul REAL DEFAULT 0,
    aug REAL DEFAULT 0,
    sep REAL DEFAULT 0,
    oct REAL DEFAULT 0,
    nov REAL DEFAULT 0,
    dec REAL DEFAULT 0,
    jan REAL DEFAULT 0,
    feb REAL DEFAULT 0,
    mar REAL DEFAULT 0,
    total_units REAL DEFAULT 0,
    total_value REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_sales_targets_hq_fy ON sales_targets(hq_id, fy);
CREATE INDEX IF NOT EXISTS idx_sales_targets_product ON sales_targets(product_id);

-- 17. TOUR PLANS
CREATE TABLE IF NOT EXISTS tour_plans (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES users(id),
    fy TEXT NOT NULL,
    month_year TEXT NOT NULL,
    details TEXT DEFAULT '[]',
    status TEXT DEFAULT 'APPROVED' CHECK(status IN ('DRAFT', 'SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED')),
    approved_by TEXT REFERENCES users(id),
    approved_at TEXT,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    UNIQUE(employee_id, month_year)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tour_plans_emp_month ON tour_plans(employee_id, month_year);
CREATE INDEX IF NOT EXISTS idx_tour_plans_status ON tour_plans(status, is_active);
CREATE INDEX IF NOT EXISTS idx_tour_plans_fy ON tour_plans(fy);

-- 18. EMPLOYEES MASTER
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    emp_code TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT CHECK(gender IN ('MALE','FEMALE','OTHER')),
    blood_group TEXT,
    marital_status TEXT CHECK(marital_status IN ('SINGLE','MARRIED','DIVORCED','WIDOWED')),
    mobile TEXT UNIQUE NOT NULL,
    alternate_mobile TEXT,
    email TEXT,
    emergency_contact_name TEXT,
    emergency_contact_no TEXT,
    emergency_contact_relation TEXT,
    current_address TEXT,
    permanent_address TEXT,
    father_name TEXT,
    father_occupation TEXT,
    mother_name TEXT,
    spouse_name TEXT,
    number_of_children INTEGER DEFAULT 0,
    highest_qualification TEXT,
    specialization TEXT,
    institute_name TEXT,
    passing_year TEXT,
    aadhar_number TEXT,
    pan_number TEXT,
    passport_number TEXT,
    passport_expiry TEXT,
    driving_license_number TEXT,
    driving_license_expiry TEXT,
    identity_docs TEXT DEFAULT '[]',
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    account_type TEXT CHECK(account_type IN ('SAVINGS','CURRENT')),
    employee_status TEXT DEFAULT 'ACTIVE' CHECK(employee_status IN ('ACTIVE','INACTIVE','PROBATION','RESIGNED','SUSPENDED','TERMINATED')),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    created_by TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    updated_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_emp_code ON employees(emp_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_mobile ON employees(mobile);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employee_status, is_active);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);

-- 19. DA & SFC RATES
CREATE TABLE IF NOT EXISTS da_rates (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    hq_rate REAL DEFAULT 0 CHECK(hq_rate >= 0),
    ex_hq_rate REAL DEFAULT 0 CHECK(ex_hq_rate >= 0),
    outstation_rate REAL DEFAULT 0 CHECK(outstation_rate >= 0),
    city_category TEXT DEFAULT 'METRO',
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_da_rates_role ON da_rates(role);

CREATE TABLE IF NOT EXISTS sfc_rates (
    id TEXT PRIMARY KEY,
    from_hq_id TEXT NOT NULL REFERENCES hqs(id),
    to_hq_id TEXT NOT NULL REFERENCES hqs(id),
    travel_mode TEXT NOT NULL,
    distance_km REAL DEFAULT 0 CHECK(distance_km >= 0),
    rate_per_km REAL DEFAULT 0 CHECK(rate_per_km >= 0),
    total_fare REAL DEFAULT 0 CHECK(total_fare >= 0),
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    UNIQUE(from_hq_id, to_hq_id, travel_mode)
);
CREATE INDEX IF NOT EXISTS idx_sfc_rates_hqs ON sfc_rates(from_hq_id, to_hq_id);

-- 20. SYSTEM SEQUENCES & PERMISSIONS
CREATE TABLE IF NOT EXISTS system_sequences (
    name TEXT PRIMARY KEY,
    current_value INTEGER NOT NULL DEFAULT 0 CHECK(current_value >= 0),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS location_checkpoints (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    battery_level REAL,
    activity_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_loc_checkpoints_user_date ON location_checkpoints(user_id, date);

CREATE TABLE IF NOT EXISTS back_date_permissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    allowed_by TEXT REFERENCES users(id),
    allowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_back_date_user_date ON back_date_permissions(user_id, date);

CREATE TABLE IF NOT EXISTS app_releases (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    release_notes TEXT,
    min_version TEXT,
    force_update INTEGER DEFAULT 0 CHECK(force_update IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. SPONSORSHIPS
CREATE TABLE IF NOT EXISTS sponsorships (
    id TEXT PRIMARY KEY,
    doctor_id TEXT REFERENCES doctors(id),
    doctor_name TEXT,
    hq_id TEXT REFERENCES hqs(id),
    employee_id TEXT REFERENCES users(id),
    employee_name TEXT,
    amount REAL NOT NULL CHECK(amount >= 0),
    event_date TEXT NOT NULL,
    event_name TEXT,
    event_location TEXT,
    financial_year TEXT,
    reason TEXT,
    product_schemes TEXT,
    educational_details TEXT,
    travel_details TEXT,
    accommodation_details TEXT,
    registration_details TEXT,
    others_details TEXT,
    reference_id TEXT,
    attachments TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    approval_id TEXT REFERENCES approvals(id),
    manager_remarks TEXT,
    approved_by TEXT REFERENCES users(id),
    approved_at DATETIME,
    is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);
CREATE INDEX IF NOT EXISTS idx_sponsorships_hq ON sponsorships(hq_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_emp ON sponsorships(employee_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_doc ON sponsorships(doctor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_fy ON sponsorships(financial_year);

-- 22. USER SESSIONS & REFRESH TOKEN ROTATION (Zero Trust Architecture)
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    session_family_id TEXT NOT NULL,
    refresh_token_hash TEXT NOT NULL,
    device_id TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at DATETIME NOT NULL,
    last_active_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked INTEGER DEFAULT 0 CHECK(is_revoked IN (0, 1)),
    revoked_at DATETIME,
    revocation_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_family ON user_sessions(session_family_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_hash ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(is_revoked, expires_at);


-- Head Offices (Apex Corporate HQs for Admin/Owner)
CREATE TABLE IF NOT EXISTS head_offices (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  address TEXT,
  pincode TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_head_offices_code ON head_offices (code);
CREATE INDEX IF NOT EXISTS idx_head_offices_active ON head_offices (is_active);


-- 23. ENTITY SEQUENCES
CREATE TABLE IF NOT EXISTS entity_sequences (
    entity_type TEXT PRIMARY KEY,
    last_seq INTEGER NOT NULL DEFAULT 0,
    prefix TEXT NOT NULL,
    padding INTEGER NOT NULL DEFAULT 3,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
