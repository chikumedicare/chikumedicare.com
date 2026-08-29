export const ALLOWED_SORT_COLUMNS: Record<string, Set<string>> = {
  head_office: new Set(['id', 'company_name', 'brand_name', 'city', 'state_name', 'pin_code', 'is_active', 'created_at']),
  head_offices: new Set(['id', 'code', 'name', 'city', 'state', 'created_at']),
  doctors: new Set(['id', 'dr_code', 'name', 'created_at', 'visit_frequency']),
  chemists: new Set(['id', 'chemist_code', 'shop_name', 'created_at']),
  stockists: new Set(['id', 'stockist_code', 'firm_name', 'created_at']),
  products: new Set(['id', 'product_code', 'name', 'mrp', 'pts', 'ptr', 'created_at']),
  users: new Set(['id', 'user_id', 'full_name', 'role', 'created_at', 'last_login']),
  employees: new Set(['id', 'emp_code', 'first_name', 'last_name', 'created_at']),
  dcr_entries: new Set(['id', 'date', 'created_at', 'submitted_at']),
  leave_applications: new Set(['id', 'from_date', 'to_date', 'status', 'created_at']),
  leave_allocations: new Set(['id', 'year', 'created_at']),
  expenses: new Set(['id', 'month_year', 'status', 'created_at']),
  payroll: new Set(['id', 'month_year', 'net_pay', 'created_at']),
  loans: new Set(['id', 'principal_amount', 'created_at']),
  tour_plans: new Set(['id', 'month_year', 'status', 'created_at']),
  approvals: new Set(['id', 'status', 'created_at']),
  sfc_rates: new Set(['id', 'distance_km', 'approved_fare', 'created_at']),
  da_rates: new Set(['id', 'amount', 'effective_from', 'created_at']),
  zones: new Set(['id', 'name', 'zone_code', 'created_at']),
  states: new Set(['id', 'state_name', 'state_code', 'created_at']),
  hqs: new Set(['id', 'name', 'code', 'created_at']),
  areas: new Set(['id', 'area_name', 'area_code', 'created_at']),
  beats: new Set(['id', 'beat_name', 'beat_code', 'created_at']),
  divisions: new Set(['id', 'name', 'code', 'created_at']),
  holidays: new Set(['id', 'name', 'date', 'type']),
  user_history: new Set(['id', 'action', 'changed_at']),
  role_change_history: new Set(['id', 'effective_date', 'created_at']),
  audit_logs: new Set(['id', 'timestamp']),
  login_history: new Set(['id', 'login_time', 'created_at']),
};

export function applySearchFilter(query: string, queryParams: any[], collection: string, search: string | null): string {
  if (!search || search.trim().length === 0) return query;
  const sanitized = search.trim();
  if (collection === 'head_office' || collection === 'head_offices') {
    query += ` AND (name LIKE ? OR code LIKE ? OR city LIKE ? OR state LIKE ?)`;
    queryParams.push(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
  } else if (collection === 'users') {
    query += ` AND (full_name LIKE ? OR emp_code LIKE ? OR mobile LIKE ?)`;
    queryParams.push(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
  } else if (collection === 'stockists') {
    query += ` AND (firm_name LIKE ? OR stockist_name LIKE ? OR contact_person LIKE ?)`;
    queryParams.push(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
  } else if (collection === 'chemists') {
    query += ` AND (shop_name LIKE ? OR chemist_name LIKE ? OR contact_person LIKE ?)`;
    queryParams.push(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
  } else if (collection === 'doctors') {
    query += ` AND (name LIKE ? OR dr_code LIKE ? OR clinic_address LIKE ?)`;
    queryParams.push(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
  } else if (collection === 'employees') {
    query += ` AND (first_name LIKE ? OR last_name LIKE ? OR emp_code LIKE ? OR mobile LIKE ?)`;
    queryParams.push(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
  } else {
    query += ` AND name LIKE ?`;
    queryParams.push(`%${sanitized}%`);
  }
  return query;
}

export function applySortingAndPagination(query: string, queryParams: any[], collection: string, url: URL): string {
  const sortBy = url.searchParams.get('sortBy') || url.searchParams.get('orderBy');
  const sortDir = (url.searchParams.get('sortDir') || url.searchParams.get('order') || 'ASC').toUpperCase();
  const cleanDir = sortDir === 'DESC' ? 'DESC' : 'ASC';

  if (sortBy) {
    const allowedCols = ALLOWED_SORT_COLUMNS[collection] || new Set(['id', 'created_at', 'name']);
    if (allowedCols.has(sortBy)) {
      query += ` ORDER BY ${sortBy} ${cleanDir}`;
    } else {
      query += ` ORDER BY id ${cleanDir}`;
    }
  }

  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');

  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    const safeLimit = isNaN(parsedLimit) || parsedLimit <= 0 ? 50 : Math.min(parsedLimit, 500);
    query += ` LIMIT ?`;
    queryParams.push(safeLimit);

    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam, 10);
      const safeOffset = isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;
      query += ` OFFSET ?`;
      queryParams.push(safeOffset);
    }
  }

  return query;
}
