ALTER TABLE doctors ADD COLUMN created_at DATETIME;
UPDATE doctors SET created_at = CURRENT_TIMESTAMP;

ALTER TABLE chemists ADD COLUMN created_at DATETIME;
UPDATE chemists SET created_at = CURRENT_TIMESTAMP;
