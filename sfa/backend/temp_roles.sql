INSERT OR IGNORE INTO roles (id, name, description) VALUES ('r_nsm', 'NSM', 'National Sales Manager');

INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id) VALUES 
('rp_vp_cust', 'r_vp', 'p_manage_customers'),
('rp_vp_dcr', 'r_vp', 'p_manage_dcr'),
('rp_vp_exp', 'r_vp', 'p_manage_expenses'),
('rp_vp_leave', 'r_vp', 'p_manage_leaves'),
('rp_vp_tour', 'r_vp', 'p_manage_tour_plans'),
('rp_vp_rep', 'r_vp', 'p_view_reports'),

('rp_nsm_cust', 'r_nsm', 'p_manage_customers'),
('rp_nsm_dcr', 'r_nsm', 'p_manage_dcr'),
('rp_nsm_exp', 'r_nsm', 'p_manage_expenses'),
('rp_nsm_leave', 'r_nsm', 'p_manage_leaves'),
('rp_nsm_tour', 'r_nsm', 'p_manage_tour_plans'),
('rp_nsm_rep', 'r_nsm', 'p_view_reports'),

('rp_zsm_cust', 'r_zsm', 'p_manage_customers'),
('rp_zsm_dcr', 'r_zsm', 'p_manage_dcr'),
('rp_zsm_exp', 'r_zsm', 'p_manage_expenses'),
('rp_zsm_leave', 'r_zsm', 'p_manage_leaves'),
('rp_zsm_tour', 'r_zsm', 'p_manage_tour_plans'),
('rp_zsm_rep', 'r_zsm', 'p_view_reports'),

('rp_rsm_cust', 'r_rsm', 'p_manage_customers'),
('rp_rsm_dcr', 'r_rsm', 'p_manage_dcr'),
('rp_rsm_exp', 'r_rsm', 'p_manage_expenses'),
('rp_rsm_leave', 'r_rsm', 'p_manage_leaves'),
('rp_rsm_tour', 'r_rsm', 'p_manage_tour_plans'),
('rp_rsm_rep', 'r_rsm', 'p_view_reports');
