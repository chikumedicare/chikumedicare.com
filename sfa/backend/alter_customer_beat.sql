-- Migration Script for Customer Beat Integration (Phase 5)

-- 1. Add beat_id to doctors table
ALTER TABLE doctors ADD COLUMN beat_id TEXT REFERENCES beats(id);

-- 2. Add beat_id to chemists table
ALTER TABLE chemists ADD COLUMN beat_id TEXT REFERENCES beats(id);

-- 3. Add beat_id to stockists table
ALTER TABLE stockists ADD COLUMN beat_id TEXT REFERENCES beats(id);
