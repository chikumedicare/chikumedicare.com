import * as jose from 'jose';
import { Env, AuthUser } from '../types';
import { ALLOWED_TABLES } from '../utils/constants';
import { UserRepository } from '../repositories/UserRepository';

export async function getAuthUser(request: Request, env: Env): Promise<AuthUser | null> {
  const auth = request.headers.get('Authorization');
  if (!auth) return null;
  try {
    const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
    const parts = auth.split(' ');
    const token = parts.length === 2 ? parts[1] : auth;
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);

    const userId = (payload as any).userId || (payload as any).id;
    if (!userId) return null;

    // Strict Security Rule 1: Always verify user exists in live D1 database and is active
    const userRepo = new UserRepository(env);
    const liveUser: any = (await userRepo.findByUserId(userId)) || (await userRepo.findById(userId));

    if (!liveUser) {
      console.warn(`[Auth Security] Rejecting token: User ${userId} no longer exists in D1 database.`);
      return null;
    }

    if (liveUser.is_active === 0 || liveUser.status === 'INACTIVE' || liveUser.status === 'TERMINATED' || liveUser.status === 'RESIGNED') {
      console.warn(`[Auth Security] Rejecting token: User ${userId} is inactive or deleted.`);
      return null;
    }

    // Strict Security Rule 2: Verify server-side session in D1 if sessionId exists in token
    const sessionId = (payload as any).sessionId;
    if (sessionId) {
      const session: any = await env.chikusfa_db
        .prepare('SELECT is_revoked, expires_at FROM user_sessions WHERE id = ?')
        .bind(sessionId)
        .first();

      if (!session || session.is_revoked === 1 || new Date(session.expires_at) < new Date()) {
        console.warn(`[Auth Security] Rejecting token: Session ${sessionId} is revoked or expired.`);
        return null;
      }
    }

    return {
      ...payload,
      id: String(liveUser.id),
      userId: liveUser.user_id,
      role: liveUser.role,
      fullName: liveUser.full_name,
      hqId: liveUser.hq_id || null,
      reportsToId: liveUser.reports_to_id || null,
    } as unknown as AuthUser;
  } catch (e) {
    return null;
  }
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['ALL_ACCESS'],
  ADMIN: ['ALL_ACCESS'],
  VP: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'APPLY_LEAVES', 'MANAGE_EXPENSES'],
  NSM: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'APPLY_LEAVES', 'MANAGE_EXPENSES'],
  ZSM: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'APPLY_LEAVES', 'MANAGE_EXPENSES'],
  RSM: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'APPLY_LEAVES', 'MANAGE_EXPENSES'],
  ASM: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'APPLY_LEAVES', 'MANAGE_EXPENSES'],
  MR: ['MANAGE_CUSTOMERS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'APPLY_LEAVES', 'MANAGE_EXPENSES'],
};

export async function hasPermission(userId: string, userRole: string, permission: string, env: Env): Promise<boolean> {
  const allowed = ROLE_PERMISSIONS[userRole] || [];
  return allowed.includes('ALL_ACCESS') || allowed.includes(permission);
}

export function getRequiredPermission(collection: string): string | null {
  if (['doctors', 'chemists', 'stockists'].includes(collection)) return 'MANAGE_CUSTOMERS';
  if (['products'].includes(collection)) return 'MANAGE_PRODUCTS';
  if (['sales_targets', 'targets'].includes(collection)) return 'MANAGE_TARGETS';
  if (['dcr_entries', 'calls'].includes(collection)) return 'MANAGE_DCR';
  if (['tour_plans'].includes(collection)) return 'MANAGE_TOUR_PLANS';
  if (['leave_applications'].includes(collection)) return 'APPLY_LEAVES';
  if (['leave_allocations'].includes(collection)) return 'MANAGE_LEAVE_ALLOCATIONS';
  if (['expenses'].includes(collection)) return 'MANAGE_EXPENSES';
  if (['sfc_rates', 'da_rates'].includes(collection)) return 'MANAGE_COMPENSATION';
  if (['payroll'].includes(collection)) return 'MANAGE_PAYROLL';
  if (['loans'].includes(collection)) return 'MANAGE_LOANS';
  if (['employees'].includes(collection)) return 'MANAGE_EMPLOYEES';
  if (['users'].includes(collection)) return 'MANAGE_USERS';
  if (['zones', 'states', 'hqs', 'areas', 'beats', 'divisions', 'head_office', 'user_covering_hq', 'user_covering_area'].includes(collection)) return 'MANAGE_GEOGRAPHY';
  if (['user_history', 'role_change_history', 'audit_logs', 'login_history', 'system_sequences'].includes(collection)) return 'IMMUTABLE_LOGS';
  return null;
}

