import { Env } from '../types';
import { HierarchyRepository } from '../repositories/HierarchyRepository';

export const ROLE_HIERARCHY_LEVEL: Record<string, number> = {
  OWNER: 7,
  ADMIN: 7,
  VP: 6,
  NSM: 5,
  ZSM: 4,
  RSM: 3,
  ASM: 2,
  SR_ASM: 2,
  MR: 1,
};

export class HierarchyService {
  /**
   * Validates manager assignments to prevent self-reporting, junior-senior inversions,
   * inactive/non-existent managers, and circular reporting chains.
   */
  static async validateReportingIntegrity(
    env: Env,
    userId: string,
    userRole: string,
    reportsToId?: string | null,
    reportsToIds?: string[] | string | null
  ): Promise<void> {
    const candidateManagerIds: string[] = [];

    if (reportsToId && typeof reportsToId === 'string' && reportsToId.trim().length > 0) {
      candidateManagerIds.push(reportsToId.trim());
    }

    if (reportsToIds) {
      let parsedIds: string[] = [];
      if (typeof reportsToIds === 'string') {
        try {
          const parsed = JSON.parse(reportsToIds);
          if (Array.isArray(parsed)) parsedIds = parsed;
        } catch (e) {
          parsedIds = reportsToIds.split(',').map((s) => s.trim());
        }
      } else if (Array.isArray(reportsToIds)) {
        parsedIds = reportsToIds;
      }
      parsedIds.forEach((id) => {
        if (id && typeof id === 'string' && id.trim().length > 0 && !candidateManagerIds.includes(id.trim())) {
          candidateManagerIds.push(id.trim());
        }
      });
    }

    if (candidateManagerIds.length === 0) return;

    // 1. Self-reporting check
    for (const mgrId of candidateManagerIds) {
      if (mgrId === userId) {
        throw new Error('400 Bad Request: Hierarchy integrity violation — A user cannot report to themselves.');
      }
    }

    const subLevel = ROLE_HIERARCHY_LEVEL[userRole] || 1;

    // 2. Fetch candidate managers and check existence, active status, role rank, and circularity
    for (const mgrId of candidateManagerIds) {
      const mgr: any = await env.chikusfa_db
        .prepare('SELECT id, user_id, full_name, role, is_active, status, reports_to_id, manager_id FROM users WHERE id = ? OR user_id = ?')
        .bind(mgrId, mgrId)
        .first();

      if (!mgr) {
        throw new Error(`400 Bad Request: Hierarchy integrity violation — Designated manager '${mgrId}' does not exist.`);
      }

      if (mgr.is_active === 0 || mgr.status === 'INACTIVE' || mgr.status === 'TERMINATED' || mgr.status === 'RESIGNED') {
        throw new Error(`400 Bad Request: Hierarchy integrity violation — Designated manager '${mgr.full_name || mgrId}' is inactive or deleted.`);
      }

      const mgrLevel = ROLE_HIERARCHY_LEVEL[mgr.role] || 1;

      // Junior cannot be manager of a senior rank
      if (mgrLevel < subLevel) {
        throw new Error(
          `400 Bad Request: Hierarchy integrity violation — A user with role '${userRole}' cannot report to a junior rank '${mgr.role}'.`
        );
      }

      // 3. Circular Loop Detection
      let currentMgrId = mgr.reports_to_id || mgr.manager_id;
      const visited = new Set<string>([userId, mgr.id, mgr.user_id]);
      let steps = 0;

      while (currentMgrId && steps < 20) {
        steps++;
        if (currentMgrId === userId || currentMgrId === mgrId) {
          throw new Error(
            '400 Bad Request: Hierarchy integrity violation — Circular reporting chain detected. Setting this manager creates an infinite reporting loop.'
          );
        }
        if (visited.has(currentMgrId)) {
          break;
        }
        visited.add(currentMgrId);

        const nextMgr: any = await env.chikusfa_db
          .prepare('SELECT reports_to_id, manager_id FROM users WHERE id = ? OR user_id = ?')
          .bind(currentMgrId, currentMgrId)
          .first();

        currentMgrId = nextMgr ? (nextMgr.reports_to_id || nextMgr.manager_id) : null;
      }
    }
  }

  static async rebuildHierarchyStatements(env: Env): Promise<any[]> {
    const repo = new HierarchyRepository(env);

    const usersData = await repo.getAllActiveUsers();
    const hqsData = await repo.getAllActiveHqs();
    const statesData = await repo.getAllActiveStates();
    const zonesData = await repo.getAllActiveZones();

    const userMap = new Map<string, any>(usersData.map((u) => [u.id, u]));
    const hqMap = new Map<string, any>(hqsData.map((h) => [String(h.id), h]));
    const stateMap = new Map<string, any>(statesData.map((s) => [String(s.id), s]));
    const zoneMap = new Map<string, any>(zonesData.map((z) => [String(z.id), z]));

    const stmts: any[] = [];
    const processUser = (user: any) => {
      let manager_id = null;
      let asm_id = null;
      let rsm_id = null;
      let zsm_id = null;
      let vp_id = null;
      let admin_id = null;

      let explicitManager = null;
      if (user.reports_to_id && user.reports_to_id !== user.id) {
        explicitManager = userMap.get(user.reports_to_id);
      } else if (user.reports_to_ids && user.reports_to_ids !== '[]') {
        try {
          const managers = JSON.parse(user.reports_to_ids);
          if (managers.length > 0 && managers[0] !== user.id) {
            explicitManager = userMap.get(managers[0]);
          }
        } catch (e) {
          console.error(`[Hierarchy] Failed to parse reports_to_ids for user ${user.id}:`, e);
        }
      }

      if (explicitManager) {
        manager_id = explicitManager.id;
        asm_id = explicitManager.role === 'ASM' ? explicitManager.id : explicitManager.asm_id;
        rsm_id = explicitManager.role === 'RSM' ? explicitManager.id : explicitManager.rsm_id;
        zsm_id = explicitManager.role === 'ZSM' ? explicitManager.id : explicitManager.zsm_id;
        vp_id = explicitManager.role === 'VP' ? explicitManager.id : explicitManager.vp_id;
        admin_id = explicitManager.role === 'ADMIN' ? explicitManager.id : explicitManager.admin_id;
      } else {
        if (user.role === 'MR' && user.hq_id) {
          const asm = usersData.find((u) => u.role === 'ASM' && (u.hq_id === user.hq_id || (u.covering_hq_ids && u.covering_hq_ids.includes(user.hq_id))));
          if (asm) {
            manager_id = asm.id;
            asm_id = asm.id;
            rsm_id = asm.rsm_id;
            zsm_id = asm.zsm_id;
            vp_id = asm.vp_id;
            admin_id = asm.admin_id;
          } else {
            const rsm = usersData.find((u) => u.role === 'RSM' && (u.hq_id === user.hq_id || (u.covering_hq_ids && u.covering_hq_ids.includes(user.hq_id))));
            if (rsm) {
              manager_id = rsm.id;
              rsm_id = rsm.id;
              zsm_id = rsm.zsm_id;
              vp_id = rsm.vp_id;
              admin_id = rsm.admin_id;
            }
          }
        } else if (user.role === 'ASM' && user.hq_id) {
          const rsm = usersData.find((u) => u.role === 'RSM' && (u.hq_id === user.hq_id || (u.covering_hq_ids && u.covering_hq_ids.includes(user.hq_id))));
          if (rsm) {
            manager_id = rsm.id;
            rsm_id = rsm.id;
            zsm_id = rsm.zsm_id;
            vp_id = rsm.vp_id;
            admin_id = rsm.admin_id;
          }
        } else if (user.role === 'RSM' && user.hq_id) {
          const hq = hqMap.get(user.hq_id);
          if (hq && hq.state_id) {
            const state = stateMap.get(hq.state_id);
            if (state && state.zone_id) {
              const zone = zoneMap.get(state.zone_id);
              if (zone && zone.head_user_id) {
                const zsm = userMap.get(zone.head_user_id);
                if (zsm) {
                  manager_id = zsm.id;
                  zsm_id = zsm.id;
                  vp_id = zsm.vp_id;
                  admin_id = zsm.admin_id;
                }
              }
            }
          }
        }

        if (!manager_id) {
          const admin = usersData.find((u) => u.role === 'ADMIN');
          if (admin) {
            manager_id = admin.id;
            admin_id = admin.id;
          }
        }
      }

      if (user.role === 'ASM') asm_id = user.id;
      if (user.role === 'RSM') rsm_id = user.id;
      if (user.role === 'ZSM') zsm_id = user.id;
      if (user.role === 'VP') vp_id = user.id;
      if (user.role === 'OWNER') admin_id = user.id;

      const status = manager_id ? 'ACTIVE' : 'VACANT';

      stmts.push(repo.getUpdateManagerHierarchyStmt(manager_id, asm_id, rsm_id, zsm_id, vp_id, admin_id, status, user.id));
    };

    for (const u of usersData) {
      processUser(u);
    }

    return stmts;
  }
}


