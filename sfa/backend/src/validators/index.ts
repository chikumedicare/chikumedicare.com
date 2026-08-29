import { z } from 'zod';
import { UserSchema, UserHistorySchema, RoleChangeHistorySchema, UserRoleSchema } from './user';
import { EmployeeSchema } from './employee';
import { DoctorSchema, ChemistStockistSchema, ProductSchema } from './field';
import { HqSchema, AreaSchema, BeatSchema, StateSchema, ZoneSchema } from './geography';
import { SalesTargetSchema, SalesEntrySchema, LeaveAllocationSchema, DaRateSchema, SfcRateSchema, LeaveApplicationSchema, DcrEntrySchema } from './transaction';
import { HeadOfficeSchema, DivisionSchema } from './headOffice';

export {
  UserSchema,
  UserHistorySchema,
  RoleChangeHistorySchema,
  UserRoleSchema,
  EmployeeSchema,
  DoctorSchema,
  ChemistStockistSchema,
  ProductSchema,
  HqSchema,
  AreaSchema,
  BeatSchema,
  StateSchema,
  ZoneSchema,
  SalesTargetSchema,
  SalesEntrySchema,
  LeaveAllocationSchema,
  DaRateSchema,
  SfcRateSchema,
  LeaveApplicationSchema,
  DcrEntrySchema,
  HeadOfficeSchema,
  DivisionSchema,
};

const SCHEMAS: Record<string, z.ZodSchema> = {
  users: UserSchema,
  employees: EmployeeSchema,
  doctors: DoctorSchema,
  chemists: ChemistStockistSchema,
  stockists: ChemistStockistSchema,
  products: ProductSchema,
  hqs: HqSchema,
  areas: AreaSchema,
  beats: BeatSchema,
  states: StateSchema,
  zones: ZoneSchema,
  sales_targets: SalesTargetSchema,
  sales_entries: SalesEntrySchema,
  leave_allocations: LeaveAllocationSchema,
  da_rates: DaRateSchema,
  sfc_rates: SfcRateSchema,
  leave_applications: LeaveApplicationSchema,
  dcr_entries: DcrEntrySchema,
  user_history: UserHistorySchema,
  role_change_history: RoleChangeHistorySchema,
  head_office: HeadOfficeSchema,
  divisions: DivisionSchema,
};

type ValidationResult = 
  | { success: true; data: Record<string, any> }
  | { success: false; error: string };

export function validatePayload(collection: string, payload: any, action: 'CREATE' | 'UPDATE' = 'CREATE'): ValidationResult {
  let schema = SCHEMAS[collection];
  if (!schema) {
    return { success: false, error: `Validation Error: Strict mode enabled. Direct mutation of unmapped table '${collection}' is forbidden.` };
  }

  if (action === 'UPDATE' && (schema as any).partial) {
    schema = (schema as any).partial();
  }

  const processed = { ...payload };
  if (typeof processed.covering_hq_ids === 'string' && processed.covering_hq_ids.startsWith('[')) {
    try { processed.covering_hq_ids = JSON.parse(processed.covering_hq_ids); } catch (e) {}
  }
  if (typeof processed.area_ids === 'string' && processed.area_ids.startsWith('[')) {
    try { processed.area_ids = JSON.parse(processed.area_ids); } catch (e) {}
  }
  if (typeof processed.reports_to_ids === 'string' && processed.reports_to_ids.startsWith('[')) {
    try { processed.reports_to_ids = JSON.parse(processed.reports_to_ids); } catch (e) {}
  }

  const result = schema.safeParse(processed);
  if (!result.success) {
    const issues = result.error.issues || (result.error as any).errors || [];
    return { success: false, error: `Validation Error: ${issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}` };
  }

  return { success: true, data: result.data as Record<string, any> };
}
