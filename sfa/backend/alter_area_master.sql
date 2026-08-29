-- Step 1: Add new columns allowing NULL initially
ALTER TABLE areas ADD COLUMN area_code TEXT;
ALTER TABLE areas ADD COLUMN zone_id TEXT REFERENCES zones(id);
ALTER TABLE areas ADD COLUMN state_id TEXT REFERENCES states(id);
ALTER TABLE areas ADD COLUMN distance_unit TEXT DEFAULT 'KM';
ALTER TABLE areas ADD COLUMN default_travel_mode TEXT;
ALTER TABLE areas ADD COLUMN both_side_allowed INTEGER DEFAULT 1;
ALTER TABLE areas ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE areas ADD COLUMN description TEXT;

-- Step 2: Add Standard Audit Fields
ALTER TABLE areas ADD COLUMN created_at DATETIME;
ALTER TABLE areas ADD COLUMN updated_at DATETIME;
ALTER TABLE areas ADD COLUMN created_by TEXT;
ALTER TABLE areas ADD COLUMN updated_by TEXT;
ALTER TABLE areas ADD COLUMN deleted_at DATETIME;
ALTER TABLE areas ADD COLUMN deleted_by TEXT;

-- Step 3: Rename legacy columns to match new schema while preserving data
ALTER TABLE areas RENAME COLUMN name TO area_name;
ALTER TABLE areas RENAME COLUMN type TO territory_type;
ALTER TABLE areas RENAME COLUMN distance_km TO distance_from_hq;
ALTER TABLE areas RENAME COLUMN rs_per_km TO fare_per_km;

-- Note: travel_mode, fare_amount, total_fare are kept as they might be used in legacy downstream modules.

-- Step 4: Create Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_areas_code ON areas(area_code);
CREATE INDEX IF NOT EXISTS idx_areas_hq ON areas(hq_id);
CREATE INDEX IF NOT EXISTS idx_areas_territory ON areas(territory_type);
CREATE INDEX IF NOT EXISTS idx_areas_status ON areas(is_active);
