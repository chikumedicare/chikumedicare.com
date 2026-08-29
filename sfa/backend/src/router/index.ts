import { Env, AuthUser } from '../types';
import { AuthController } from '../controllers/AuthController';
import { AppVersionController } from '../controllers/AppVersionController';
import { DataController } from '../controllers/DataController';
import { ApprovalController } from '../controllers/ApprovalController';
import { UserController } from '../controllers/UserController';
import { getAuthUser, getRequiredPermission, hasPermission } from '../middleware/auth';
import { NotificationController } from '../controllers/NotificationController';
import { StorageController } from '../controllers/StorageController';
import { ALLOWED_TABLES } from '../utils/constants';
import { getCurrentFY } from '../utils/helpers';

type RouteHandler = (req: Request, env: Env, authUser?: any, params?: any) => Promise<Response>;

interface Route {
	method: string;
	pattern: RegExp;
	handler: RouteHandler;
	requiresAuth: boolean;
	paramNames: string[];
}

export class Router {
	private routes: Route[] = [];

	add(method: string, path: string, handler: RouteHandler, requiresAuth = true) {
		const paramNames: string[] = [];
		const regexPath = path.replace(/:([^/]+)/g, (_, paramName) => {
			paramNames.push(paramName);
			return '([^/]+)';
		});
		this.routes.push({
			method,
			pattern: new RegExp(`^${regexPath}$`),
			handler,
			requiresAuth,
			paramNames
		});
	}

	async handle(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		const requestedFY = request.headers.get('x-financial-year');
		const systemFY = getCurrentFY();

		
		// CSRF Protection for state-modifying requests
		if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) && !path.startsWith('/api/login')) {
			const hasCookie = Boolean(request.headers.get('Cookie'));
			const customHeader = request.headers.get('x-requested-with') || request.headers.get('x-csrf-protection') || request.headers.get('authorization');
			if (hasCookie && !customHeader) {
				return new Response(JSON.stringify({ error: '403 Forbidden: Missing CSRF protection header.' }), {
					status: 403,
					headers: { 'Content-Type': 'application/json' },
				});
			}
		}

		if (['POST', 'PUT', 'DELETE'].includes(method) && !path.startsWith('/api/login') && !path.startsWith('/api/refresh')) {
			if (requestedFY && requestedFY !== systemFY) {
				return new Response(JSON.stringify({ error: `423 Locked: Cannot modify data outside the active Financial Year (${systemFY}).` }), { status: 423, headers: { 'Content-Type': 'application/json' } });
			}
		}

		let authUser: AuthUser | null = null;
		let authChecked = false;

		for (const route of this.routes) {
			if (route.method !== method) continue;
			
			const match = path.match(route.pattern);
			if (match) {
				const params: any = {};
				route.paramNames.forEach((name, i) => {
					params[name] = match[i + 1];
				});

				if (route.requiresAuth) {
					if (!authChecked) {
						authUser = await getAuthUser(request, env);
						authChecked = true;
					}
					if (!authUser) {
						return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
					}

					// Generic Data Permission Checks
					if (params.collection) {
						if (!ALLOWED_TABLES.has(params.collection)) {
							return new Response(JSON.stringify({ error: 'Invalid collection' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
						}
						const requiredPerm = getRequiredPermission(params.collection);
						if (requiredPerm) {
							// Bypass check for GET on certain master tables
							if (method === 'GET') {
								const readOnlyBypass = [
									'zones', 'states', 'hqs', 'areas', 'beats', 'users', 'products', 'holidays',
									'targets', 'employees', 'divisions', 'doctors', 'chemists', 'stockists',
									'sfc_rates', 'da_rates', 'leave_applications', 'leave_allocations', 'expenses',
									'payroll', 'loans', 'user_history', 'role_change_history', 'audit_logs',
									'login_history', 'user_covering_hq', 'user_covering_area', 'approvals', 'head_office', 'head_offices'
								];
								if (!readOnlyBypass.includes(params.collection)) {
									const hasPerm = await hasPermission(String(authUser.id), String(authUser.role), requiredPerm, env);
									if (!hasPerm) return new Response(JSON.stringify({ error: `Forbidden: Requires ${requiredPerm} permission` }), { status: 403, headers: { 'Content-Type': 'application/json' } });
								}
							} else {
								const hasPerm = await hasPermission(String(authUser.id), String(authUser.role), requiredPerm, env);
								if (!hasPerm) return new Response(JSON.stringify({ error: `Forbidden: Requires ${requiredPerm} permission` }), { status: 403, headers: { 'Content-Type': 'application/json' } });
							}
						}
					}
				}

				return await route.handler(request, env, authUser, params);
			}
		}

		return new Response('Not Found', { status: 404 });
	}
}

export const router = new Router();

// Public Routes
router.add('GET', '/', async () => new Response('ChikuSFA Backend Live'), false);
router.add('POST', '/api/login', AuthController.login, false);
router.add('POST', '/api/refresh', AuthController.refresh, false);
router.add('POST', '/api/logout', AuthController.logout, false);
router.add('GET', '/api/app-version/latest', AppVersionController.getLatest, false);

// Auth & Session
router.add('GET', '/api/verify', AuthController.verify, true);

// Users Custom Routes
router.add('POST', '/api/users/:id/reset-password', UserController.resetPassword, true);
router.add('POST', '/api/users/:id/reset-device', UserController.resetDevice, true);
router.add('POST', '/api/users/:id/unlock', UserController.unlock, true);
router.add('POST', '/api/users/:id/transfer', UserController.transfer, true);
router.add('POST', '/api/users/:id/promote', UserController.promote, true);
router.add('GET', '/api/users/history/transfers', UserController.getTransferHistory, true);
router.add('GET', '/api/users/history/promotions', UserController.getPromotionHistory, true);
router.add('GET', '/api/users/:id/history', UserController.getHistory, true);
router.add('GET', '/api/users/:id/audit', UserController.getAudit, true);

// Approvals Custom Routes
router.add('POST', '/api/approvals/request', ApprovalController.request, true);
router.add('GET', '/api/approvals/pending', ApprovalController.getPending, true);
router.add('GET', '/api/approvals/my', ApprovalController.getMy, true);
router.add('DELETE', '/api/approvals/my/:id', ApprovalController.deleteMy, true);
router.add('PUT', '/api/approvals/my/:id', ApprovalController.updateMy, true);
router.add('POST', '/api/approvals/action', ApprovalController.action, true);
router.add('POST', '/api/approvals/batch-action', ApprovalController.batchAction, true);
router.add('POST', '/api/target/batch-save', DataController.batchSaveTargets, true);

// Notification Custom Routes
router.add('POST', '/api/devices/register', NotificationController.registerDevice, true);
router.add('POST', '/api/devices/unregister', NotificationController.unregisterDevice, true);
router.add('POST', '/api/notifications/send', NotificationController.sendNotification, true);

// R2 Storage Routes
router.add('POST', '/api/upload', StorageController.upload, true);
router.add('GET', '/api/files/:filename', StorageController.getFile, false);
router.add('DELETE', '/api/files/:filename', StorageController.deleteFile, true);

// Generic Data Routes (must be defined after specific routes to avoid matching conflicts, though regex handles most cases cleanly)
router.add('GET', '/api/data/:collection', DataController.get, true);
router.add('POST', '/api/data/:collection', DataController.create, true);
router.add('PUT', '/api/data/:collection/:id', DataController.update, true);
router.add('DELETE', '/api/data/:collection/:id', DataController.delete, true);
