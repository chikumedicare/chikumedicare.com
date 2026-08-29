import { AuthUser } from '../types';
import { DataScopeService, UserDataScope } from '../services/DataScopeService';

export class DataSecurityGuard {
  /**
   * Verifies whether the authenticated user has permission to mutate a record in the target territory or for the target user.
   */
  static verifyHierarchyAccess(
    collection: string,
    authUser: AuthUser,
    body: Record<string, any>,
    scope?: UserDataScope
  ): Response | null {
    if (authUser.role === 'ADMIN' || authUser.role === 'OWNER' || scope?.isUnrestricted) {
      return null;
    }

    const isHierarchyTable = [
      'doctors', 'chemists', 'stockists', 'sales_targets', 'dcr_entries',
      'calls', 'tour_plans', 'employees', 'users', 'leave_applications',
      'leave_allocations', 'expenses', 'payroll', 'loans', 'user_covering_hq',
      'user_covering_area', 'areas', 'beats', 'targets', 'sponsorships'
    ].includes(collection);

    if (isHierarchyTable) {
      const permittedHqIds = scope?.permittedHqIds || [
        authUser.hqId,
        ...(authUser.coveringHqIds || []),
      ].filter(Boolean) as string[];

      const payloadHqId = body.hq_id || body.employee_hq_id || body.target_hq_id;

      if (payloadHqId && !permittedHqIds.includes(payloadHqId)) {
        return new Response(
          JSON.stringify({
            error: `Forbidden: Cannot modify data for territory ${payloadHqId} outside your authorized scope.`,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check division authorization
      const payloadDivisionId = body.division_id;
      if (payloadDivisionId && scope?.permittedDivisionIds && scope.permittedDivisionIds.length > 0) {
        if (!scope.permittedDivisionIds.includes(payloadDivisionId)) {
          return new Response(
            JSON.stringify({
              error: `Forbidden: Cannot modify data for division ${payloadDivisionId} outside your authorized division scope.`,
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Check user/employee ownership
      const payloadUserId = body.user_id || body.employee_id;
      if (payloadUserId) {
        const isAuthorizedUser = scope?.authorizedUserIds?.includes(payloadUserId) ||
                                 scope?.authorizedEmpCodes?.includes(payloadUserId) ||
                                 payloadUserId === authUser.id ||
                                 payloadUserId === authUser.userId;
        if (!isAuthorizedUser && !permittedHqIds.includes(payloadHqId || '')) {
          return new Response(
            JSON.stringify({
              error: `Forbidden: Cannot modify records for user/employee ${payloadUserId} outside your hierarchy.`,
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Check employee code ownership for employees collection
      if (collection === 'employees' && body.emp_code) {
        const isAuthorizedEmp = scope?.authorizedEmpCodes?.includes(body.emp_code) ||
                                body.emp_code === scope?.selfEmpCode;
        if (!isAuthorizedEmp && scope && !scope.isUnrestricted && (scope.authorizedEmpCodes?.length > 0)) {
          return new Response(
            JSON.stringify({
              error: `Forbidden: Cannot modify employee code ${body.emp_code} outside your authorized scope.`,
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    return null;
  }

  /**
   * Enforces independent backend RBAC rules on all HR and administrative mutations.
   */
  static verifyHrMutationAuthorization(
    collection: string,
    authUser: AuthUser,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    body: Record<string, any> | null,
    existingData?: Record<string, any> | null,
    scope?: UserDataScope
  ): Response | null {
    const isUnrestricted = authUser.role === 'ADMIN' || authUser.role === 'OWNER';

    // 1. Immutable system audit tables are permanently blocked from generic mutations
    if (['user_history', 'role_change_history', 'audit_logs', 'login_history', 'system_sequences'].includes(collection)) {
      return new Response(
        JSON.stringify({ error: `Forbidden: Collection '${collection}' is an immutable system audit log.` }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Direct mutation of approvals table blocked (must use /api/approvals routes)
    if (collection === 'approvals' && !isUnrestricted) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Approval workflow must be processed via /api/approvals endpoints.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Employee Master Lifecycle
    if (collection === 'employees' && !isUnrestricted) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only administrators can create, modify, or delete employee master records.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. User Master Lifecycle
    if (collection === 'users' && !isUnrestricted) {
      if (action === 'CREATE' || action === 'DELETE') {
        return new Response(
          JSON.stringify({ error: `Forbidden: Only administrators can ${action.toLowerCase()} user accounts.` }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'UPDATE') {
        const isSelf = existingData && (existingData.id === authUser.id || existingData.user_id === authUser.userId);
        if (!isSelf) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Only administrators can update other user accounts.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const privilegedFields = [
          'role', 'is_active', 'hq_id', 'division_id', 'emp_code',
          'manager_id', 'asm_id', 'rsm_id', 'zsm_id', 'vp_id', 'admin_id',
          'reports_to_id', 'reports_to_ids', 'primary_zone_id', 'primary_state_id',
          'primary_area_id', 'hierarchy_status', 'status', 'password_hash'
        ];

        for (const f of privilegedFields) {
          if (body && f in body && body[f] !== existingData?.[f]) {
            return new Response(
              JSON.stringify({ error: `Forbidden: Non-administrators cannot modify privileged field '${f}'.` }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
        }
      }
    }

    // 5. Leave Allocations (Quotas)
    if (collection === 'leave_allocations' && !isUnrestricted) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only administrators can allocate or modify annual leave quotas.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Compensation, DA Rates, Payroll, and Loans
    if (['da_rates', 'sfc_rates', 'payroll', 'loans'].includes(collection) && !isUnrestricted) {
      return new Response(
        JSON.stringify({ error: `Forbidden: Only administrators can manage ${collection}.` }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. Geography Masters and Dynamic Coverage Mapping
    if (['zones', 'states', 'hqs', 'areas', 'beats', 'divisions', 'user_covering_hq', 'user_covering_area'].includes(collection) && !isUnrestricted) {
      return new Response(
        JSON.stringify({ error: `Forbidden: Only administrators can manage ${collection}.` }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 8. Leave Applications Workflow Integrity
    if (collection === 'leave_applications') {
      if (action === 'CREATE' && !isUnrestricted) {
        const empId = body?.employee_id;
        const isSelf = empId === authUser.id || empId === authUser.userId || (scope?.selfEmpCode && empId === scope.selfEmpCode);
        if (!isSelf) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: You can only apply for leave on your own behalf.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (body?.status && body.status === 'APPROVED') {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Cannot create pre-approved leave applications. Must be submitted for manager approval.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      if (action === 'UPDATE' && !isUnrestricted) {
        if (body?.status && ['APPROVED', 'REJECTED'].includes(body.status) && body.status !== existingData?.status) {
          return new Response(
            JSON.stringify({ error: 'Forbidden: Leave approvals and rejections must be executed via the Approval Engine.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // 9. Tour Plans Workflow Integrity
    if (collection === 'tour_plans' && action === 'UPDATE' && !isUnrestricted) {
      if (body?.status && ['APPROVED', 'REJECTED'].includes(body.status) && body.status !== existingData?.status) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Tour plan approvals and rejections must be executed via the Approval Engine.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 10. Expenses Workflow Integrity
    if (collection === 'expenses' && action === 'UPDATE' && !isUnrestricted) {
      if (body?.status && ['APPROVED', 'REJECTED', 'PAID'].includes(body.status) && body.status !== existingData?.status) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Expense approvals and disbursements must be processed via the Expense Approval Engine.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return null;
  }

  /**
   * Verifies whether the user is authorized to read a single resource item.
   */
  static verifyResourceReadAccess(
    collection: string,
    entity: Record<string, any>,
    authUser: AuthUser,
    scope: UserDataScope
  ): Response | null {
    if (authUser.role === 'ADMIN' || authUser.role === 'OWNER' || scope.isUnrestricted) {
      return null;
    }

    const allowed = DataScopeService.canAccessResource(collection, entity, authUser, scope);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: You do not have permission to view this resource.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return null;
  }

  /**
   * Enforces that non-admin field modifications route through the Approval Engine.
   */
  static verifyApprovalEngineRouting(collection: string, authUser: AuthUser): Response | null {
    const approvalRequiredTables = ['doctors', 'chemists', 'stockists', 'tour_plans'];
    if (approvalRequiredTables.includes(collection) && authUser.role !== 'ADMIN' && authUser.role !== 'OWNER') {
      return new Response(
        JSON.stringify({
          error: `Forbidden: Direct modifications to ${collection} must be routed through the Approval Engine.`,
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return null;
  }

  /**
   * Strict GPS enforcement verification for DCR call entries.
   */
  static verifyGpsEnforcement(collection: string, request: Request, body: Record<string, any>): void {
    const isGpsEnabled = request.headers.get('x-gps-enabled') === 'true';
    if (collection === 'dcr_entries' && isGpsEnabled) {
      const checkCalls = (callsJson: any) => {
        if (!callsJson) return;
        let calls = [];
        if (typeof callsJson === 'string') {
          try {
            calls = JSON.parse(callsJson);
          } catch (e) {}
        } else if (Array.isArray(callsJson)) {
          calls = callsJson;
        }
        for (const call of calls) {
          if (call && typeof call === 'object') {
            if (('latitude' in call || 'lat' in call) && !call.latitude && !call.lat) {
              throw new Error('400 Bad Request: GPS is strictly enforced. Call coordinates are missing.');
            }
          }
        }
      };
      checkCalls(body.dr_calls);
      checkCalls(body.chemist_calls);
      checkCalls(body.stockist_calls);
    }
  }
}

