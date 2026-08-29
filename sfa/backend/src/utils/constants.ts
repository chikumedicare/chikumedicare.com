export const ALLOWED_TABLES = new Set([
	'hqs', 'areas', 'beats', 'users', 'doctors', 'chemists', 'stockists',
	'products', 'approvals', 'dcr_entries', 'holidays',
	'zones', 'states', 'expenses', 'payroll', 'loans', 'leave_allocations',
	'sales_entries', 'audit_logs', 'sales_targets', 'tour_plans', 'leave_applications',
	'employees', 'da_rates', 'sfc_rates', 'location_checkpoints', 'back_date_permissions',
	'head_office', 'divisions', 'user_history', 'role_change_history', 'system_sequences'
]);

export const TABLES_WITH_CREATED_AT = new Set([
	'users', 'doctors', 'chemists', 'stockists', 'products', 'approvals',
	'dcr_entries', 'leave_allocations', 'sales_entries', 'leave_applications', 'zones', 'states', 'hqs', 'areas', 'beats',
	'employees', 'da_rates', 'sfc_rates', 'location_checkpoints', 'back_date_permissions',
	'divisions', 'expenses', 'payroll', 'loans', 'sales_targets', 'tour_plans', 'holidays', 'sponsorships'
]);

export const PROTECTED_FIELDS = new Set([
	'role', 'basic_salary', 'emp_code', 'password_hash'
]);
