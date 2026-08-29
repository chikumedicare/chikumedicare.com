import { Env } from '../types';

export class CustomerRepository {
	constructor(private env: Env) {}

	async getParentHq(hqId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT state_id, zone_id FROM hqs WHERE id = ?`).bind(hqId).first();
	}
}
