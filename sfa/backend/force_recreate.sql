
DROP TABLE IF EXISTS beats;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS hqs;

CREATE TABLE IF NOT EXISTS hqs (
    id TEXT PRIMARY KEY,
    hq_name TEXT NOT NULL,
    hq_code TEXT NOT NULL,
    state_id TEXT REFERENCES states(id),
    zone_id TEXT REFERENCES zones(id),
    hq_type TEXT,
    city TEXT,
    district TEXT,
    pin_code TEXT,
    latitude REAL,
    longitude REAL,
    is_pool_hq INTEGER DEFAULT 0,
    parent_pool_hq_id TEXT REFERENCES hqs(id),
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hqs_code ON hqs(hq_code);

CREATE TABLE IF NOT EXISTS areas (
    id TEXT PRIMARY KEY,
    area_name TEXT NOT NULL,
    area_code TEXT,
    territory_type TEXT,
    zone_id TEXT REFERENCES zones(id),
    state_id TEXT REFERENCES states(id),
    hq_id TEXT REFERENCES hqs(id),
    distance_from_hq REAL DEFAULT 0,
    distance_unit TEXT DEFAULT 'KM',
    default_travel_mode TEXT,
    fare_per_km REAL DEFAULT 0,
    both_side_allowed INTEGER DEFAULT 1,
    travel_mode TEXT DEFAULT 'TWO_SIDE',
    fare_amount REAL DEFAULT 0,
    total_fare REAL DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_areas_code ON areas(area_code);

CREATE TABLE IF NOT EXISTS beats (
    id TEXT PRIMARY KEY,
    beat_name TEXT NOT NULL,
    beat_code TEXT,
    beat_type TEXT,
    area_id TEXT REFERENCES areas(id),
    hq_id TEXT REFERENCES hqs(id),
    state_id TEXT REFERENCES states(id),
    zone_id TEXT REFERENCES zones(id),
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    description TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    created_by TEXT,
    updated_by TEXT,
    deleted_at DATETIME,
    deleted_by TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_beats_code ON beats(beat_code);

