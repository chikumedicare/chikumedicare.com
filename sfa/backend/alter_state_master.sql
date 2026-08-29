ALTER TABLE states RENAME COLUMN code TO state_code;
ALTER TABLE states RENAME COLUMN name TO state_name;
ALTER TABLE states ADD COLUMN description TEXT;
ALTER TABLE states ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE states ADD COLUMN created_at DATETIME;
ALTER TABLE states ADD COLUMN updated_at DATETIME;
ALTER TABLE states ADD COLUMN created_by TEXT;
ALTER TABLE states ADD COLUMN updated_by TEXT;
ALTER TABLE states ADD COLUMN deleted_at DATETIME;
ALTER TABLE states ADD COLUMN deleted_by TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_states_code ON states(state_code);
