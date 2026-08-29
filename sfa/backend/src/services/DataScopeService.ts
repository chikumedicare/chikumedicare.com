import { Env, AuthUser } from '../types';

export interface UserDataScope {
  isUnrestricted: boolean;
  selfId: string;
  selfUserId: string;
  selfEmpCode: string | null;
  permittedHqIds: string[];
  permittedAreaIds: string[];
  permittedDivisionIds: string[];
  subordinateUserIds: string[];
  subordinateEmpCodes: string[];
  authorizedUserIds: string[];
  authorizedEmpCodes: string[];
}

export class DataScopeService {
  /**
   * Retrieves the authoritative data scope for the authenticated user from live D1 records.
   */
  static async getUserScope(env: Env, authUser: AuthUser): Promise<UserDataScope> {
    const selfId = String(authUser?.id || '');
    const selfUserId = String(authUser?.userId || authUser?.id || '');

    if (!authUser || !authUser.role) {
      return {
        isUnrestricted: false,
        selfId,
        selfUserId,
        selfEmpCode: null,
        permittedHqIds: [],
        permittedAreaIds: [],
        permittedDivisionIds: [],
        subordinateUserIds: [],
        subordinateEmpCodes: [],
        authorizedUserIds: [selfId, selfUserId].filter(Boolean),
        authorizedEmpCodes: [],
      };
    }

    if (authUser.role === 'OWNER' || authUser.role === 'ADMIN') {
      return {
        isUnrestricted: true,
        selfId,
        selfUserId,
        selfEmpCode: null,
        permittedHqIds: [],
        permittedAreaIds: [],
        permittedDivisionIds: [],
        subordinateUserIds: [],
        subordinateEmpCodes: [],
        authorizedUserIds: [selfId, selfUserId].filter(Boolean),
        authorizedEmpCodes: [],
      };
    }

    const permittedHqIds = new Set<string>();
    const permittedAreaIds = new Set<string>();
    const permittedDivisionIds = new Set<string>();
    const subordinateUserIds = new Set<string>();
    const subordinateEmpCodes = new Set<string>();
    let selfEmpCode: string | null = null;

    if (authUser.hqId) permittedHqIds.add(authUser.hqId);
    (authUser.coveringHqIds || []).forEach((id) => id && permittedHqIds.add(id));
    (authUser.areaIds || []).forEach((id) => id && permittedAreaIds.add(id));

    try {
      // 1. Fetch live user record to get authoritative emp_code, division_id, state/zone, and covering HQs
      const userRow: any = await env.chikusfa_db
        .prepare('SELECT emp_code, division_id, hq_id, covering_hq_ids, primary_state_id, primary_zone_id FROM users WHERE id = ? OR user_id = ?')
        .bind(selfId, selfUserId)
        .first();

      if (userRow) {
        if (userRow.emp_code) selfEmpCode = userRow.emp_code;
        if (userRow.division_id) permittedDivisionIds.add(userRow.division_id);
        if (userRow.hq_id) permittedHqIds.add(userRow.hq_id);
        if (userRow.covering_hq_ids) {
          try {
            const parsed = typeof userRow.covering_hq_ids === 'string' ? JSON.parse(userRow.covering_hq_ids) : userRow.covering_hq_ids;
            if (Array.isArray(parsed)) parsed.forEach((h) => h && permittedHqIds.add(h));
          } catch (e) {}
        }

        // Add HQs for state/zone assignments (RSM/ZSM/VP geographical authority)
        if (userRow.primary_state_id) {
          const { results: stateHqs } = await env.chikusfa_db
            .prepare('SELECT id FROM hqs WHERE state_id = ? AND is_active = 1')
            .bind(userRow.primary_state_id)
            .all();
          (stateHqs || []).forEach((r: any) => r.id && permittedHqIds.add(r.id));
        }

        if (userRow.primary_zone_id) {
          const { results: zoneHqs } = await env.chikusfa_db
            .prepare('SELECT h.id FROM hqs h JOIN states s ON h.state_id = s.id WHERE s.zone_id = ? AND h.is_active = 1')
            .bind(userRow.primary_zone_id)
            .all();
          (zoneHqs || []).forEach((r: any) => r.id && permittedHqIds.add(r.id));
        }
      }

      // 2. Fetch dynamic multi-HQ and Area assignments for self
      const { results: coveringHqs } = await env.chikusfa_db
        .prepare('SELECT hq_id FROM user_covering_hq WHERE (user_id = ? OR user_id = ?) AND (status = 1 OR status = ?)')
        .bind(selfId, selfUserId, 'ACTIVE')
        .all();
      (coveringHqs || []).forEach((row: any) => row.hq_id && permittedHqIds.add(row.hq_id));

      const { results: coveringAreas } = await env.chikusfa_db
        .prepare('SELECT area_id FROM user_covering_area WHERE (user_id = ? OR user_id = ?) AND (status = 1 OR status = ?)')
        .bind(selfId, selfUserId, 'ACTIVE')
        .all();
      (coveringAreas || []).forEach((row: any) => row.area_id && permittedAreaIds.add(row.area_id));

      // 3. Resolve Full Multi-Level Subordinate Hierarchy
      // Using precomputed role columns (vp_id, zsm_id, rsm_id, asm_id) and explicit reporting chains
      let hierarchyFilter = '(manager_id = ? OR manager_id = ? OR reports_to_id = ? OR reports_to_id = ?)';
      const hierarchyParams: any[] = [selfId, selfUserId, selfId, selfUserId];

      if (authUser.role === 'VP') {
        hierarchyFilter += ' OR (vp_id = ? OR vp_id = ?)';
        hierarchyParams.push(selfId, selfUserId);
      } else if (authUser.role === 'ZSM') {
        hierarchyFilter += ' OR (zsm_id = ? OR zsm_id = ?)';
        hierarchyParams.push(selfId, selfUserId);
      } else if (authUser.role === 'RSM') {
        hierarchyFilter += ' OR (rsm_id = ? OR rsm_id = ?)';
        hierarchyParams.push(selfId, selfUserId);
      } else if (authUser.role === 'ASM') {
        hierarchyFilter += ' OR (asm_id = ? OR asm_id = ?)';
        hierarchyParams.push(selfId, selfUserId);
      }

      const { results: subordinates } = await env.chikusfa_db
        .prepare(`SELECT id, user_id, emp_code, hq_id, covering_hq_ids, division_id FROM users WHERE ${hierarchyFilter}`)
        .bind(...hierarchyParams)
        .all();

      const directSubs = subordinates || [];
      directSubs.forEach((row: any) => {
        if (row.id && row.id !== selfId) subordinateUserIds.add(row.id);
        if (row.user_id && row.user_id !== selfUserId) subordinateUserIds.add(row.user_id);
        if (row.emp_code) subordinateEmpCodes.add(row.emp_code);
        if (row.hq_id) permittedHqIds.add(row.hq_id);
        if (row.division_id) permittedDivisionIds.add(row.division_id);
        if (row.covering_hq_ids) {
          try {
            const parsed = typeof row.covering_hq_ids === 'string' ? JSON.parse(row.covering_hq_ids) : row.covering_hq_ids;
            if (Array.isArray(parsed)) parsed.forEach((h) => h && permittedHqIds.add(h));
          } catch (e) {}
        }
      });

      // 4. Multi-hop recursive check for deeper reporting lines if any
      let currentLevelIds = Array.from(subordinateUserIds);
      let depth = 0;
      while (currentLevelIds.length > 0 && depth < 5) {
        depth++;
        const placeholders = currentLevelIds.map(() => '?').join(',');
        const { results: nextLevel } = await env.chikusfa_db
          .prepare(`SELECT id, user_id, emp_code, hq_id, covering_hq_ids, division_id FROM users WHERE (manager_id IN (${placeholders}) OR reports_to_id IN (${placeholders}))`)
          .bind(...currentLevelIds, ...currentLevelIds)
          .all();

        const newIds: string[] = [];
        (nextLevel || []).forEach((row: any) => {
          if (row.id && !subordinateUserIds.has(row.id) && row.id !== selfId) {
            subordinateUserIds.add(row.id);
            newIds.push(row.id);
          }
          if (row.user_id && !subordinateUserIds.has(row.user_id) && row.user_id !== selfUserId) {
            subordinateUserIds.add(row.user_id);
            newIds.push(row.user_id);
          }
          if (row.emp_code) subordinateEmpCodes.add(row.emp_code);
          if (row.hq_id) permittedHqIds.add(row.hq_id);
          if (row.division_id) permittedDivisionIds.add(row.division_id);
          if (row.covering_hq_ids) {
            try {
              const parsed = typeof row.covering_hq_ids === 'string' ? JSON.parse(row.covering_hq_ids) : row.covering_hq_ids;
              if (Array.isArray(parsed)) parsed.forEach((h) => h && permittedHqIds.add(h));
            } catch (e) {}
          }
        });
        currentLevelIds = newIds;
      }
    } catch (e) {
      console.warn('[DataScopeService] Error resolving user scope:', e);
    }

    const authorizedUserIds = Array.from(
      new Set([selfId, selfUserId, ...Array.from(subordinateUserIds)].filter(Boolean))
    );
    const authorizedEmpCodes = Array.from(
      new Set([selfEmpCode, ...Array.from(subordinateEmpCodes)].filter(Boolean) as string[])
    );

    return {
      isUnrestricted: false,
      selfId,
      selfUserId,
      selfEmpCode,
      permittedHqIds: Array.from(permittedHqIds),
      permittedAreaIds: Array.from(permittedAreaIds),
      permittedDivisionIds: Array.from(permittedDivisionIds),
      subordinateUserIds: Array.from(subordinateUserIds),
      subordinateEmpCodes: Array.from(subordinateEmpCodes),
      authorizedUserIds,
      authorizedEmpCodes,
    };
  }

  /**
   * Applies the strict intersection rule: Client filter can ONLY NARROW authorized scope, NEVER EXPAND it.
   */
  static evaluateHqScope(
    permittedHqIds: string[],
    clientHqId?: string | null,
    clientHqIdsParam?: string | null
  ): { targetHqIds: string[]; isEarlyReturnEmpty: boolean } {
    if (permittedHqIds.length === 0) {
      return { targetHqIds: [], isEarlyReturnEmpty: true };
    }

    // Case 1: Multiple HQs requested by client
    if (clientHqIdsParam && clientHqIdsParam.trim().length > 0) {
      const requestedIds = clientHqIdsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const intersection = requestedIds.filter((id) => permittedHqIds.includes(id));
      if (intersection.length === 0) {
        return { targetHqIds: [], isEarlyReturnEmpty: true };
      }
      return { targetHqIds: intersection, isEarlyReturnEmpty: false };
    }

    // Case 2: Single HQ requested by client
    if (clientHqId && clientHqId.trim().length > 0) {
      const cleanHq = clientHqId.trim();
      if (!permittedHqIds.includes(cleanHq)) {
        return { targetHqIds: [], isEarlyReturnEmpty: true };
      }
      return { targetHqIds: [cleanHq], isEarlyReturnEmpty: false };
    }

    // Case 3: No filter requested by client -> Default to entire permitted scope
    return { targetHqIds: permittedHqIds, isEarlyReturnEmpty: false };
  }

  /**
   * Evaluates whether a user is authorized to read or mutate a single resource entity.
   */
  static canAccessResource(
    collection: string,
    entity: Record<string, any>,
    authUser: AuthUser,
    scope: UserDataScope
  ): boolean {
    if (scope.isUnrestricted) return true;

    // 1. Employee entities
    if (collection === 'employees') {
      const empCode = entity.emp_code;
      if (empCode && scope.authorizedEmpCodes.includes(empCode)) return true;
      if (entity.id && scope.authorizedUserIds.includes(entity.id)) return true;
      return false;
    }

    // 2. User entities
    if (collection === 'users') {
      const id = entity.id;
      const uId = entity.user_id;
      const empCode = entity.emp_code;
      if (id && scope.authorizedUserIds.includes(id)) return true;
      if (uId && scope.authorizedUserIds.includes(uId)) return true;
      if (empCode && scope.authorizedEmpCodes.includes(empCode)) return true;
      if (entity.hq_id && scope.permittedHqIds.includes(entity.hq_id)) return true;
      return false;
    }

    // 3. Leave records (applications & allocations)
    if (collection === 'leave_applications' || collection === 'leave_allocations') {
      const empId = entity.employee_id;
      if (empId && (scope.authorizedUserIds.includes(empId) || scope.authorizedEmpCodes.includes(empId))) return true;
      if (entity.hq_id && scope.permittedHqIds.includes(entity.hq_id)) return true;
      return false;
    }

    // 4. Financial & compensation records (expenses, payroll, loans)
    if (['expenses', 'payroll', 'loans'].includes(collection)) {
      const empId = entity.employee_id;
      if (empId && (scope.authorizedUserIds.includes(empId) || scope.authorizedEmpCodes.includes(empId))) return true;
      return false;
    }

    // 5. User-level histories and assignments
    if (['user_history', 'role_change_history', 'user_covering_hq', 'user_covering_area', 'audit_logs', 'login_history'].includes(collection)) {
      const uId = entity.user_id;
      if (uId && scope.authorizedUserIds.includes(uId)) return true;
      return false;
    }

    // 6. Approvals
    if (collection === 'approvals') {
      const isMgr = entity.manager_id && scope.authorizedUserIds.includes(entity.manager_id);
      const isReq = entity.requested_by && scope.authorizedUserIds.includes(entity.requested_by);
      const isHq = entity.requester_hq_id && scope.permittedHqIds.includes(entity.requester_hq_id);
      return Boolean(isMgr || isReq || isHq);
    }

    // 7. Territory-mapped commercial tables
    const hqCol = entity.hq_id ? 'hq_id' : entity.employee_hq_id ? 'employee_hq_id' : entity.target_hq_id ? 'target_hq_id' : null;
    if (hqCol && entity[hqCol]) {
      return scope.permittedHqIds.includes(entity[hqCol]);
    }

    // 8. User-owned activity logs / submissions
    const userCol = entity.user_id ? 'user_id' : entity.employee_id ? 'employee_id' : null;
    if (userCol && entity[userCol]) {
      return scope.authorizedUserIds.includes(entity[userCol]) || scope.authorizedEmpCodes.includes(entity[userCol]);
    }

    return true;
  }
}

