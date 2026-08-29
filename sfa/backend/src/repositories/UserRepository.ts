import { Env } from '../types';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository {
  constructor(env: Env) {
    super(env, 'users');
  }

  async findByUserId(userId: string, excludeId?: string) {
    let query = `SELECT * FROM users WHERE user_id = ?`;
    const params = [userId];
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    return await this.env.chikusfa_db.prepare(query).bind(...params).first();
  }

  async findByEmpCode(empCode: string, excludeId?: string) {
    let query = `SELECT id FROM users WHERE emp_code = ?`;
    const params = [empCode];
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    return await this.env.chikusfa_db.prepare(query).bind(...params).first();
  }

  async findByMobile(mobile: string, excludeId?: string) {
    let query = `SELECT id FROM users WHERE mobile = ?`;
    const params = [mobile];
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    return await this.env.chikusfa_db.prepare(query).bind(...params).first();
  }

  async findByEmail(email: string, excludeId?: string) {
    let query = `SELECT id FROM users WHERE email = ?`;
    const params = [email];
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    return await this.env.chikusfa_db.prepare(query).bind(...params).first();
  }

  getInsertUserHistoryStmt(id: string, userId: string, action: string, oldData: any, newData: any, changedBy: string, changedAt: string) {
    return this.env.chikusfa_db.prepare(`INSERT INTO user_history (id, user_id, action, old_data, new_data, changed_by, changed_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
      id, userId, action, oldData ? JSON.stringify(oldData) : null, JSON.stringify(newData), changedBy, changedAt
    );
  }

  getInsertRoleChangeHistoryStmt(id: string, userId: string, previousRole: string, newRole: string, effectiveDate: string, changedBy: string, remarks: string) {
    return this.env.chikusfa_db.prepare(`INSERT INTO role_change_history (id, user_id, previous_role, new_role, effective_date, changed_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
      id, userId, previousRole, newRole, effectiveDate, changedBy, remarks
    );
  }

  getDeactivateUserCoveringAreaStmt(userId: string) {
    return this.env.chikusfa_db.prepare(`UPDATE user_covering_area SET status = 0 WHERE user_id = ?`).bind(userId);
  }

  getUpsertUserCoveringAreaStmt(id: string, userId: string, areaId: string, displayOrder: number, createdBy: string) {
    return this.env.chikusfa_db.prepare(`
      INSERT INTO user_covering_area (id, user_id, area_id, display_order, status, created_by)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(user_id, area_id) DO UPDATE SET status = 1, display_order = excluded.display_order
    `).bind(id, userId, areaId, displayOrder, createdBy);
  }

  getDeactivateUserCoveringHqStmt(userId: string) {
    return this.env.chikusfa_db.prepare(`UPDATE user_covering_hq SET status = 0 WHERE user_id = ?`).bind(userId);
  }

  getUpsertUserCoveringHqStmt(id: string, userId: string, hqId: string, displayOrder: number, createdBy: string) {
    return this.env.chikusfa_db.prepare(`
      INSERT INTO user_covering_hq (id, user_id, hq_id, display_order, status, created_by)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(user_id, hq_id) DO UPDATE SET status = 1, display_order = excluded.display_order
    `).bind(id, userId, hqId, displayOrder, createdBy);
  }

  async clearManagerId(managerId: string) {
    return await this.env.chikusfa_db.prepare(`UPDATE users SET manager_id = NULL, hierarchy_status = 'VACANT' WHERE manager_id = ?`).bind(managerId).run();
  }
}
