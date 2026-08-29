import type { SfaUser, SfaRole } from '../../core/domain/hr/user.types';

export function mapUserFromDb(row: Record<string, unknown>): SfaUser {
  if (!row) return {} as SfaUser;
  return {
    id: String(row.id || ''),
    userId: String(row.user_id || row.userId || row.emp_code || ''),
    empCode: String(row.emp_code || row.empCode || ''),
    fullName: String(row.full_name || row.fullName || ''),
    role: (row.role || 'MR') as SfaRole,
    mobile: String(row.mobile || ''),
    email: String(row.email || ''),
    designation: String(row.designation || ''),
    hqId: String(row.hq_id || row.hqId || ''),
    hqName: String(row.hq_name || row.hqName || ''),
    divisionId: String(row.division_id || row.divisionId || ''),
    reportsToId: String(row.reports_to_id || row.reportsToId || row.manager_id || ''),
    reportingToName: String(row.reports_to_name || row.reportsToName || ''),
    joiningDate: String(row.joining_date || row.joiningDate || ''),
    isActive: row.is_active === 1 || row.is_active === true || row.isActive === true,
    coveringHqIds: typeof row.covering_hq_ids === 'string'
      ? JSON.parse(row.covering_hq_ids || '[]')
      : ((row.coveringHqIds as string[]) || []),
    areaIds: typeof row.area_ids === 'string'
      ? JSON.parse(row.area_ids || '[]')
      : ((row.areaIds as string[]) || []),
    createdAt: String(row.created_at || row.createdAt || ''),
    updatedAt: String(row.updated_at || row.updatedAt || ''),
  };
}

export function mapUserToDb(user: Partial<SfaUser>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (user.userId !== undefined) payload.user_id = user.userId;
  if (user.empCode !== undefined) payload.emp_code = user.empCode;
  if (user.fullName !== undefined) payload.full_name = user.fullName;
  if (user.role !== undefined) payload.role = user.role;
  if (user.mobile !== undefined) payload.mobile = user.mobile;
  if (user.email !== undefined) payload.email = user.email;
  if (user.designation !== undefined) payload.designation = user.designation;
  if (user.hqId !== undefined) payload.hq_id = user.hqId;
  if (user.divisionId !== undefined) payload.division_id = user.divisionId;
  if (user.reportsToId !== undefined) payload.reports_to_id = user.reportsToId;
  if (user.joiningDate !== undefined) payload.joining_date = user.joiningDate;
  if (user.isActive !== undefined) payload.is_active = user.isActive ? 1 : 0;
  if (user.coveringHqIds !== undefined) payload.covering_hq_ids = JSON.stringify(user.coveringHqIds);
  if (user.areaIds !== undefined) payload.area_ids = JSON.stringify(user.areaIds);
  return payload;
}
