import { Env } from '../types';

export function getCurrentFY(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan, 3 = Apr
  if (month >= 3) {
    return `${year}-${String(year + 1).slice(2)}`;
  } else {
    return `${year - 1}-${String(year).slice(2)}`;
  }
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export const parseArrayField = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : []; }
    catch { return val.split(',').map((s: string) => s.trim()).filter(Boolean); }
  }
  return [];
};

const ENTITY_CODE_MAP: Record<string, { codeField: string; prefix: string; padding: number }> = {
  zones: { codeField: 'zone_code', prefix: 'ZN', padding: 3 },
  states: { codeField: 'state_code', prefix: 'ST', padding: 3 },
  hqs: { codeField: 'hq_code', prefix: 'HQ', padding: 3 },
  areas: { codeField: 'area_code', prefix: 'AR', padding: 3 },
  beats: { codeField: 'beat_code', prefix: 'BT', padding: 3 },
  doctors: { codeField: 'dr_code', prefix: 'DR', padding: 4 },
  chemists: { codeField: 'chemist_code', prefix: 'CH', padding: 4 },
  stockists: { codeField: 'stockist_code', prefix: 'SK', padding: 4 },
  products: { codeField: 'product_code', prefix: 'PR', padding: 4 },
  employees: { codeField: 'emp_code', prefix: 'EMP', padding: 3 },
  divisions: { codeField: 'div_code', prefix: 'DIV', padding: 2 },
};

export async function generateEntityCode(env: Env, collection: string, body: any, action: string) {
  const config = ENTITY_CODE_MAP[collection];
  if (!config) return;

  const { codeField, prefix, padding } = config;

  if (action === 'CREATE' && (!body[codeField] || typeof body[codeField] !== 'string' || body[codeField].trim() === '')) {
    let candidateCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 50) {
      attempts++;
      const updateResult: any = await env.chikusfa_db.prepare(`
        UPDATE entity_sequences 
        SET last_seq = last_seq + 1 
        WHERE entity_type = ? 
        RETURNING last_seq, prefix, padding
      `).bind(collection).first();

      const seq = updateResult?.last_seq || 1;
      const pref = updateResult?.prefix || prefix;
      const pad = updateResult?.padding || padding;
      candidateCode = `${pref}${String(seq).padStart(pad, '0')}`;

      const existing: any = await env.chikusfa_db.prepare(
        `SELECT id FROM ${collection} WHERE ${codeField} = ?`
      ).bind(candidateCode).first();

      if (!existing) {
        isUnique = true;
      }
    }

    body[codeField] = candidateCode;
  }
}

export async function logAudit(env: Env, params: { module: string, type: string, action: string, entityType: string, entityId: string, details: any, userId: string, userName: string, status?: string }) {
  const id = `al_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  await env.chikusfa_db.prepare(`
    INSERT INTO audit_logs (id, timestamp, module, type, status, message, user_id, user_name, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, new Date().toISOString(), params.module, params.type, params.status || 'SUCCESS', 
    `${params.action} on ${params.entityType} ${params.entityId}`, 
    params.userId, params.userName, params.action, params.entityType, params.entityId, 
    JSON.stringify(params.details)
  ).run();
}
