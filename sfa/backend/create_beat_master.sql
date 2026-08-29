-- BEAT MASTER MIGRATION

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
CREATE INDEX IF NOT EXISTS idx_beats_area ON beats(area_id);
CREATE INDEX IF NOT EXISTS idx_beats_status ON beats(is_active);
