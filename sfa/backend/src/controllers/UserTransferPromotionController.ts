import { Env, AuthUser } from '../types';
import { DataScopeService } from '../services/DataScopeService';
import { hasPermission } from '../middleware/auth';
import { UserTransferPromotionHistoryController } from './UserTransferPromotionHistoryController';

export class UserTransferPromotionController {
	static async transfer(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
		try {
			const scope = await DataScopeService.getUserScope(env, authUser);
			const isSuperAdmin = authUser.role === 'OWNER' || authUser.role === 'ADMIN';

			const id = params.id;
			const { hqId, divisionId, primaryAreaId, reason, effectiveDate } = (await request.json()) as any;

			if (!hqId) {
				return new Response(JSON.stringify({ error: '400 Bad Request: Destination HQ (hqId) is required for transfer.' }), { status: 400 });
			}

			const user: any = await env.chikusfa_db.prepare('SELECT * FROM users WHERE id = ? OR user_id = ?').bind(id, id).first();
			if (!user) return new Response(JSON.stringify({ error: '404 Not Found: Target user to transfer not found.' }), { status: 404 });

			if (user.role === 'ADMIN' || user.role === 'OWNER') {
				return new Response(JSON.stringify({ error: '403 Forbidden: System administrators cannot be transferred across field territories.' }), { status: 403 });
			}

			// 1. Actor Permission & Data Scope Verification
			if (!isSuperAdmin) {
				const hasPerm = await hasPermission(String(authUser.id), String(authUser.role), 'MANAGE_USERS', env);
				if (!hasPerm) {
					return new Response(JSON.stringify({ error: '403 Forbidden: You do not have permission to execute employee transfers.' }), { status: 403 });
				}

				// Target user hierarchy check
				const isSubordinate =
					scope.authorizedUserIds?.includes(user.id) ||
					scope.authorizedUserIds?.includes(user.user_id) ||
					scope.authorizedEmpCodes?.includes(user.emp_code);
				if (!isSubordinate) {
					return new Response(JSON.stringify({ error: '403 Forbidden: Cannot transfer employee outside your authorized hierarchy.' }), { status: 403 });
				}

				// Source geography verification (user's current HQ & Division)
				if (user.hq_id && scope.permittedHqIds?.length > 0 && !scope.permittedHqIds.includes(user.hq_id)) {
					return new Response(
						JSON.stringify({ error: `403 Forbidden: Cannot transfer employee from source HQ '${user.hq_id}' outside your authorized scope.` }),
						{ status: 403 }
					);
				}
				if (user.division_id && scope.permittedDivisionIds?.length > 0 && !scope.permittedDivisionIds.includes(user.division_id)) {
					return new Response(
						JSON.stringify({ error: `403 Forbidden: Cannot transfer employee from source division '${user.division_id}' outside your authorized scope.` }),
						{ status: 403 }
					);
				}

				// Destination geography verification (Target HQ & Division)
				if (scope.permittedHqIds?.length > 0 && !scope.permittedHqIds.includes(hqId)) {
					return new Response(
						JSON.stringify({ error: `403 Forbidden: Cannot transfer employee to destination HQ '${hqId}' outside your authorized scope.` }),
						{ status: 403 }
					);
				}
				const checkDivisionId = divisionId || user.division_id;
				if (checkDivisionId && scope.permittedDivisionIds?.length > 0 && !scope.permittedDivisionIds.includes(checkDivisionId)) {
					return new Response(
						JSON.stringify({ error: `403 Forbidden: Cannot transfer employee to destination division '${checkDivisionId}' outside your authorized scope.` }),
						{ status: 403 }
					);
				}
			}

			// 2. Destination Geography Verification
			const hq: any = await env.chikusfa_db.prepare('SELECT * FROM hqs WHERE id = ?').bind(hqId).first();
			if (!hq || hq.is_active === 0) {
				return new Response(JSON.stringify({ error: `400 Bad Request: Destination HQ '${hqId}' does not exist or is inactive.` }), { status: 400 });
			}

			const targetDivisionId = divisionId || user.division_id || hq.division_id || null;
			if (targetDivisionId) {
				const div: any = await env.chikusfa_db.prepare('SELECT id, is_active FROM divisions WHERE id = ?').bind(targetDivisionId).first();
				if (!div || div.is_active === 0) {
					return new Response(JSON.stringify({ error: `400 Bad Request: Destination division '${targetDivisionId}' does not exist or is inactive.` }), { status: 400 });
				}
			}

			if (primaryAreaId) {
				const area: any = await env.chikusfa_db.prepare('SELECT id, hq_id, is_active FROM areas WHERE id = ?').bind(primaryAreaId).first();
				if (!area || area.is_active === 0) {
					return new Response(JSON.stringify({ error: `400 Bad Request: Destination primary area '${primaryAreaId}' does not exist or is inactive.` }), { status: 400 });
				}
				if (area.hq_id !== hqId) {
					return new Response(
						JSON.stringify({ error: `400 Bad Request: Primary area '${primaryAreaId}' belongs to HQ '${area.hq_id}', not destination HQ '${hqId}'.` }),
						{ status: 400 }
					);
				}
			}

			// 3. No-Op Redundancy Protection
			const isSameHq = user.hq_id === hqId;
			const isSameDiv = (user.division_id || '') === (targetDivisionId || '');
			const isSameArea = (user.primary_area_id || '') === (primaryAreaId || '');
			if (isSameHq && isSameDiv && isSameArea) {
				return new Response(JSON.stringify({ error: '400 Bad Request: Target employee is already assigned to this exact HQ, division, and area.' }), { status: 400 });
			}

			let stateId = null;
			let zoneId = null;
			if (hq.state_id) {
				const state: any = await env.chikusfa_db.prepare('SELECT * FROM states WHERE id = ?').bind(hq.state_id).first();
				if (state) {
					stateId = state.id;
					zoneId = state.zone_id || null;
				}
			}

			const stmts = [];
			stmts.push(
				env.chikusfa_db
					.prepare(
						'UPDATE users SET hq_id = ?, division_id = ?, primary_state_id = ?, primary_zone_id = ?, primary_area_id = ?, reports_to_id = NULL, manager_id = NULL, asm_id = NULL, rsm_id = NULL, zsm_id = NULL, vp_id = NULL, hierarchy_status = "UNASSIGNED" WHERE id = ?'
					)
					.bind(hqId, targetDivisionId, stateId, zoneId, primaryAreaId || null, user.id)
			);
			stmts.push(env.chikusfa_db.prepare('UPDATE user_covering_area SET status = 0 WHERE user_id = ?').bind(user.id));
			if (primaryAreaId) {
				stmts.push(
					env.chikusfa_db
						.prepare('INSERT INTO user_covering_area (id, user_id, area_id, status) VALUES (?, ?, ?, 1)')
						.bind(`uca_${Date.now()}_${Math.random().toString(36).substring(7)}`, user.id, primaryAreaId)
				);
				stmts.push(env.chikusfa_db.prepare('UPDATE users SET area_ids = ? WHERE id = ?').bind(JSON.stringify([primaryAreaId]), user.id));
			} else {
				stmts.push(env.chikusfa_db.prepare('UPDATE users SET area_ids = "[]" WHERE id = ?').bind(user.id));
			}

			if (hq.is_pool_hq) {
				const { results: poolHqs } = await env.chikusfa_db.prepare('SELECT id FROM hqs WHERE parent_pool_hq_id = ? AND is_active = 1').bind(hq.id).all();
				const poolHqIds = (poolHqs || []).map((h: any) => h.id);
				stmts.push(env.chikusfa_db.prepare('UPDATE user_covering_hq SET status = 0 WHERE user_id = ?').bind(user.id));
				for (const pHqId of poolHqIds) {
					stmts.push(
						env.chikusfa_db
							.prepare('INSERT INTO user_covering_hq (id, user_id, hq_id, status) VALUES (?, ?, ?, 1)')
							.bind(`uch_${Date.now()}_${Math.random().toString(36).substring(7)}`, user.id, pHqId)
					);
				}
				stmts.push(env.chikusfa_db.prepare('UPDATE users SET covering_hq_ids = ? WHERE id = ?').bind(JSON.stringify(poolHqIds), user.id));
			} else {
				stmts.push(env.chikusfa_db.prepare('UPDATE user_covering_hq SET status = 0 WHERE user_id = ?').bind(user.id));
				stmts.push(env.chikusfa_db.prepare('UPDATE users SET covering_hq_ids = "[]" WHERE id = ?').bind(user.id));
			}

			const uhId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			stmts.push(
				env.chikusfa_db
					.prepare(`INSERT INTO user_history (id, user_id, action, old_data, new_data, changed_by, remarks, changed_at) VALUES (?, ?, 'TRANSFER', ?, ?, ?, ?, ?)`)
					.bind(
						uhId,
						user.id,
						JSON.stringify({ hq_id: user.hq_id, division_id: user.division_id, primary_area_id: user.primary_area_id, state_id: user.primary_state_id, zone_id: user.primary_zone_id }),
						JSON.stringify({ hq_id: hqId, division_id: targetDivisionId, primary_area_id: primaryAreaId || null, state_id: stateId, zone_id: zoneId }),
						String(authUser.id),
						reason || 'Territory Relocation',
						effectiveDate || new Date().toISOString()
					)
			);

			const { HierarchyService } = await import('../services/HierarchyService');
			const hierarchyStmts = await HierarchyService.rebuildHierarchyStatements(env);
			stmts.push(...hierarchyStmts);

			for (let i = 0; i < stmts.length; i += 100) {
				await env.chikusfa_db.batch(stmts.slice(i, i + 100));
			}
			return new Response(JSON.stringify({ success: true, message: 'Transfer executed successfully' }), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}

	static async promote(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
		try {
			const scope = await DataScopeService.getUserScope(env, authUser);
			const isSuperAdmin = authUser.role === 'OWNER' || authUser.role === 'ADMIN';

			if (!isSuperAdmin) {
				const hasPerm = await hasPermission(String(authUser.id), String(authUser.role), 'MANAGE_USERS', env);
				if (!hasPerm) {
					return new Response(JSON.stringify({ error: '403 Forbidden: Only administrators can execute promotions.' }), { status: 403 });
				}
			}

			const id = params.id;
			const { role, hqId, designation, remarks, effectiveDate, actionType } = (await request.json()) as any;

			if (role === 'OWNER') {
				return new Response(JSON.stringify({ error: '403 Forbidden: Cannot assign root OWNER role via promotion.' }), { status: 403 });
			}

			const validRoles = ['MR', 'ASM', 'SR_ASM', 'RSM', 'ZSM', 'NSM', 'VP', 'ADMIN'];
			if (!role || !validRoles.includes(role)) {
				return new Response(JSON.stringify({ error: `400 Bad Request: Invalid target role '${role}'.` }), { status: 400 });
			}

			const user: any = await env.chikusfa_db.prepare('SELECT * FROM users WHERE id = ? OR user_id = ?').bind(id, id).first();
			if (!user) return new Response(JSON.stringify({ error: '404 Not Found: Target user not found.' }), { status: 404 });

			if (user.role === 'OWNER') {
				return new Response(JSON.stringify({ error: '403 Forbidden: Root OWNER account cannot be promoted or demoted.' }), { status: 403 });
			}

			if (!isSuperAdmin) {
				const isSubordinate =
					scope.authorizedUserIds?.includes(user.id) ||
					scope.authorizedUserIds?.includes(user.user_id) ||
					scope.authorizedEmpCodes?.includes(user.emp_code);
				if (!isSubordinate) {
					return new Response(JSON.stringify({ error: '403 Forbidden: Cannot promote employee outside your authorized hierarchy.' }), { status: 403 });
				}
			}

			const targetHqId = hqId || user.hq_id;
			if (role === user.role && targetHqId === user.hq_id) {
				return new Response(JSON.stringify({ error: `400 Bad Request: Target user is already assigned the role '${role}'.` }), { status: 400 });
			}

			let stateId = null;
			let zoneId = null;
			if (targetHqId) {
				const hq: any = await env.chikusfa_db.prepare('SELECT * FROM hqs WHERE id = ?').bind(targetHqId).first();
				if (!hq || hq.is_active === 0) {
					return new Response(JSON.stringify({ error: `400 Bad Request: Target HQ '${targetHqId}' does not exist or is inactive.` }), { status: 400 });
				}
				if (hq.state_id) {
					const state: any = await env.chikusfa_db.prepare('SELECT * FROM states WHERE id = ?').bind(hq.state_id).first();
					if (state) {
						stateId = state.id;
						zoneId = state.zone_id || null;
					}
				}
			}

			const actionLabel = actionType || (role === 'MR' && user.role !== 'MR' ? 'DEMOTION' : 'PROMOTION');

			const stmts = [];
			stmts.push(
				env.chikusfa_db
					.prepare(
						'UPDATE users SET role = ?, designation = ?, hq_id = ?, primary_state_id = ?, primary_zone_id = ?, primary_area_id = NULL, reports_to_id = NULL, manager_id = NULL, asm_id = NULL, rsm_id = NULL, zsm_id = NULL, vp_id = NULL, hierarchy_status = "UNASSIGNED", covering_hq_ids = "[]", area_ids = "[]" WHERE id = ?'
					)
					.bind(role, designation || user.designation || role, targetHqId || null, stateId || user.primary_state_id || null, zoneId || user.primary_zone_id || null, user.id)
			);
			stmts.push(env.chikusfa_db.prepare('UPDATE user_covering_area SET status = 0 WHERE user_id = ?').bind(user.id));
			stmts.push(env.chikusfa_db.prepare('UPDATE user_covering_hq SET status = 0 WHERE user_id = ?').bind(user.id));

			const rchId = `rch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			stmts.push(
				env.chikusfa_db
					.prepare(`INSERT INTO role_change_history (id, user_id, previous_role, new_role, changed_by, remarks, effective_date) VALUES (?, ?, ?, ?, ?, ?, ?)`)
					.bind(rchId, user.id, user.role, role, String(authUser.id), remarks || `${actionLabel} via Promotion Workflow`, effectiveDate || new Date().toISOString())
			);

			const uhId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			stmts.push(
				env.chikusfa_db
					.prepare(`INSERT INTO user_history (id, user_id, action, old_data, new_data, changed_by, remarks, changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
					.bind(
						uhId,
						user.id,
						actionLabel,
						JSON.stringify({ role: user.role, hq_id: user.hq_id, designation: user.designation }),
						JSON.stringify({ role: role, hq_id: targetHqId, designation: designation || user.designation || role }),
						String(authUser.id),
						remarks || `${actionLabel} Executed`,
						effectiveDate || new Date().toISOString()
					)
			);

			const { HierarchyService } = await import('../services/HierarchyService');
			const hierarchyStmts = await HierarchyService.rebuildHierarchyStatements(env);
			stmts.push(...hierarchyStmts);

			for (let i = 0; i < stmts.length; i += 100) {
				await env.chikusfa_db.batch(stmts.slice(i, i + 100));
			}
			return new Response(JSON.stringify({ success: true, message: `${actionLabel} executed successfully` }), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}

	static getTransferHistory = UserTransferPromotionHistoryController.getTransferHistory;
	static getPromotionHistory = UserTransferPromotionHistoryController.getPromotionHistory;
}
