-- Step 1: Add new columns allowing NULL initially
ALTER TABLE hqs ADD COLUMN hq_code TEXT;
ALTER TABLE hqs ADD COLUMN zone_id TEXT REFERENCES zones(id);
ALTER TABLE hqs ADD COLUMN hq_type TEXT;
ALTER TABLE hqs ADD COLUMN city TEXT;
ALTER TABLE hqs ADD COLUMN district TEXT;
ALTER TABLE hqs ADD COLUMN pin_code TEXT;
ALTER TABLE hqs ADD COLUMN latitude REAL;
ALTER TABLE hqs ADD COLUMN longitude REAL;
ALTER TABLE hqs ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE hqs ADD COLUMN description TEXT;

-- Step 2: Add Standard Audit Fields
ALTER TABLE hqs ADD COLUMN created_at DATETIME;
ALTER TABLE hqs ADD COLUMN updated_at DATETIME;
ALTER TABLE hqs ADD COLUMN created_by TEXT;
ALTER TABLE hqs ADD COLUMN updated_by TEXT;
ALTER TABLE hqs ADD COLUMN deleted_at DATETIME;
ALTER TABLE hqs ADD COLUMN deleted_by TEXT;

-- Step 3: Rename legacy `name` column to `hq_name`
ALTER TABLE hqs RENAME COLUMN name TO hq_name;

-- Step 4: Create Indexes
-- (Note: idx_hqs_code is UNIQUE but SQLite allows multiple NULLs in UNIQUE columns)
CREATE UNIQUE INDEX IF NOT EXISTS idx_hqs_code ON hqs(hq_code);
CREATE INDEX IF NOT EXISTS idx_hqs_zone ON hqs(zone_id);
CREATE INDEX IF NOT EXISTS idx_hqs_state ON hqs(state_id);
CREATE INDEX IF NOT EXISTS idx_hqs_status ON hqs(is_active);
