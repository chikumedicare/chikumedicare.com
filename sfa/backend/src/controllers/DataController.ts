import { Env, AuthUser } from '../types';
import { ServiceRegistry } from '../services/ServiceRegistry';
import { DataQueryBuilder } from './DataQueryBuilder';
import { DataSecurityGuard } from './DataSecurityGuard';
import { DataScopeService } from '../services/DataScopeService';
import { hasPermission, getRequiredPermission } from '../middleware/auth';

export class DataController {
  static async get(request: Request, env: Env, authUser: AuthUser, params: { collection: string }) {
    const collection = params.collection;
    const service = ServiceRegistry.get(collection);
    try {
      const scope = await DataScopeService.getUserScope(env, authUser);
      const url = new URL(request.url);
      const { query, params: queryParams, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery(
        collection,
        url,
        authUser,
        scope
      );

      if (isEarlyReturnEmpty) {
        return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
      }

      const results = await service.find(env, query, queryParams, authUser);
      return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      console.error(`[DataController.get] Error for ${collection}:`, err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async create(request: Request, env: Env, authUser: AuthUser, params: { collection: string }) {
    const collection = params.collection;
    const service = ServiceRegistry.get(collection);
    try {
      const requiredPerm = getRequiredPermission(collection);
      if (requiredPerm) {
        const allowed = await hasPermission(authUser.userId || authUser.id, authUser.role, requiredPerm, env);
        if (!allowed) {
          return new Response(
            JSON.stringify({ error: `Forbidden: Insufficient permissions for ${collection}.` }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const body = (await request.json()) as Record<string, any>;
      const scope = await DataScopeService.getUserScope(env, authUser);

      const aclError = DataSecurityGuard.verifyHierarchyAccess(collection, authUser, body, scope);
      if (aclError) return aclError;

      const rbacError = DataSecurityGuard.verifyHrMutationAuthorization(collection, authUser, 'CREATE', body, null, scope);
      if (rbacError) return rbacError;

      const approvalError = DataSecurityGuard.verifyApprovalEngineRouting(collection, authUser);
      if (approvalError) return approvalError;

      DataSecurityGuard.verifyGpsEnforcement(collection, request, body);

      const id = body.id || `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const result = await service.create(env, id, body, authUser);
      return new Response(JSON.stringify(result), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      const status = err.message.includes('already exists') ? 409 : 500;
      return new Response(JSON.stringify({ error: err.message }), { status });
    }
  }

  static async update(request: Request, env: Env, authUser: AuthUser, params: { collection: string; id: string }) {
    const { collection, id } = params;
    const service = ServiceRegistry.get(collection);
    try {
      const requiredPerm = getRequiredPermission(collection);
      if (requiredPerm) {
        const allowed = await hasPermission(authUser.userId || authUser.id, authUser.role, requiredPerm, env);
        if (!allowed) {
          return new Response(
            JSON.stringify({ error: `Forbidden: Insufficient permissions for ${collection}.` }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const body = (await request.json()) as Record<string, any>;
      const scope = await DataScopeService.getUserScope(env, authUser);

      const existingData = await service.findById(env, id);
      if (!existingData) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      }

      const readError = DataSecurityGuard.verifyResourceReadAccess(collection, existingData, authUser, scope);
      if (readError) return readError;

      const aclError = DataSecurityGuard.verifyHierarchyAccess(collection, authUser, body, scope);
      if (aclError) return aclError;

      const rbacError = DataSecurityGuard.verifyHrMutationAuthorization(collection, authUser, 'UPDATE', body, existingData, scope);
      if (rbacError) return rbacError;

      const approvalError = DataSecurityGuard.verifyApprovalEngineRouting(collection, authUser);
      if (approvalError) return approvalError;

      DataSecurityGuard.verifyGpsEnforcement(collection, request, body);

      if (collection === 'users' && existingData?.role === 'ADMIN' && (body.is_active === 0 || body.is_active === false)) {
        return new Response(JSON.stringify({ error: 'Forbidden: Cannot deactivate ADMIN users' }), { status: 403 });
      }

      const result = await service.update(env, id, body, authUser, existingData);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      const status = err.message.includes('already exists') ? 409 : 500;
      return new Response(JSON.stringify({ error: err.message }), { status });
    }
  }

  static async delete(request: Request, env: Env, authUser: AuthUser, params: { collection: string; id: string }) {
    const { collection, id } = params;
    const service = ServiceRegistry.get(collection);
    try {
      const requiredPerm = getRequiredPermission(collection);
      if (requiredPerm) {
        const allowed = await hasPermission(authUser.userId || authUser.id, authUser.role, requiredPerm, env);
        if (!allowed) {
          return new Response(
            JSON.stringify({ error: `Forbidden: Insufficient permissions for ${collection}.` }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      const scope = await DataScopeService.getUserScope(env, authUser);
      const existingData = await service.findById(env, id);
      if (!existingData) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
      }

      const readError = DataSecurityGuard.verifyResourceReadAccess(collection, existingData, authUser, scope);
      if (readError) return readError;

      const aclError = DataSecurityGuard.verifyHierarchyAccess(collection, authUser, existingData, scope);
      if (aclError) return aclError;

      const rbacError = DataSecurityGuard.verifyHrMutationAuthorization(collection, authUser, 'DELETE', null, existingData, scope);
      if (rbacError) return rbacError;

      const approvalError = DataSecurityGuard.verifyApprovalEngineRouting(collection, authUser);
      if (approvalError) return approvalError;

      const result = await service.delete(env, id, authUser);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  static async batchSaveTargets(request: Request, env: Env, authUser: AuthUser) {
    try {
      const allowed = await hasPermission(authUser.userId || authUser.id, authUser.role, 'MANAGE_TARGETS', env);
      if (!allowed) {
        return new Response(JSON.stringify({ error: 'Forbidden: Insufficient permissions for targets.' }), { status: 403 });
      }

      const body = (await request.json()) as any;
      const targets = Array.isArray(body) ? body : body.targets || [];
      const service = ServiceRegistry.get('sales_targets');
      const results = [];
      for (const t of targets) {
        const id = t.id || `tar_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const res = await service.create(env, id, t, authUser);
        results.push(res);
      }
      return new Response(JSON.stringify({ success: true, count: results.length }), { headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
}
