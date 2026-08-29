import { z } from 'zod';
import { baseEntity } from './base';

export const UserSchema = baseEntity.extend({
  user_id: z.string().min(1),
  full_name: z.string().min(1),
  mobile: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  role: z.string().min(1),
  designation: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  division_id: z.string().optional().nullable(),
  joining_date: z.string().optional().nullable(),
  hq_id: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  covering_hq_ids: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  area_ids: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  reports_to_ids: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  reports_to_id: z.string().optional().nullable(),
  emp_code: z.string().min(1, "Employee code is required"),
  manager_id: z.string().optional().nullable(),
  asm_id: z.string().optional().nullable(),
  rsm_id: z.string().optional().nullable(),
  zsm_id: z.string().optional().nullable(),
  vp_id: z.string().optional().nullable(),
  admin_id: z.string().optional().nullable(),
  hierarchy_status: z.string().optional().default('ACTIVE'),
  password_hash: z.string().optional().nullable(),
  primary_zone_id: z.string().optional().nullable(),
  primary_state_id: z.string().optional().nullable(),
  primary_area_id: z.string().optional().nullable()
});

export const UserHistorySchema = baseEntity.extend({
  user_id: z.string().min(1, 'user_id is required'),
  action: z.string().min(1, 'action is required'),
  old_data: z.string().optional().nullable(),
  new_data: z.string().optional().nullable(),
  changed_by: z.string().optional().nullable(),
  changed_at: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const RoleChangeHistorySchema = baseEntity.extend({
  user_id: z.string().min(1, 'user_id is required'),
  previous_role: z.string().optional().nullable(),
  new_role: z.string().min(1, 'new_role is required'),
  effective_date: z.string().optional().nullable(),
  changed_by: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const UserRoleSchema = baseEntity.extend({
  user_id: z.string().min(1, 'user_id is required'),
  role: z.string().min(1, 'role is required'),
  assigned_by: z.string().optional().nullable(),
  assigned_at: z.string().optional().nullable(),
  is_active: z.union([z.boolean(), z.number()]).transform(v => (v === true || v === 1 ? 1 : 0)).optional().default(1),
});
