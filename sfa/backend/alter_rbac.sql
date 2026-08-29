-- STEP 1 — Add missing permissions to the permissions table
-- Columns: id, name, module, is_active
INSERT OR IGNORE INTO permissions (id, name, module) VALUES
  ('p_emp_view',   'employee.view', 'HR'),
  ('p_emp_create', 'employee.create', 'HR'),
  ('p_emp_edit',   'employee.edit', 'HR'),
  ('p_emp_delete', 'employee.delete', 'HR'),
  ('p_sales_edit', 'sales.edit', 'Sales');

-- STEP 2 — Assign these permissions to ADMIN and OWNER roles
-- Columns: id, role_id, permission_id
INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id) VALUES
  ('rp_admin_emp_view', 'r_admin', 'p_emp_view'),
  ('rp_admin_emp_create', 'r_admin', 'p_emp_create'),
  ('rp_admin_emp_edit', 'r_admin', 'p_emp_edit'),
  ('rp_admin_emp_delete', 'r_admin', 'p_emp_delete'),
  ('rp_admin_sales_edit', 'r_admin', 'p_sales_edit'),
  
  ('rp_owner_emp_view', 'r_owner', 'p_emp_view'),
  ('rp_owner_emp_create', 'r_owner', 'p_emp_create'),
  ('rp_owner_emp_edit', 'r_owner', 'p_emp_edit'),
  ('rp_owner_emp_delete', 'r_owner', 'p_emp_delete'),
  ('rp_owner_sales_edit', 'r_owner', 'p_sales_edit');
