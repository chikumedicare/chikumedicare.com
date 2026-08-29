-- Migration Script for User Lifecycle & Security (Phase 8)

-- 1. Add Status and Security fields to users table
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE'; -- ACTIVE, INACTIVE, RESIGNED, TERMINATED, ON LEAVE
ALTER TABLE users ADD COLUMN device_id TEXT;
ALTER TABLE users ADD COLUMN device_name TEXT;
ALTER TABLE users ADD COLUMN device_model TEXT;
ALTER TABLE users ADD COLUMN os_version TEXT;
ALTER TABLE users ADD COLUMN app_version TEXT;
ALTER TABLE users ADD COLUMN last_login DATETIME;
ALTER TABLE users ADD COLUMN registered_on DATETIME;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until DATETIME;

-- 2. Create Security & Audit Tables
CREATE TABLE IF NOT EXISTS password_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ph_user ON password_history(user_id);

CREATE TABLE IF NOT EXISTS login_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    device_id TEXT,
    result TEXT, -- SUCCESS, FAILED, LOCKED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_uh_user ON user_history(user_id);

CREATE TABLE IF NOT EXISTS role_change_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    previous_role TEXT,
    new_role TEXT NOT NULL,
    effective_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by TEXT,
    remarks TEXT
);
CREATE INDEX IF NOT EXISTS idx_rch_user ON role_change_history(user_id);

CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_ur_user ON user_roles(user_id);

CREATE TABLE IF NOT EXISTS permission_cache (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    permissions TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pc_user ON permission_cache(user_id);
