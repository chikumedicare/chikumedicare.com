-- Migration Script for User Hierarchy & Territory Mappings (Phase 7)

-- Add Hierarchy Auto-Population Fields
ALTER TABLE users ADD COLUMN manager_id TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN asm_id TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN rsm_id TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN zsm_id TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN vp_id TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN admin_id TEXT REFERENCES users(id);
ALTER TABLE users ADD COLUMN hierarchy_status TEXT DEFAULT 'VACANT';

-- Create Table: user_covering_hq (For VP, ZSM, RSM, ASM)
CREATE TABLE IF NOT EXISTS user_covering_hq (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    hq_id TEXT NOT NULL REFERENCES hqs(id),
    display_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    UNIQUE(user_id, hq_id)
);
CREATE INDEX IF NOT EXISTS idx_uch_user ON user_covering_hq(user_id);
CREATE INDEX IF NOT EXISTS idx_uch_hq ON user_covering_hq(hq_id);

-- Create Table: user_covering_area (For MR)
CREATE TABLE IF NOT EXISTS user_covering_area (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    area_id TEXT NOT NULL REFERENCES areas(id),
    display_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    UNIQUE(user_id, area_id)
);
CREATE INDEX IF NOT EXISTS idx_uca_user ON user_covering_area(user_id);
CREATE INDEX IF NOT EXISTS idx_uca_area ON user_covering_area(area_id);
