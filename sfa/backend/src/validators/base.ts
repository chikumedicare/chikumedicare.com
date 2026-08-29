import { z } from 'zod';

export const baseEntity = z.object({
  id: z.string().optional(),
  is_active: z.union([z.boolean(), z.number()]).transform(v => (v === true || v === 1 ? 1 : 0)).optional().default(1),
  created_at: z.string().optional(),
});
