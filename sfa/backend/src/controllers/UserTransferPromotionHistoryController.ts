import { Env, AuthUser } from '../types';
import { DataScopeService } from '../services/DataScopeService';

export class UserTransferPromotionHistoryController {
	static async getTransferHistory(request: Request, env: Env, authUser: AuthUser) {
		try {
			const isUnrestricted = authUser.role === 'OWNER' || authUser.role === 'ADMIN';
			let query = `
				SELECT uh.*, u.full_name, u.user_id as username, u.emp_code, u.role
				FROM user_history uh
				LEFT JOIN users u ON uh.user_id = u.id
				WHERE uh.action = 'TRANSFER'
			`;
			const params: any[] = [];

			if (!isUnrestricted) {
				const scope = await DataScopeService.getUserScope(env, authUser);
				const userIds = scope.authorizedUserIds;
				const hqIds = scope.permittedHqIds;

				if (userIds.length > 0 && hqIds.length > 0) {
					const uPlaceholders = userIds.map(() => '?').join(',');
					const hPlaceholders = hqIds.map(() => '?').join(',');
					query += ` AND (uh.user_id IN (${uPlaceholders}) OR u.hq_id IN (${hPlaceholders}))`;
					params.push(...userIds, ...hqIds);
				} else if (userIds.length > 0) {
					const uPlaceholders = userIds.map(() => '?').join(',');
					query += ` AND uh.user_id IN (${uPlaceholders})`;
					params.push(...userIds);
				} else if (hqIds.length > 0) {
					const hPlaceholders = hqIds.map(() => '?').join(',');
					query += ` AND u.hq_id IN (${hPlaceholders})`;
					params.push(...hqIds);
				} else {
					return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
				}
			}

			query += ` ORDER BY uh.changed_at DESC LIMIT 100`;
			const { results } = await env.chikusfa_db.prepare(query).bind(...params).all();
			return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}

	static async getPromotionHistory(request: Request, env: Env, authUser: AuthUser) {
		try {
			const isUnrestricted = authUser.role === 'OWNER' || authUser.role === 'ADMIN';
			let query = `
				SELECT rch.*, u.full_name, u.user_id as username, u.emp_code
				FROM role_change_history rch
				LEFT JOIN users u ON rch.user_id = u.id
				WHERE 1=1
			`;
			const params: any[] = [];

			if (!isUnrestricted) {
				const scope = await DataScopeService.getUserScope(env, authUser);
				const userIds = scope.authorizedUserIds;
				const hqIds = scope.permittedHqIds;

				if (userIds.length > 0 && hqIds.length > 0) {
					const uPlaceholders = userIds.map(() => '?').join(',');
					const hPlaceholders = hqIds.map(() => '?').join(',');
					query += ` AND (rch.user_id IN (${uPlaceholders}) OR u.hq_id IN (${hPlaceholders}))`;
					params.push(...userIds, ...hqIds);
				} else if (userIds.length > 0) {
					const uPlaceholders = userIds.map(() => '?').join(',');
					query += ` AND rch.user_id IN (${uPlaceholders})`;
					params.push(...userIds);
				} else if (hqIds.length > 0) {
					const hPlaceholders = hqIds.map(() => '?').join(',');
					query += ` AND u.hq_id IN (${hPlaceholders})`;
					params.push(...hqIds);
				} else {
					return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
				}
			}

			query += ` ORDER BY rch.effective_date DESC LIMIT 100`;
			const { results } = await env.chikusfa_db.prepare(query).bind(...params).all();
			return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}
}
