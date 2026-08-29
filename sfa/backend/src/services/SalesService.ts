import { Env, AuthUser } from '../types';
import { DataService } from './DataService';
import { BaseRepository } from '../repositories/BaseRepository';

export class SalesService extends DataService {
	constructor() {
		super('sales_entries');
	}

	async find(env: Env, query: string, params: any[], authUser?: AuthUser) {
		return await super.find(env, query, params, authUser);
	}

	protected async preSaveCheck(env: Env, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE') {
		if (!validData.target_id) {
			throw new Error('target_id is required for sales entry');
		}

		if (action === 'CREATE' && validData.target_id && validData.month_year && validData.type) {
			const repo = new BaseRepository(env, 'sales_entries');
			const existing = await repo.find(
				'SELECT id FROM sales_entries WHERE target_id = ? AND month_year = ? AND type = ? AND is_active = 1',
				[validData.target_id, validData.month_year, validData.type]
			);
			if (existing && existing.length > 0) {
				throw new Error('A sale entry already exists for this customer in this month');
			}
		}

		// Server-side Geography & Assigned MR User Enrichment
		const docId = validData.target_id;
		if (docId) {
			let targetHqId = validData.target_hq_id;
			let targetAreaId = validData.target_area_id;

			// Fetch Doctor details if hq_id or area_id missing
			if (!targetHqId || !targetAreaId) {
				const docRow: any = await env.chikusfa_db.prepare(`SELECT hq_id, area_id FROM doctors WHERE id = ?`).bind(docId).first();
				if (docRow) {
					targetHqId = targetHqId || docRow.hq_id;
					targetAreaId = targetAreaId || docRow.area_id;
				}
			}

			if (targetHqId) {
				validData.target_hq_id = targetHqId;
				const hqRow: any = await env.chikusfa_db.prepare(`SELECT hq_name FROM hqs WHERE id = ?`).bind(targetHqId).first();
				if (hqRow && hqRow.hq_name) {
					validData.target_hq_name = hqRow.hq_name;
				}
			}

			if (targetAreaId) {
				validData.target_area_id = targetAreaId;
				const areaRow: any = await env.chikusfa_db.prepare(`SELECT area_name FROM areas WHERE id = ?`).bind(targetAreaId).first();
				if (areaRow && areaRow.area_name) {
					validData.target_area_name = areaRow.area_name;
				}
			}

			// Resolve assigned MR/User for this Doctor's HQ
			if (targetHqId) {
				const mrRow: any = await env.chikusfa_db.prepare(`
					SELECT id, full_name, hq_id FROM users 
					WHERE (hq_id = ? OR covering_hq_ids LIKE ?) 
					  AND role = 'MR' 
					  AND is_active = 1 
					LIMIT 1
				`).bind(targetHqId, `%${targetHqId}%`).first();

				const fallbackRow: any = !mrRow ? await env.chikusfa_db.prepare(`
					SELECT id, full_name, hq_id FROM users 
					WHERE (hq_id = ? OR covering_hq_ids LIKE ?) 
					  AND is_active = 1 
					LIMIT 1
				`).bind(targetHqId, `%${targetHqId}%`).first() : null;

				const assignedUser = mrRow || fallbackRow;

				if (assignedUser) {
					validData.employee_id = assignedUser.id;
					validData.employee_name = assignedUser.full_name;
					validData.employee_hq_id = assignedUser.hq_id || targetHqId;
				} else {
					validData.employee_hq_id = targetHqId;
				}
			}
		}
	}
}

