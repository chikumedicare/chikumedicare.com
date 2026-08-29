PRAGMA foreign_keys = OFF;

-- Delete admin user record from D1 database
DELETE FROM user_covering_hq WHERE user_id = 'admin' OR user_id = '605d1dbf-aa4a-426e-a2bc-ff8ba216d654';
DELETE FROM users WHERE user_id = 'admin' OR role = 'ADMIN' OR id = '605d1dbf-aa4a-426e-a2bc-ff8ba216d654';

PRAGMA foreign_keys = ON;
