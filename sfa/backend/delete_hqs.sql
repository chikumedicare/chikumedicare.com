PRAGMA foreign_keys = OFF;

-- Clear test/old HQs from D1 database
DELETE FROM user_covering_hq;
DELETE FROM hqs;

PRAGMA foreign_keys = ON;
