import { DataService } from './DataService';
import { Env, AuthUser } from '../types';
import { UserRepository } from '../repositories/UserRepository';
import { HierarchyService } from './HierarchyService';

export class UserService extends DataService {
	protected async preSaveCheck(env: Env, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE') {
		const userRepo = new UserRepository(env);

		if (validData.user_id && validData.user_id !== existingData?.user_id) {
			const existing = await userRepo.findByUserId(validData.user_id, id);
			if (existing) throw new Error(`Username '${validData.user_id}' already exists`);
		}
		if (validData.emp_code && validData.emp_code !== existingData?.emp_code) {
			const existing = await userRepo.findByEmpCode(validData.emp_code, id);
			if (existing) throw new Error(`Employee Code '${validData.emp_code}' already exists`);
		}
		if (validData.mobile && validData.mobile !== existingData?.mobile) {
			const existing = await userRepo.findByMobile(validData.mobile, id);
			if (existing) throw new Error(`Mobile number '${validData.mobile}' already exists`);
		}
		if (validData.email && validData.email !== existingData?.email) {
			const existing = await userRepo.findByEmail(validData.email, id);
			if (existing) throw new Error(`Email '${validData.email}' already exists`);
		}
		if (action === 'CREATE' && !validData.password_hash) {
			if (validData.password) {
				validData.password_hash = String(validData.password).trim();
			} else if (validData.user_id) {
				validData.password_hash = String(validData.user_id).trim().toLowerCase();
			} else {
				throw new Error('Password is required when creating a user');
			}
		}

		// Enforce Lifecycle Workflow Security: prevent bypass of sensitive fields via generic CRUD update
		if (action === 'UPDATE') {
			if (validData.role && existingData?.role && validData.role !== existingData.role) {
				throw new Error('400 Bad Request: Direct role change via generic user update is prohibited. Use the formal Promotion/Demotion workflow (/api/users/:id/promote).');
			}
			if (validData.hq_id && existingData?.hq_id && validData.hq_id !== existingData.hq_id) {
				throw new Error('400 Bad Request: Direct territory relocation via generic user update is prohibited. Use the formal Transfer workflow (/api/users/:id/transfer).');
			}
			if (validData.division_id && existingData?.division_id && validData.division_id !== existingData.division_id) {
				throw new Error('400 Bad Request: Direct division relocation via generic user update is prohibited. Use the formal Transfer workflow (/api/users/:id/transfer).');
			}
			if (validData.reports_to_id !== undefined && existingData?.reports_to_id !== undefined && validData.reports_to_id !== existingData.reports_to_id) {
				throw new Error('400 Bad Request: Direct manager modification via generic user update is prohibited. Reporting lines must be managed via Transfer/Promotion workflows.');
			}
			if (validData.status && existingData?.status && validData.status !== existingData.status) {
				throw new Error('400 Bad Request: Direct user lifecycle status modification via generic user update is prohibited.');
			}
			if (validData.hierarchy_status && existingData?.hierarchy_status && validData.hierarchy_status !== existingData.hierarchy_status) {
				throw new Error('400 Bad Request: Direct hierarchy status modification is prohibited. Hierarchy status is maintained automatically.');
			}
		}

		const targetReportsToId = validData.reports_to_id !== undefined ? validData.reports_to_id : existingData?.reports_to_id;
		const targetReportsToIds = validData.reports_to_ids !== undefined ? validData.reports_to_ids : existingData?.reports_to_ids;
		const targetRole = validData.role || existingData?.role || 'MR';

		if (targetReportsToId || targetReportsToIds) {
			await HierarchyService.validateReportingIntegrity(env, id, targetRole, targetReportsToId, targetReportsToIds);
		}
	}

	protected async hashPasswordIfNeeded(validData: any, existingData: any) {
		if (validData.password_hash && validData.password_hash !== existingData?.password_hash) {
			if (typeof validData.password_hash !== 'string' || !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,12}$/.test(validData.password_hash)) {
				throw new Error('Password must be 6-12 characters long and contain only letters and numbers');
			}
			const msgUint8 = new TextEncoder().encode(validData.password_hash);
			const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
			validData.password_hash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
		}
	}

	protected async getAdditionalSaveStatements(env: Env, action: 'CREATE' | 'UPDATE', id: string, validData: any, existingData: any, authUser: AuthUser): Promise<any[]> {
		const stmts: any[] = [];
		const userRepo = new UserRepository(env);
		const historyId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		
		stmts.push(userRepo.getInsertUserHistoryStmt(historyId, id, action, existingData, validData, authUser.id, new Date().toISOString()));

		const role = validData.role || existingData?.role;
		
		if (role === 'OWNER') {
			validData.hq_id = 'HQ000';
			validData.hq_name = 'Corporate HQ (Head Office)';
			validData.covering_hq_ids = '[]';
			validData.area_ids = '[]';
		}
		
		let areaIds: string[] = [];
		if (typeof validData.area_ids === 'string') {
			try { areaIds = JSON.parse(validData.area_ids); } catch(e) {}
		} else if (Array.isArray(validData.area_ids)) {
			areaIds = validData.area_ids;
		}

		if (role === 'MR' && areaIds.length > 0) {
			stmts.push(userRepo.getDeactivateUserCoveringAreaStmt(id));
			areaIds.forEach((areaId: string, index: number) => {
				const mapId = `uca_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`;
				stmts.push(userRepo.getUpsertUserCoveringAreaStmt(mapId, id, areaId, index, authUser.id));
			});
			validData.area_ids = JSON.stringify(areaIds);
		} else if (role === 'MR' && areaIds.length === 0) {
			stmts.push(userRepo.getDeactivateUserCoveringAreaStmt(id));
		}
		
		let coveringHqIds: string[] = [];
		if (typeof validData.covering_hq_ids === 'string') {
			try { coveringHqIds = JSON.parse(validData.covering_hq_ids); } catch(e) {}
		} else if (Array.isArray(validData.covering_hq_ids)) {
			coveringHqIds = validData.covering_hq_ids;
		}

		if (['VP', 'ZSM', 'RSM', 'ASM', 'SR_ASM', 'NSM', 'MR'].includes(role) && coveringHqIds.length > 0) {
			stmts.push(userRepo.getDeactivateUserCoveringHqStmt(id));
			coveringHqIds.forEach((hqId: string, index: number) => {
				const mapId = `uch_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`;
				stmts.push(userRepo.getUpsertUserCoveringHqStmt(mapId, id, hqId, index, authUser.id));
			});
			validData.covering_hq_ids = JSON.stringify(coveringHqIds);
		} else if (['VP', 'ZSM', 'RSM', 'ASM', 'SR_ASM', 'NSM', 'MR'].includes(role) && coveringHqIds.length === 0) {
			stmts.push(userRepo.getDeactivateUserCoveringHqStmt(id));
		}

		if (['VP', 'ZSM', 'RSM', 'ASM', 'SR_ASM', 'NSM'].includes(role)) {
			const allManagerHqs = Array.from(new Set([validData.hq_id || existingData?.hq_id, ...coveringHqIds].filter(Boolean)));
			if (allManagerHqs.length > 0) {
				const placeholders = allManagerHqs.map(() => '?').join(',');
				const areaRows: any = await env.chikusfa_db.prepare(`SELECT id FROM areas WHERE hq_id IN (${placeholders}) AND is_active = 1`).bind(...allManagerHqs).all();
				if (areaRows && areaRows.results) {
					const managerAreaIds = areaRows.results.map((r: any) => r.id);
					validData.area_ids = JSON.stringify(managerAreaIds);
				}
			}
		}
		
		if (Array.isArray(validData.reports_to_ids)) {
			validData.reports_to_ids = JSON.stringify(validData.reports_to_ids);
		}

		const hierarchyStmts = await HierarchyService.rebuildHierarchyStatements(env);
		stmts.push(...hierarchyStmts);

		return stmts;
	}

	protected async preDeleteCheck(env: Env, id: string) {
		const userRepo = new UserRepository(env);
		const existingUser: any = await userRepo.findById(id);
		if (existingUser?.role === 'OWNER') {
			throw new Error('Forbidden: Cannot delete ADMIN users');
		}
	}

	protected async getDeleteStatements(env: Env, id: string, authUser: AuthUser): Promise<any[]> {
		const stmts: any[] = [];
		const userRepo = new UserRepository(env);
		const existingUser: any = await userRepo.findById(id);
		const historyId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		stmts.push(userRepo.getInsertUserHistoryStmt(historyId, id, 'DELETE', existingUser, { ...existingUser, is_active: 0 }, authUser.id, new Date().toISOString()));
		return stmts;
	}

	protected async postDelete(env: Env, id: string, authUser: AuthUser) {
		const userRepo = new UserRepository(env);
		await userRepo.clearManagerId(id);
	}
}
