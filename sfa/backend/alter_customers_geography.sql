-- Add zone_id and state_id to doctors
ALTER TABLE doctors ADD COLUMN zone_id TEXT REFERENCES zones(id);
ALTER TABLE doctors ADD COLUMN state_id TEXT REFERENCES states(id);

-- Add zone_id and state_id to chemists
ALTER TABLE chemists ADD COLUMN zone_id TEXT REFERENCES zones(id);
ALTER TABLE chemists ADD COLUMN state_id TEXT REFERENCES states(id);

-- Add zone_id and state_id to stockists
ALTER TABLE stockists ADD COLUMN zone_id TEXT REFERENCES zones(id);
ALTER TABLE stockists ADD COLUMN state_id TEXT REFERENCES states(id);

-- Update existing records to inherit zone_id and state_id from hqs
UPDATE doctors SET 
  state_id = (SELECT state_id FROM hqs WHERE hqs.id = doctors.hq_id),
  zone_id = (SELECT zone_id FROM hqs WHERE hqs.id = doctors.hq_id)
WHERE hq_id IS NOT NULL;

UPDATE chemists SET 
  state_id = (SELECT state_id FROM hqs WHERE hqs.id = chemists.hq_id),
  zone_id = (SELECT zone_id FROM hqs WHERE hqs.id = chemists.hq_id)
WHERE hq_id IS NOT NULL;

UPDATE stockists SET 
  state_id = (SELECT state_id FROM hqs WHERE hqs.id = stockists.hq_id),
  zone_id = (SELECT zone_id FROM hqs WHERE hqs.id = stockists.hq_id)
WHERE hq_id IS NOT NULL;
