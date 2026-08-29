import { Env } from '../types';

export class DcrRepository {
	constructor(private env: Env) {}

	async hardDeleteDcr(id: string, additionalStmts: any[]) {
		const stmts = [...additionalStmts];
		stmts.push(this.env.chikusfa_db.prepare(`DELETE FROM dcr_entries WHERE id = ?`).bind(id));
		await this.env.chikusfa_db.batch(stmts);
	}
}
