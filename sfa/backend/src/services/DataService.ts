import { Env, AuthUser } from '../types';
import { validatePayload } from '../validators';
import { ALLOWED_TABLES, TABLES_WITH_CREATED_AT, PROTECTED_FIELDS } from '../utils/constants';
import { generateEntityCode, logAudit } from '../utils/helpers';
import { BaseRepository } from '../repositories/BaseRepository';

export class DataService {
	protected collection: string;

	constructor(collection: string) {
		if (!ALLOWED_TABLES.has(collection)) {
			throw new Error('Invalid collection');
		}
		this.collection = collection;
	}

	async find(env: Env, query: string, params: any[], authUser?: AuthUser) {
		const repo = new BaseRepository(env, this.collection);
		return await repo.find(query, params);
	}

	async findById(env: Env, id: string) {
		const repo = new BaseRepository(env, this.collection);
		return await repo.findById(id);
	}

	async delete(env: Env, id: string, authUser: AuthUser) {
		return await this.executeDelete(env, id, authUser);
	}

	protected async executeDelete(env: Env, id: string, authUser: AuthUser) {
		await this.preDeleteCheck(env, id);
		
		const stmts = [];
		const additionalStmts = await this.getDeleteStatements(env, id, authUser);
		stmts.push(...additionalStmts);

		const repo = new BaseRepository(env, this.collection);
		stmts.push(await repo.softDelete(id));
		
		await repo.batchExecute(stmts);
		
		await this.postDelete(env, id, authUser);
		return { success: true };
	}

	protected async preDeleteCheck(env: Env, id: string) {}
	
	protected async getDeleteStatements(env: Env, id: string, authUser: AuthUser): Promise<any[]> {
		return [];
	}

	protected async postDelete(env: Env, id: string, authUser: AuthUser) {}

	async create(env: Env, id: string, body: Record<string, any>, authUser: AuthUser) {
		return await this.executeEntitySave(env, 'CREATE', id, body, authUser, null);
	}

	async update(env: Env, id: string, body: Record<string, any>, authUser: AuthUser, existingData: any) {
		return await this.executeEntitySave(env, 'UPDATE', id, body, authUser, existingData);
	}

	protected async executeEntitySave(env: Env, action: 'CREATE' | 'UPDATE', id: string, body: Record<string, any>, authUser: AuthUser, existingData: any = null) {
		const validation = validatePayload(this.collection, body, action);
		if (!validation.success) {
			throw new Error(validation.error);
		}
		const validData = validation.data;

		await this.preSaveCheck(env, validData, existingData, id, action);

		await generateEntityCode(env, this.collection, validData, action);

		// Strip client-supplied audit actor fields to guarantee audit integrity from authenticated session
		delete validData.created_by;
		delete validData.updated_by;
		delete validData.deleted_by;
		delete validData.changed_by;

		if (action === 'CREATE' && TABLES_WITH_CREATED_AT.has(this.collection) && !validData.created_at) {
			validData.created_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
		}

		if (TABLES_WITH_CREATED_AT.has(this.collection)) {
			const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
			if (action === 'CREATE') {
				validData.created_by = authUser.userId || authUser.id;
			} else {
				validData.updated_at = now;
				validData.updated_by = authUser.userId || authUser.id;
				if (validData.is_active === 0 || validData.is_active === false) {
					validData.deleted_at = now;
					validData.deleted_by = authUser.userId || authUser.id;
				}
			}
		}

		await this.hashPasswordIfNeeded(validData, existingData);

		const keys = Object.keys(validData).filter(k => k !== 'id');
		
		const isSuperAdmin = authUser.role === 'OWNER' || authUser.role === 'ADMIN';
		if (!isSuperAdmin && keys.some(k => PROTECTED_FIELDS.has(k))) {
			throw new Error('Forbidden: Cannot set protected fields');
		}
		
		for (const key of keys) {
			if (!/^[a-zA-Z0-9_]+$/.test(key)) {
				throw new Error(`Invalid column name: ${key}`);
			}
		}

		const repo = new BaseRepository(env, this.collection);
		const stmts = [];
		if (action === 'CREATE') {
			stmts.push(await repo.insert(id, keys, keys.map(k => validData[k])));
		} else {
			stmts.push(await repo.update(id, keys, keys.map(k => validData[k])));
		}

		const additionalStmts = await this.getAdditionalSaveStatements(env, action, id, validData, existingData, authUser);
		stmts.push(...additionalStmts);

		await repo.batchExecute(stmts);

		await logAudit(env, {
			module: this.collection,
			type: 'DATA',
			action: action,
			entityType: this.collection,
			entityId: id,
			details: { ...validData },
			userId: authUser.id,
			userName: authUser.fullName || authUser.id
		});

		return { id, ...validData };
	}

	protected async preSaveCheck(env: Env, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE') {}

	protected async hashPasswordIfNeeded(validData: any, existingData: any) {}

	protected async getAdditionalSaveStatements(env: Env, action: 'CREATE' | 'UPDATE', id: string, validData: any, existingData: any, authUser: AuthUser): Promise<any[]> {
		return [];
	}
}
