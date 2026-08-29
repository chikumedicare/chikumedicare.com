import { Env, AuthUser } from '../types';
import { DataScopeService } from '../services/DataScopeService';
import { UserTransferPromotionController } from './UserTransferPromotionController';
import { hasPermission } from '../middleware/auth';

export class UserController {
	static async resetPassword(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
		try {
			const id = params.id;
			const body = (await request.json()) as any;
			const { oldPassword, newPassword } = body;

			if (!newPassword || !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,12}$/.test(newPassword)) {
				return new Response(
					JSON.stringify({ error: 'Password must be 6-12 characters long and contain only letters and numbers.' }),
					{ status: 400 }
				);
			}

			const targetUser: any = await env.chikusfa_db
				.prepare('SELECT * FROM users WHERE id = ? OR user_id = ?')
				.bind(id, id)
				.first();
			if (!targetUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

			const isSelf = authUser.id === targetUser.id || authUser.userId === targetUser.user_id;
			const isOwner = authUser.role === 'OWNER' || authUser.role === 'ADMIN';

			if (!isOwner && !isSelf) {
				return new Response(JSON.stringify({ error: 'Forbidden: You cannot change another user password' }), {
					status: 403,
				});
			}

			if (isSelf && !isOwner) {
				if (!oldPassword)
					return new Response(JSON.stringify({ error: 'Old password is required' }), { status: 400 });
				const oldMsgUint8 = new TextEncoder().encode(oldPassword);
				const oldHashBuffer = await crypto.subtle.digest('SHA-256', oldMsgUint8);
				const oldPasswordHash = Array.from(new Uint8Array(oldHashBuffer))
					.map((b) => b.toString(16).padStart(2, '0'))
					.join('');
				if (targetUser.password_hash !== oldPasswordHash) {
					return new Response(JSON.stringify({ error: 'Incorrect old password' }), { status: 400 });
				}
			}

			const newMsgUint8 = new TextEncoder().encode(newPassword);
			const newHashBuffer = await crypto.subtle.digest('SHA-256', newMsgUint8);
			const newPasswordHash = Array.from(new Uint8Array(newHashBuffer))
				.map((b) => b.toString(16).padStart(2, '0'))
				.join('');

			const { results: history } = await env.chikusfa_db
				.prepare('SELECT password_hash FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5')
				.bind(targetUser.id)
				.all();
			if (history.some((h: any) => h.password_hash === newPasswordHash)) {
				return new Response(JSON.stringify({ error: 'Cannot reuse any of the last 5 passwords' }), { status: 400 });
			}

			const phId = `ph_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			const uhId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			await env.chikusfa_db.batch([
				env.chikusfa_db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(newPasswordHash, targetUser.id),
				env.chikusfa_db.prepare('INSERT INTO password_history (id, user_id, password_hash) VALUES (?, ?, ?)').bind(phId, targetUser.id, newPasswordHash),
				env.chikusfa_db.prepare(`INSERT INTO user_history (id, user_id, action, changed_by) VALUES (?, ?, 'PASSWORD_RESET', ?)`).bind(uhId, targetUser.id, authUser.id),
				env.chikusfa_db.prepare(`UPDATE user_sessions SET is_revoked = 1, revoked_at = datetime('now'), revocation_reason = 'PASSWORD_RESET' WHERE user_id = ?`).bind(targetUser.id)
			]);

			return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}

	static async resetDevice(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
		try {
			if (authUser.role !== 'OWNER' && authUser.role !== 'ADMIN') {
				return new Response(JSON.stringify({ error: 'Forbidden: Only administrators can reset devices.' }), { status: 403 });
			}
			const id = params.id;
			const targetUser: any = await env.chikusfa_db.prepare('SELECT id FROM users WHERE id = ? OR user_id = ?').bind(id, id).first();
			if (!targetUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

			const uhId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			await env.chikusfa_db.batch([
				env.chikusfa_db.prepare('UPDATE users SET device_id = NULL, device_name = NULL, device_model = NULL, os_version = NULL, app_version = NULL, registered_on = NULL WHERE id = ?').bind(targetUser.id),
				env.chikusfa_db.prepare('UPDATE user_devices SET is_active = 0 WHERE user_id = ?').bind(targetUser.id),
				env.chikusfa_db.prepare(`INSERT INTO user_history (id, user_id, action, changed_by) VALUES (?, ?, 'DEVICE_RESET', ?)`).bind(uhId, targetUser.id, authUser.id),
				env.chikusfa_db.prepare(`UPDATE user_sessions SET is_revoked = 1, revoked_at = datetime('now'), revocation_reason = 'DEVICE_RESET' WHERE user_id = ?`).bind(targetUser.id)
			]);

			return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}

	static async unlock(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
		try {
			if (authUser.role !== 'OWNER' && authUser.role !== 'ADMIN') {
				return new Response(JSON.stringify({ error: 'Forbidden: Only administrators can unlock accounts.' }), { status: 403 });
			}
			const id = params.id;
			const targetUser: any = await env.chikusfa_db.prepare('SELECT id FROM users WHERE id = ? OR user_id = ?').bind(id, id).first();
			if (!targetUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

			const uhId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			await env.chikusfa_db.batch([
				env.chikusfa_db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?').bind(targetUser.id),
				env.chikusfa_db.prepare(`INSERT INTO user_history (id, user_id, action, changed_by) VALUES (?, ?, 'ACCOUNT_UNLOCKED', ?)`).bind(uhId, targetUser.id, authUser.id)
			]);

			return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}

	static transfer = UserTransferPromotionController.transfer;
	static promote = UserTransferPromotionController.promote;
	static getTransferHistory = UserTransferPromotionController.getTransferHistory;
	static getPromotionHistory = UserTransferPromotionController.getPromotionHistory;

	static async getHistory(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
		try {
			const targetId = params.id;
			const isSelf = authUser.id === targetId || authUser.userId === targetId;
			const isOwner = authUser.role === 'OWNER' || authUser.role === 'ADMIN';

			if (!isOwner && !isSelf) {
				const scope = await DataScopeService.getUserScope(env, authUser);
				if (!scope.authorizedUserIds.includes(targetId)) {
					return new Response(JSON.stringify({ error: 'Forbidden: You cannot view history for this user.' }), { status: 403 });
				}
			}

			const { results } = await env.chikusfa_db.prepare('SELECT * FROM user_history WHERE user_id = ? ORDER BY changed_at DESC').bind(targetId).all();
			return new Response(JSON.stringify(results || []), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}

	static async getAudit(request: Request, env: Env, authUser: AuthUser, params: { id: string }) {
		try {
			const id = params.id;
			const isSelf = authUser.id === id || authUser.userId === id;
			const isOwner = authUser.role === 'OWNER' || authUser.role === 'ADMIN';

			if (!isOwner && !isSelf) {
				const scope = await DataScopeService.getUserScope(env, authUser);
				if (!scope.authorizedUserIds.includes(id)) {
					return new Response(JSON.stringify({ error: 'Forbidden: You cannot view audit for this user.' }), { status: 403 });
				}
			}

			const { results: auditLogs } = await env.chikusfa_db
				.prepare(`
				SELECT id, timestamp, action, details, user_id, user_name
				FROM audit_logs
				WHERE module = 'auth' AND (user_id = ? OR entity_id = ?)
				ORDER BY timestamp DESC
				LIMIT 50
			`)
				.bind(id, id)
				.all();

			const { results: loginHistory } = await env.chikusfa_db
				.prepare(`
				SELECT id, login_time, ip_address, device_id, result, created_at
				FROM login_history
				WHERE user_id = ?
				ORDER BY login_time DESC
				LIMIT 50
			`)
				.bind(id)
				.all();

			const records: any[] = [];
			if (auditLogs && auditLogs.length > 0) {
				for (const a of auditLogs) {
					let parsedDetails: any = {};
					try {
						parsedDetails = typeof a.details === 'string' ? JSON.parse(a.details) : a.details || {};
					} catch (e) {}
					records.push({
						id: String(a.id),
						timestamp: a.timestamp,
						clientType: parsedDetails.clientType || 'web-admin',
						ipAddress: parsedDetails.ip || '-',
						deviceId: parsedDetails.deviceId || null,
						userAgent: parsedDetails.userAgent || '',
						action: a.action,
						result: 'SUCCESS',
					});
				}
			}

			if (loginHistory && loginHistory.length > 0) {
				for (const lh of loginHistory) {
					records.push({
						id: String(lh.id),
						timestamp: lh.login_time || lh.created_at,
						clientType: lh.device_id ? 'mobile-app' : 'web-admin',
						ipAddress: lh.ip_address || '-',
						deviceId: lh.device_id || null,
						userAgent: '',
						action: 'LOGIN',
						result: lh.result || 'SUCCESS',
					});
				}
			}

			records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

			return new Response(JSON.stringify(records), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}
}
