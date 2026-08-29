-- Migration Script for User Master (Phase 6 Foundation)

-- Add primary geographic mappings to users table (without touching existing hq_id which acts as primary HQ)
ALTER TABLE users ADD COLUMN primary_zone_id TEXT REFERENCES zones(id);
ALTER TABLE users ADD COLUMN primary_state_id TEXT REFERENCES states(id);
ALTER TABLE users ADD COLUMN primary_area_id TEXT REFERENCES areas(id);

-- Add missing audit and user tracking fields
ALTER TABLE users ADD COLUMN remarks TEXT;
ALTER TABLE users ADD COLUMN created_by TEXT;
ALTER TABLE users ADD COLUMN updated_at DATETIME;
ALTER TABLE users ADD COLUMN updated_by TEXT;
ALTER TABLE users ADD COLUMN deleted_at DATETIME;
ALTER TABLE users ADD COLUMN deleted_by TEXT;

-- Create missing performance indexes for user lists and queries
CREATE INDEX IF NOT EXISTS idx_users_emp_code ON users(emp_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_hq ON users(hq_id);
CREATE INDEX IF NOT EXISTS idx_users_area ON users(primary_area_id);
