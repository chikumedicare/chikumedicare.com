import { z } from 'zod';
import { baseEntity } from './base';

export const DoctorSchema = baseEntity.extend({
  name: z.string().min(1),
  dr_code: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  speciality: z.string().optional().nullable(),
  category: z.string().optional().default('B'),
  hq_id: z.string().min(1),
  area_id: z.string().min(1),
  beat_id: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  clinic_address: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  anniversary_date: z.string().optional().nullable(),
  visit_frequency: z.number().optional().default(1),
});

export const ChemistStockistSchema = baseEntity.extend({
  shop_name: z.string().min(1).optional(),
  firm_name: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  owner_name: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  hq_id: z.string().min(1),
  area_id: z.string().min(1),
  beat_id: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
  drug_license_number: z.string().optional().nullable(),
});

export const ProductSchema = baseEntity.extend({
  name: z.string().min(1),
  product_code: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  pack_size: z.string().optional().nullable(),
  mrp: z.number(),
  pts: z.number().optional().nullable(),
  ptr: z.number().optional().nullable(),
  gst_percent: z.number().optional().nullable(),
});
