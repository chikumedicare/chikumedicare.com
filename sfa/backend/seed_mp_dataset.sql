-- MP Testing Dataset Seed Script
-- Financial Year 2026-27 | Password: chiku123

-- 1. DIVISIONS TABLE & SEED
CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    division_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1
);

INSERT OR REPLACE INTO divisions (id, division_code, name, is_active) VALUES ('div_1', 'DIV-HC', 'Chiku Healthcare', 1);
INSERT OR REPLACE INTO divisions (id, division_code, name, is_active) VALUES ('div_2', 'DIV-PH', 'Chiku Pharma', 1);

-- 2. ZONES & STATES
INSERT OR REPLACE INTO zones (id, zone_code, name, division_id, is_active) VALUES ('zone_central', 'Z-CENTRAL', 'Central India Zone', 'div_1', 1);
INSERT OR REPLACE INTO states (id, state_code, state_name, zone_id, division_id, is_active) VALUES ('state_mp', 'MP', 'Madhya Pradesh', 'zone_central', 'div_1', 1);

-- 3. 10 HEADQUARTERS (MP Cities) FOR DIVISION 1 & DIVISION 2
INSERT OR REPLACE INTO hqs (id, hq_name, hq_code, state_id, zone_id, city, division_id, is_active) VALUES
('hq_indore_d1', 'Indore HQ', 'HQ-IND-1', 'state_mp', 'zone_central', 'Indore', 'div_1', 1),
('hq_bhopal_d1', 'Bhopal HQ', 'HQ-BHO-1', 'state_mp', 'zone_central', 'Bhopal', 'div_1', 1),
('hq_gwalior_d1', 'Gwalior HQ', 'HQ-GWA-1', 'state_mp', 'zone_central', 'Gwalior', 'div_1', 1),
('hq_jabalpur_d1', 'Jabalpur HQ', 'HQ-JAB-1', 'state_mp', 'zone_central', 'Jabalpur', 'div_1', 1),
('hq_ujjain_d1', 'Ujjain HQ', 'HQ-UJJ-1', 'state_mp', 'zone_central', 'Ujjain', 'div_1', 1),
('hq_sagar_d1', 'Sagar HQ', 'HQ-SAG-1', 'state_mp', 'zone_central', 'Sagar', 'div_1', 1),
('hq_rewa_d1', 'Rewa HQ', 'HQ-REW-1', 'state_mp', 'zone_central', 'Rewa', 'div_1', 1),
('hq_satna_d1', 'Satna HQ', 'HQ-SAT-1', 'state_mp', 'zone_central', 'Satna', 'div_1', 1),
('hq_dewas_d1', 'Dewas HQ', 'HQ-DEW-1', 'state_mp', 'zone_central', 'Dewas', 'div_1', 1),
('hq_ratlam_d1', 'Ratlam HQ', 'HQ-RAT-1', 'state_mp', 'zone_central', 'Ratlam', 'div_1', 1);

INSERT OR REPLACE INTO hqs (id, hq_name, hq_code, state_id, zone_id, city, division_id, is_active) VALUES
('hq_indore_d2', 'Indore HQ', 'HQ-IND-2', 'state_mp', 'zone_central', 'Indore', 'div_2', 1),
('hq_bhopal_d2', 'Bhopal HQ', 'HQ-BHO-2', 'state_mp', 'zone_central', 'Bhopal', 'div_2', 1),
('hq_gwalior_d2', 'Gwalior HQ', 'HQ-GWA-2', 'state_mp', 'zone_central', 'Gwalior', 'div_2', 1),
('hq_jabalpur_d2', 'Jabalpur HQ', 'HQ-JAB-2', 'state_mp', 'zone_central', 'Jabalpur', 'div_2', 1),
('hq_ujjain_d2', 'Ujjain HQ', 'HQ-UJJ-2', 'state_mp', 'zone_central', 'Ujjain', 'div_2', 1),
('hq_sagar_d2', 'Sagar HQ', 'HQ-SAG-2', 'state_mp', 'zone_central', 'Sagar', 'div_2', 1),
('hq_rewa_d2', 'Rewa HQ', 'HQ-REW-2', 'state_mp', 'zone_central', 'Rewa', 'div_2', 1),
('hq_satna_d2', 'Satna HQ', 'HQ-SAT-2', 'state_mp', 'zone_central', 'Satna', 'div_2', 1),
('hq_dewas_d2', 'Dewas HQ', 'HQ-DEW-2', 'state_mp', 'zone_central', 'Dewas', 'div_2', 1),
('hq_ratlam_d2', 'Ratlam HQ', 'HQ-RAT-2', 'state_mp', 'zone_central', 'Ratlam', 'div_2', 1);

-- 4. 3 AREAS PER HQ (under 150km radius)
INSERT OR REPLACE INTO areas (id, area_name, area_code, territory_type, hq_id, state_id, zone_id, division_id, is_active) VALUES
('ar_ind_loc_d1', 'Indore Local Area', 'AR-IND-L1', 'LOCAL', 'hq_indore_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_ind_ex_d1', 'Dewas Ex-HQ Area (<40km)', 'AR-IND-E1', 'EX_HQ', 'hq_indore_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_ind_out_d1', 'Ujjain Outstation Area (<60km)', 'AR-IND-O1', 'OUTSTATION', 'hq_indore_d1', 'state_mp', 'zone_central', 'div_1', 1),

('ar_bho_loc_d1', 'Bhopal Local Area', 'AR-BHO-L1', 'LOCAL', 'hq_bhopal_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_bho_ex_d1', 'Sehore Ex-HQ Area (<38km)', 'AR-BHO-E1', 'EX_HQ', 'hq_bhopal_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_bho_out_d1', 'Vidisha Outstation Area (<55km)', 'AR-BHO-O1', 'OUTSTATION', 'hq_bhopal_d1', 'state_mp', 'zone_central', 'div_1', 1),

('ar_gwa_loc_d1', 'Gwalior Local Area', 'AR-GWA-L1', 'LOCAL', 'hq_gwalior_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_gwa_ex_d1', 'Morena Ex-HQ Area (<38km)', 'AR-GWA-E1', 'EX_HQ', 'hq_gwalior_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_gwa_out_d1', 'Dholpur Outstation Area (<75km)', 'AR-GWA-O1', 'OUTSTATION', 'hq_gwalior_d1', 'state_mp', 'zone_central', 'div_1', 1),

('ar_jab_loc_d1', 'Jabalpur Local Area', 'AR-JAB-L1', 'LOCAL', 'hq_jabalpur_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_jab_ex_d1', 'Katni Ex-HQ Area (<90km)', 'AR-JAB-E1', 'EX_HQ', 'hq_jabalpur_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_jab_out_d1', 'Mandla Outstation Area (<95km)', 'AR-JAB-O1', 'OUTSTATION', 'hq_jabalpur_d1', 'state_mp', 'zone_central', 'div_1', 1),

('ar_ujj_loc_d1', 'Ujjain Local Area', 'AR-UJJ-L1', 'LOCAL', 'hq_ujjain_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_ujj_ex_d1', 'Nagda Ex-HQ Area (<50km)', 'AR-UJJ-E1', 'EX_HQ', 'hq_ujjain_d1', 'state_mp', 'zone_central', 'div_1', 1),
('ar_ujj_out_d1', 'Ratlam Outstation Area (<85km)', 'AR-UJJ-O1', 'OUTSTATION', 'hq_ujjain_d1', 'state_mp', 'zone_central', 'div_1', 1);

INSERT OR REPLACE INTO areas (id, area_name, area_code, territory_type, hq_id, state_id, zone_id, division_id, is_active) VALUES
('ar_sag_loc_d2', 'Sagar Local Area', 'AR-SAG-L2', 'LOCAL', 'hq_sagar_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_sag_ex_d2', 'Damoh Ex-HQ Area (<80km)', 'AR-SAG-E2', 'EX_HQ', 'hq_sagar_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_sag_out_d2', 'Bina Outstation Area (<75km)', 'AR-SAG-O2', 'OUTSTATION', 'hq_sagar_d2', 'state_mp', 'zone_central', 'div_2', 1),

('ar_rew_loc_d2', 'Rewa Local Area', 'AR-REW-L2', 'LOCAL', 'hq_rewa_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_rew_ex_d2', 'Satna Ex-HQ Area (<55km)', 'AR-REW-E2', 'EX_HQ', 'hq_rewa_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_rew_out_d2', 'Sidhi Outstation Area (<85km)', 'AR-REW-O2', 'OUTSTATION', 'hq_rewa_d2', 'state_mp', 'zone_central', 'div_2', 1),

('ar_sat_loc_d2', 'Satna Local Area', 'AR-SAT-L2', 'LOCAL', 'hq_satna_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_sat_ex_d2', 'Maihar Ex-HQ Area (<42km)', 'AR-SAT-E2', 'EX_HQ', 'hq_satna_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_sat_out_d2', 'Panna Outstation Area (<70km)', 'AR-SAT-O2', 'OUTSTATION', 'hq_satna_d2', 'state_mp', 'zone_central', 'div_2', 1),

('ar_dew_loc_d2', 'Dewas Local Area', 'AR-DEW-L2', 'LOCAL', 'hq_dewas_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_dew_ex_d2', 'Shajapur Ex-HQ Area (<60km)', 'AR-DEW-E2', 'EX_HQ', 'hq_dewas_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_dew_out_d2', 'Sonkatch Outstation Area (<35km)', 'AR-DEW-O2', 'OUTSTATION', 'hq_dewas_d2', 'state_mp', 'zone_central', 'div_2', 1),

('ar_rat_loc_d2', 'Ratlam Local Area', 'AR-RAT-L2', 'LOCAL', 'hq_ratlam_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_rat_ex_d2', 'Mandsaur Ex-HQ Area (<85km)', 'AR-RAT-E2', 'EX_HQ', 'hq_ratlam_d2', 'state_mp', 'zone_central', 'div_2', 1),
('ar_rat_out_d2', 'Jaora Outstation Area (<35km)', 'AR-RAT-O2', 'OUTSTATION', 'hq_ratlam_d2', 'state_mp', 'zone_central', 'div_2', 1);

-- 5. ADMIN & OWNER ACCOUNTS
INSERT OR REPLACE INTO users (id, user_id, password_hash, full_name, role, emp_code, division_id, is_active, status) VALUES
('u_owner_1', 'CHIKU00001', '43a0d17178a9d26c9e0fe9a74b0b45e38d32f27aed887a008a54bf6e033bf7b9', 'Dr. Chiku (Owner)', 'OWNER', 'EMP-OWN-01', 'div_1', 1, 'ACTIVE'),
('u_admin_1', 'admin', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'System Administrator', 'ADMIN', 'EMP-ADM-01', 'div_1', 1, 'ACTIVE');

-- 6. USERS FOR DIVISION 1 (Password: chiku123)
INSERT OR REPLACE INTO users (id, user_id, password_hash, full_name, role, emp_code, division_id, is_active, status) VALUES
('u_rsm_mp1', 'rsm_mp1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Rajesh Sharma', 'RSM', 'EMP-RSM-01', 'div_1', 1, 'ACTIVE');

INSERT OR REPLACE INTO users (id, user_id, password_hash, full_name, role, emp_code, division_id, reports_to_id, manager_id, rsm_id, is_active, status) VALUES
('u_asm_indore', 'asm_indore', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Anil Verma', 'ASM', 'EMP-ASM-01', 'div_1', 'u_rsm_mp1', 'u_rsm_mp1', 'u_rsm_mp1', 1, 'ACTIVE'),
('u_asm_bhopal', 'asm_bhopal', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Sunil Gupta', 'ASM', 'EMP-ASM-02', 'div_1', 'u_rsm_mp1', 'u_rsm_mp1', 'u_rsm_mp1', 1, 'ACTIVE');

INSERT OR REPLACE INTO users (id, user_id, password_hash, full_name, role, emp_code, division_id, hq_id, reports_to_id, manager_id, asm_id, rsm_id, is_active, status) VALUES
('u_mr_indore1', 'mr_indore1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Manish Kumar', 'MR', 'EMP-MR-01', 'div_1', 'hq_indore_d1', 'u_asm_indore', 'u_asm_indore', 'u_asm_indore', 'u_rsm_mp1', 1, 'ACTIVE'),
('u_mr_bhopal1', 'mr_bhopal1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Vikram Singh', 'MR', 'EMP-MR-02', 'div_1', 'hq_bhopal_d1', 'u_asm_bhopal', 'u_asm_bhopal', 'u_asm_bhopal', 'u_rsm_mp1', 1, 'ACTIVE'),
('u_mr_gwalior1', 'mr_gwalior1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Rohan Patel', 'MR', 'EMP-MR-03', 'div_1', 'hq_gwalior_d1', 'u_asm_indore', 'u_asm_indore', 'u_asm_indore', 'u_rsm_mp1', 1, 'ACTIVE'),
('u_mr_jabalpur1', 'mr_jabalpur1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Amit Joshi', 'MR', 'EMP-MR-04', 'div_1', 'hq_jabalpur_d1', 'u_asm_bhopal', 'u_asm_bhopal', 'u_asm_bhopal', 'u_rsm_mp1', 1, 'ACTIVE'),
('u_mr_ujjain1', 'mr_ujjain1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Sanjay Jain', 'MR', 'EMP-MR-05', 'div_1', 'hq_ujjain_d1', 'u_asm_indore', 'u_asm_indore', 'u_asm_indore', 'u_rsm_mp1', 1, 'ACTIVE');

-- 7. USERS FOR DIVISION 2 (Password: chiku123)
INSERT OR REPLACE INTO users (id, user_id, password_hash, full_name, role, emp_code, division_id, is_active, status) VALUES
('u_rsm_mp2', 'rsm_mp2', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Deepak Tiwari', 'RSM', 'EMP-RSM-02', 'div_2', 1, 'ACTIVE');

INSERT OR REPLACE INTO users (id, user_id, password_hash, full_name, role, emp_code, division_id, reports_to_id, manager_id, rsm_id, is_active, status) VALUES
('u_asm_gwalior', 'asm_gwalior', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Pankaj Mishra', 'ASM', 'EMP-ASM-03', 'div_2', 'u_rsm_mp2', 'u_rsm_mp2', 'u_rsm_mp2', 1, 'ACTIVE'),
('u_asm_jabalpur', 'asm_jabalpur', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Alok Pandey', 'ASM', 'EMP-ASM-04', 'div_2', 'u_rsm_mp2', 'u_rsm_mp2', 'u_rsm_mp2', 1, 'ACTIVE');

INSERT OR REPLACE INTO users (id, user_id, password_hash, full_name, role, emp_code, division_id, hq_id, reports_to_id, manager_id, asm_id, rsm_id, is_active, status) VALUES
('u_mr_sagar1', 'mr_sagar1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Rahul Sen', 'MR', 'EMP-MR-06', 'div_2', 'hq_sagar_d2', 'u_asm_gwalior', 'u_asm_gwalior', 'u_asm_gwalior', 'u_rsm_mp2', 1, 'ACTIVE'),
('u_mr_rewa1', 'mr_rewa1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Nitin Shukla', 'MR', 'EMP-MR-07', 'div_2', 'hq_rewa_d2', 'u_asm_jabalpur', 'u_asm_jabalpur', 'u_asm_jabalpur', 'u_rsm_mp2', 1, 'ACTIVE'),
('u_mr_satna1', 'mr_satna1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Gaurav Tripathi', 'MR', 'EMP-MR-08', 'div_2', 'hq_satna_d2', 'u_asm_jabalpur', 'u_asm_jabalpur', 'u_asm_jabalpur', 'u_rsm_mp2', 1, 'ACTIVE'),
('u_mr_dewas1', 'mr_dewas1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Praveen Yadav', 'MR', 'EMP-MR-09', 'div_2', 'hq_dewas_d2', 'u_asm_gwalior', 'u_asm_gwalior', 'u_asm_gwalior', 'u_rsm_mp2', 1, 'ACTIVE'),
('u_mr_ratlam1', 'mr_ratlam1', '794184c7d9f6939335bb08e06f63b4e452422928ea63c6fd79316c586a6b7865', 'Neeraj Chouhan', 'MR', 'EMP-MR-10', 'div_2', 'hq_ratlam_d2', 'u_asm_gwalior', 'u_asm_gwalior', 'u_asm_gwalior', 'u_rsm_mp2', 1, 'ACTIVE');
