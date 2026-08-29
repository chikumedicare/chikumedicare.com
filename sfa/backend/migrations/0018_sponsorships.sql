-- Create sponsorships table
CREATE TABLE IF NOT EXISTS sponsorships (
    id TEXT PRIMARY KEY,
    financial_year TEXT NOT NULL DEFAULT '2026-27',
    hq_id TEXT NOT NULL,
    hq_name TEXT NOT NULL,
    employee_id TEXT,
    employee_name TEXT DEFAULT 'VACANT',
    created_by TEXT NOT NULL,
    created_by_name TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_code TEXT,
    doctor_reg_no TEXT,
    chemist_ids TEXT,
    chemist_names TEXT,
    sponsorship_type TEXT NOT NULL,
    event_date TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0.0,
    reason TEXT,
    product_schemes TEXT,
    educational_details TEXT,
    travel_details TEXT,
    accommodation_details TEXT,
    registration_details TEXT,
    others_details TEXT,
    reference_id TEXT,
    attachments TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    approval_id TEXT,
    manager_remarks TEXT,
    approved_by TEXT,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sponsorships_hq ON sponsorships(hq_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_emp ON sponsorships(employee_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_doc ON sponsorships(doctor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_created ON sponsorships(created_at);
