import { Env } from '../types';
import { BaseRepository } from './BaseRepository';

export class HierarchyRepository extends BaseRepository {
  constructor(env: Env) {
    super(env, 'users');
  }

  async getAllActiveUsers() {
    const data = await this.env.chikusfa_db.prepare(`SELECT * FROM users WHERE is_active = 1`).all();
    return data.results as any[];
  }

  async getAllActiveHqs() {
    const data = await this.env.chikusfa_db.prepare(`SELECT * FROM hqs WHERE is_active = 1`).all();
    return data.results as any[];
  }

  async getAllActiveStates() {
    const data = await this.env.chikusfa_db.prepare(`SELECT * FROM states WHERE is_active = 1`).all();
    return data.results as any[];
  }

  async getAllActiveZones() {
    const data = await this.env.chikusfa_db.prepare(`SELECT * FROM zones WHERE is_active = 1`).all();
    return data.results as any[];
  }

  async getAllActiveAreas() {
    const data = await this.env.chikusfa_db.prepare(`SELECT * FROM areas WHERE is_active = 1`).all();
    return data.results as any[];
  }

  async getAllUserCoveringAreas() {
    const data = await this.env.chikusfa_db.prepare(`SELECT * FROM user_covering_area WHERE status = 1`).all();
    return data.results as any[];
  }

  async getAllUserCoveringHqs() {
    const data = await this.env.chikusfa_db.prepare(`SELECT * FROM user_covering_hq WHERE status = 1`).all();
    return data.results as any[];
  }
  getUpdateManagerHierarchyStmt(manager_id: string | null, asm_id: string | null, rsm_id: string | null, zsm_id: string | null, vp_id: string | null, admin_id: string | null, status: string, userId: string) {
    return this.env.chikusfa_db.prepare(`UPDATE users SET manager_id = ?, asm_id = ?, rsm_id = ?, zsm_id = ?, vp_id = ?, admin_id = ?, hierarchy_status = ? WHERE id = ?`).bind(manager_id, asm_id, rsm_id, zsm_id, vp_id, admin_id, status, userId);
  }

  getUpdateUserHierarchyStmt(
    id: string,
    stateId: string | null,
    stateName: string | null,
    zoneId: string | null,
    zoneName: string | null,
    areaIds: string,
    areaNames: string,
    hqIds: string,
    hqNames: string
  ) {
    return this.env.chikusfa_db.prepare(`
      UPDATE users 
      SET 
        state_id = ?, state_name = ?,
        zone_id = ?, zone_name = ?,
        area_ids = ?, area_names = ?,
        covering_hq_ids = ?, covering_hq_names = ?
      WHERE id = ?
    `).bind(
      stateId, stateName, zoneId, zoneName, areaIds, areaNames, hqIds, hqNames, id
    );
  }
}

