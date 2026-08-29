import { Env, AuthUser } from '../types';
import { DataService } from './DataService';
import { DcrRepository } from '../repositories/DcrRepository';

export class DcrService extends DataService {
	constructor() {
		super('dcr_entries');
	}

	async find(env: Env, query: string, params: any[], authUser?: AuthUser) {
		return await super.find(env, query, params, authUser);
	}

	protected async executeDelete(env: Env, id: string, authUser: AuthUser) {
		await this.preDeleteCheck(env, id);
		
		const repo = new DcrRepository(env);
		const additionalStmts = await this.getDeleteStatements(env, id, authUser);
		await repo.hardDeleteDcr(id, additionalStmts);
		
		await this.postDelete(env, id, authUser);
		return { success: true };
	}
}


