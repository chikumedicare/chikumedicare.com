import { Env, AuthUser } from '../types';
import { DataService } from './DataService';

export class TargetService extends DataService {
	constructor() {
		super('sales_targets');
	}

	async find(env: Env, query: string, params: any[], authUser?: AuthUser) {
		if (authUser && authUser.role !== 'ADMIN') {
			const allowedHqs = [authUser.hqId, ...(authUser.coveringHqIds || [])].filter(Boolean);
			if (allowedHqs.length > 0) {
				const placeholders = allowedHqs.map(() => '?').join(',');
				query += ` AND hq_id IN (${placeholders})`;
				params.push(...allowedHqs);
			} else {
				query += ` AND 1=0`;
			}
		}
		const results = await super.find(env, query, params, authUser);

		if (Array.isArray(results) && results.length > 0) {
			try {
				const hqsRes = await env.chikusfa_db.prepare(`SELECT id, name FROM hqs`).all<{ id: string; name: string }>();
				const prodsRes = await env.chikusfa_db.prepare(`SELECT id, name FROM products`).all<{ id: string; name: string }>();

				const hqMap = new Map((hqsRes.results || []).map((h) => [h.id, h.name]));
				const prodMap = new Map((prodsRes.results || []).map((p) => [p.id, p.name]));

				return results.map((row: any) => ({
					...row,
					hq_name: row.hq_name || hqMap.get(row.hq_id) || '',
					product_name: row.product_name || prodMap.get(row.product_id) || '',
				}));
			} catch (e) {
				console.error('[TargetService.find] Dynamic enrichment warning:', e);
			}
		}

		return results;
	}

	async create(env: Env, id: string, body: Record<string, any>, authUser: AuthUser) {
		// Automatic UPSERT: Check if target row already exists for (hq_id, fy, product_id)
		const hqId = body.hq_id || body.hqId;
		const fy = body.fy;
		const productId = body.product_id || body.productId;

		if (hqId && fy && productId) {
			const existing = await env.chikusfa_db.prepare(
				`SELECT id FROM sales_targets WHERE hq_id = ? AND fy = ? AND product_id = ? LIMIT 1`
			).bind(hqId, fy, productId).first<{ id: string }>();

			if (existing && existing.id) {
				return await this.update(env, existing.id, body, authUser, existing);
			}
		}
		return await super.create(env, id, body, authUser);
	}
}
