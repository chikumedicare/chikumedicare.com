import { z } from 'zod';
import { baseEntity } from './base';

export const HeadOfficeSchema = baseEntity.extend({
  company_name: z.string().min(1, 'Company Name is required').transform(val => val.trim()),
  brand_name: z.string().optional().nullable(),
  cin_number: z.string().optional().nullable(),
  pan_number: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  drug_license_no_20b: z.string().optional().nullable(),
  drug_license_no_21b: z.string().optional().nullable(),
  fssai_license_no: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(),
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state_name: z.string().optional().nullable(),
  pin_code: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  helpline_number: z.string().optional().nullable(),
  active_financial_year: z.string().optional().default('2026-27'),
  working_days_per_month: z.number().optional().default(26),
  updated_at: z.string().optional().nullable(),
  updated_by: z.string().optional().nullable(),
});

export const DivisionSchema = baseEntity.extend({
  name: z.string().min(1, 'Division Name is required').transform(val => val.trim()),
  div_code: z.string().optional().nullable().transform(val => val ? val.trim().toUpperCase() : null),
  head_office_id: z.string().optional().nullable(),
  head_user_id: z.string().optional().nullable(),
  head_user_name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  display_order: z.number().optional().default(0),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  updated_by: z.string().optional().nullable(),
});
