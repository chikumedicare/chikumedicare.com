CREATE TABLE IF NOT EXISTS head_offices (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  address TEXT,
  pincode TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_head_offices_code ON head_offices (code);
CREATE INDEX IF NOT EXISTS idx_head_offices_active ON head_offices (is_active);
