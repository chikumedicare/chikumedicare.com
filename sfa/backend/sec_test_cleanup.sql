-- =========================================================================
-- SEC_TEST FIXTURES TARGETED CLEANUP SCRIPT
-- STRICTLY removes ONLY objects starting with prefix: SEC_TEST_
-- =========================================================================

DELETE FROM user_history WHERE user_id LIKE 'SEC_TEST_%';
DELETE FROM permission_cache WHERE user_id LIKE 'SEC_TEST_%';
DELETE FROM user_roles WHERE user_id LIKE 'SEC_TEST_%';
DELETE FROM user_covering_area WHERE user_id LIKE 'SEC_TEST_%';
DELETE FROM user_covering_hq WHERE user_id LIKE 'SEC_TEST_%';
DELETE FROM users WHERE id LIKE 'SEC_TEST_%' OR user_id LIKE 'SEC_TEST_%';
DELETE FROM employees WHERE id LIKE 'SEC_TEST_%' OR emp_code LIKE 'SEC_TEST_%';
DELETE FROM beats WHERE id LIKE 'SEC_TEST_%' OR beat_code LIKE 'SEC_TEST_%';
DELETE FROM areas WHERE id LIKE 'SEC_TEST_%' OR area_code LIKE 'SEC_TEST_%';
DELETE FROM hqs WHERE id LIKE 'SEC_TEST_%' OR hq_code LIKE 'SEC_TEST_%';
DELETE FROM states WHERE id LIKE 'SEC_TEST_%' OR state_code LIKE 'SEC_TEST_%';
DELETE FROM zones WHERE id LIKE 'SEC_TEST_%' OR zone_code LIKE 'SEC_TEST_%';
