-- =========================================================================
-- SEC_TEST FIXTURES PROVISIONING SCRIPT (ISOLATED SECURITY TEST HARNESS)
-- All created entities strictly start with prefix: SEC_TEST_
-- =========================================================================

-- 1. ISOLATED TEST GEOGRAPHY (SCOPE A & SCOPE B)
INSERT OR REPLACE INTO zones (id, zone_code, name, is_active, created_at) VALUES 
('SEC_TEST_ZONE_A', 'SEC_TEST_ZA', 'Security Test Zone Alpha', 1, CURRENT_TIMESTAMP),
('SEC_TEST_ZONE_B', 'SEC_TEST_ZB', 'Security Test Zone Beta', 1, CURRENT_TIMESTAMP);

INSERT OR REPLACE INTO states (id, state_code, state_name, zone_id, is_active, created_at) VALUES 
('SEC_TEST_STATE_A', 'SEC_TEST_STA', 'Security Test State Alpha', 'SEC_TEST_ZONE_A', 1, CURRENT_TIMESTAMP),
('SEC_TEST_STATE_B', 'SEC_TEST_STB', 'Security Test State Beta', 'SEC_TEST_ZONE_B', 1, CURRENT_TIMESTAMP);

INSERT OR REPLACE INTO hqs (id, hq_code, hq_name, state_id, zone_id, hq_type, city, is_active, created_at) VALUES 
('SEC_TEST_HQ_A', 'SEC_TEST_HQA', 'Security Test HQ Alpha', 'SEC_TEST_STATE_A', 'SEC_TEST_ZONE_A', 'METRO', 'Test City Alpha', 1, CURRENT_TIMESTAMP),
('SEC_TEST_HQ_B', 'SEC_TEST_HQB', 'Security Test HQ Beta', 'SEC_TEST_STATE_B', 'SEC_TEST_ZONE_B', 'METRO', 'Test City Beta', 1, CURRENT_TIMESTAMP);

INSERT OR REPLACE INTO areas (id, area_code, area_name, hq_id, state_id, zone_id, territory_type, is_active, created_at) VALUES 
('SEC_TEST_AREA_A', 'SEC_TEST_ARA', 'Security Test Area Alpha', 'SEC_TEST_HQ_A', 'SEC_TEST_STATE_A', 'SEC_TEST_ZONE_A', 'LOCAL', 1, CURRENT_TIMESTAMP),
('SEC_TEST_AREA_B', 'SEC_TEST_ARB', 'Security Test Area Beta', 'SEC_TEST_HQ_B', 'SEC_TEST_STATE_B', 'SEC_TEST_ZONE_B', 'LOCAL', 1, CURRENT_TIMESTAMP);

INSERT OR REPLACE INTO beats (id, beat_code, beat_name, area_id, hq_id, state_id, zone_id, beat_type, is_active, created_at) VALUES 
('SEC_TEST_BEAT_A', 'SEC_TEST_BTA', 'Security Test Beat Alpha', 'SEC_TEST_AREA_A', 'SEC_TEST_HQ_A', 'SEC_TEST_STATE_A', 'SEC_TEST_ZONE_A', 'CORE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_BEAT_B', 'SEC_TEST_BTB', 'Security Test Beat Beta', 'SEC_TEST_AREA_B', 'SEC_TEST_HQ_B', 'SEC_TEST_STATE_B', 'SEC_TEST_ZONE_B', 'CORE', 1, CURRENT_TIMESTAMP);

-- 2. ISOLATED TEST EMPLOYEES
INSERT OR REPLACE INTO employees (id, emp_code, first_name, last_name, mobile, email, department, designation, employee_status, is_active, created_at) VALUES 
('SEC_TEST_EMP_OWNER', 'SEC_TEST_EMP_OWNER', 'Security Test', 'Owner', '9999000001', 'sec_owner@test.com', 'Management', 'Managing Director', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_VP', 'SEC_TEST_EMP_VP', 'Security Test', 'VP', '9999000002', 'sec_vp@test.com', 'Sales', 'Vice President', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_NSM', 'SEC_TEST_EMP_NSM', 'Security Test', 'NSM', '9999000003', 'sec_nsm@test.com', 'Sales', 'National Sales Manager', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_ZSM', 'SEC_TEST_EMP_ZSM', 'Security Test', 'ZSM', '9999000004', 'sec_zsm@test.com', 'Sales', 'Zonal Sales Manager', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_RSM', 'SEC_TEST_EMP_RSM', 'Security Test', 'RSM', '9999000005', 'sec_rsm@test.com', 'Sales', 'Regional Sales Manager', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_ASM_A', 'SEC_TEST_EMP_ASM_A', 'Security Test', 'ASM Alpha', '9999000006', 'sec_asm_a@test.com', 'Sales', 'Area Sales Manager', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_MR_A', 'SEC_TEST_EMP_MR_A', 'Security Test', 'MR Alpha', '9999000007', 'sec_mr_a@test.com', 'Sales', 'Field Representative', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_ASM_B', 'SEC_TEST_EMP_ASM_B', 'Security Test', 'ASM Beta', '9999000008', 'sec_asm_b@test.com', 'Sales', 'Area Sales Manager', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('SEC_TEST_EMP_MR_B', 'SEC_TEST_EMP_MR_B', 'Security Test', 'MR Beta', '9999000009', 'sec_mr_b@test.com', 'Sales', 'Field Representative', 'ACTIVE', 1, CURRENT_TIMESTAMP);

-- 3. ISOLATED TEST USERS WITH REPORTING HIERARCHY
-- Password hash: 7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a (SHA-256 of TestSec123)
INSERT OR REPLACE INTO users (
  id, user_id, password_hash, full_name, emp_code, role, 
  hq_id, covering_hq_ids, area_ids, primary_zone_id, primary_state_id, primary_area_id, 
  reports_to_id, manager_id, is_active, status, created_at
) VALUES 
('SEC_TEST_USR_OWNER', 'SEC_TEST_OWNER', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test Owner', 'SEC_TEST_EMP_OWNER', 'OWNER', NULL, '[]', '[]', NULL, NULL, NULL, NULL, NULL, 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_VP', 'SEC_TEST_VP', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test VP', 'SEC_TEST_EMP_VP', 'VP', NULL, '["SEC_TEST_HQ_A","SEC_TEST_HQ_B"]', '[]', NULL, NULL, NULL, 'SEC_TEST_USR_OWNER', 'SEC_TEST_USR_OWNER', 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_NSM', 'SEC_TEST_NSM', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test NSM', 'SEC_TEST_EMP_NSM', 'NSM', NULL, '["SEC_TEST_HQ_A","SEC_TEST_HQ_B"]', '[]', NULL, NULL, NULL, 'SEC_TEST_USR_VP', 'SEC_TEST_USR_VP', 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_ZSM', 'SEC_TEST_ZSM', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test ZSM', 'SEC_TEST_EMP_ZSM', 'ZSM', NULL, '["SEC_TEST_HQ_A"]', '[]', 'SEC_TEST_ZONE_A', NULL, NULL, 'SEC_TEST_USR_NSM', 'SEC_TEST_USR_NSM', 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_RSM', 'SEC_TEST_RSM', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test RSM', 'SEC_TEST_EMP_RSM', 'RSM', NULL, '["SEC_TEST_HQ_A"]', '[]', 'SEC_TEST_ZONE_A', 'SEC_TEST_STATE_A', NULL, 'SEC_TEST_USR_ZSM', 'SEC_TEST_USR_ZSM', 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_ASM_A', 'SEC_TEST_ASM_A', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test ASM Alpha', 'SEC_TEST_EMP_ASM_A', 'ASM', 'SEC_TEST_HQ_A', '["SEC_TEST_HQ_A"]', '[]', 'SEC_TEST_ZONE_A', 'SEC_TEST_STATE_A', 'SEC_TEST_AREA_A', 'SEC_TEST_USR_RSM', 'SEC_TEST_USR_RSM', 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_MR_A', 'SEC_TEST_MR_A', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test MR Alpha', 'SEC_TEST_EMP_MR_A', 'MR', 'SEC_TEST_HQ_A', '["SEC_TEST_HQ_A"]', '["SEC_TEST_AREA_A"]', 'SEC_TEST_ZONE_A', 'SEC_TEST_STATE_A', 'SEC_TEST_AREA_A', 'SEC_TEST_USR_ASM_A', 'SEC_TEST_USR_ASM_A', 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_ASM_B', 'SEC_TEST_ASM_B', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test ASM Beta', 'SEC_TEST_EMP_ASM_B', 'ASM', 'SEC_TEST_HQ_B', '["SEC_TEST_HQ_B"]', '[]', 'SEC_TEST_ZONE_B', 'SEC_TEST_STATE_B', 'SEC_TEST_AREA_B', 'SEC_TEST_USR_VP', 'SEC_TEST_USR_VP', 1, 'ACTIVE', CURRENT_TIMESTAMP),
('SEC_TEST_USR_MR_B', 'SEC_TEST_MR_B', '7bc75c0d7658269a26f4b6dcbd32f5689aafda5eaaae7501440e60d4bf237b1a', 'Security Test MR Beta', 'SEC_TEST_EMP_MR_B', 'MR', 'SEC_TEST_HQ_B', '["SEC_TEST_HQ_B"]', '["SEC_TEST_AREA_B"]', 'SEC_TEST_ZONE_B', 'SEC_TEST_STATE_B', 'SEC_TEST_AREA_B', 'SEC_TEST_USR_ASM_B', 'SEC_TEST_USR_ASM_B', 1, 'ACTIVE', CURRENT_TIMESTAMP);

-- 4. USER ROLES & COVERING MAPPINGS
INSERT OR REPLACE INTO user_roles (id, user_id, role, assigned_by, assigned_at, is_active) VALUES 
('ur_sec_owner', 'SEC_TEST_USR_OWNER', 'OWNER', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_vp', 'SEC_TEST_USR_VP', 'VP', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_nsm', 'SEC_TEST_USR_NSM', 'NSM', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_zsm', 'SEC_TEST_USR_ZSM', 'ZSM', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_rsm', 'SEC_TEST_USR_RSM', 'RSM', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_asm_a', 'SEC_TEST_USR_ASM_A', 'ASM', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_mr_a', 'SEC_TEST_USR_MR_A', 'MR', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_asm_b', 'SEC_TEST_USR_ASM_B', 'ASM', 'system_sec', CURRENT_TIMESTAMP, 1),
('ur_sec_mr_b', 'SEC_TEST_USR_MR_B', 'MR', 'system_sec', CURRENT_TIMESTAMP, 1);

INSERT OR REPLACE INTO user_covering_hq (id, user_id, hq_id, status) VALUES 
('uch_sec_vp_a', 'SEC_TEST_USR_VP', 'SEC_TEST_HQ_A', 1),
('uch_sec_vp_b', 'SEC_TEST_USR_VP', 'SEC_TEST_HQ_B', 1),
('uch_sec_nsm_a', 'SEC_TEST_USR_NSM', 'SEC_TEST_HQ_A', 1),
('uch_sec_nsm_b', 'SEC_TEST_USR_NSM', 'SEC_TEST_HQ_B', 1),
('uch_sec_zsm_a', 'SEC_TEST_USR_ZSM', 'SEC_TEST_HQ_A', 1),
('uch_sec_rsm_a', 'SEC_TEST_USR_RSM', 'SEC_TEST_HQ_A', 1),
('uch_sec_asm_a', 'SEC_TEST_USR_ASM_A', 'SEC_TEST_HQ_A', 1),
('uch_sec_mr_a', 'SEC_TEST_USR_MR_A', 'SEC_TEST_HQ_A', 1),
('uch_sec_asm_b', 'SEC_TEST_USR_ASM_B', 'SEC_TEST_HQ_B', 1),
('uch_sec_mr_b', 'SEC_TEST_USR_MR_B', 'SEC_TEST_HQ_B', 1);

INSERT OR REPLACE INTO user_covering_area (id, user_id, area_id, status) VALUES 
('uca_sec_mr_a', 'SEC_TEST_USR_MR_A', 'SEC_TEST_AREA_A', 1),
('uca_sec_mr_b', 'SEC_TEST_USR_MR_B', 'SEC_TEST_AREA_B', 1);

-- 5. AUDIT ENTRIES FOR TEST FIXTURES
INSERT OR REPLACE INTO user_history (id, user_id, action, changed_by, remarks) VALUES 
('uh_sec_owner', 'SEC_TEST_USR_OWNER', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_vp', 'SEC_TEST_USR_VP', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_nsm', 'SEC_TEST_USR_NSM', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_zsm', 'SEC_TEST_USR_ZSM', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_rsm', 'SEC_TEST_USR_RSM', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_asm_a', 'SEC_TEST_USR_ASM_A', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_mr_a', 'SEC_TEST_USR_MR_A', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_asm_b', 'SEC_TEST_USR_ASM_B', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned'),
('uh_sec_mr_b', 'SEC_TEST_USR_MR_B', 'PROVISION_TEST_FIXTURE', 'SEC_ADMIN', 'Safe test fixture provisioned');
