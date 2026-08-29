import { AuthUser } from '../types';
import { ALLOWED_TABLES } from '../utils/constants';
import { DataScopeService, UserDataScope } from '../services/DataScopeService';
import { applySearchFilter, applySortingAndPagination } from '../utils/querySchemaConstants';

export interface DataQueryParams {
  query: string;
  params: any[];
  isEarlyReturnEmpty: boolean;
}

export class DataQueryBuilder {
  static buildSelectQuery(
    collection: string,
    url: URL,
    authUser: AuthUser,
    scope?: UserDataScope
  ): DataQueryParams {
    // 1. Table Whitelisting
    if (!ALLOWED_TABLES.has(collection)) {
      throw new Error(`Forbidden: Table '${collection}' is not accessible.`);
    }

    const search = url.searchParams.get('search');
    const hqIdsParam = url.searchParams.get('hqIds');
    const hqId = url.searchParams.get('hqId');
    const employeeId = url.searchParams.get('employeeId');
    const divisionId = url.searchParams.get('divisionId');
    const type = url.searchParams.get('type');
    const fy = url.searchParams.get('fy');
    const dateParam = url.searchParams.get('date');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    let query = `SELECT * FROM ${collection} WHERE 1=1`;
    const queryParams: any[] = [];

    // 2. Active status filter
    if (!includeInactive && collection !== 'user_history' && collection !== 'role_change_history' && collection !== 'audit_logs' && collection !== 'login_history') {
      query += ` AND is_active = 1`;
    }

    // 3. Date range filters
    if (startDate) {
      const dateCol = collection === 'leave_applications' ? 'from_date' : 'date';
      query += ` AND ${dateCol} >= ?`;
      queryParams.push(startDate);
    }
    if (endDate) {
      const dateCol = collection === 'leave_applications' ? 'to_date' : 'date';
      query += ` AND ${dateCol} <= ?`;
      queryParams.push(endDate);
    }

    const isUnrestricted = authUser.role === 'ADMIN' || authUser.role === 'OWNER' || scope?.isUnrestricted;

    // 4. Server-Side Scope Enforcement (Zero Client Trust)

    // --- A. EMPLOYEES ---
    if (collection === 'employees') {
      if (!isUnrestricted) {
        const permittedHqs = scope?.permittedHqIds || [];
        const authorizedEmpCodes = scope?.authorizedEmpCodes || [];

        const scopeResult = DataScopeService.evaluateHqScope(permittedHqs, hqId, hqIdsParam);
        const targetHqs = scopeResult.isEarlyReturnEmpty ? [] : scopeResult.targetHqIds;

        if (targetHqs.length > 0 && authorizedEmpCodes.length > 0) {
          const hqPlaceholders = targetHqs.map(() => '?').join(',');
          const codePlaceholders = authorizedEmpCodes.map(() => '?').join(',');
          query += ` AND (emp_code IN (${codePlaceholders}) OR emp_code IN (SELECT emp_code FROM users WHERE hq_id IN (${hqPlaceholders}) AND emp_code IS NOT NULL))`;
          queryParams.push(...authorizedEmpCodes, ...targetHqs);
        } else if (authorizedEmpCodes.length > 0) {
          const codePlaceholders = authorizedEmpCodes.map(() => '?').join(',');
          query += ` AND emp_code IN (${codePlaceholders})`;
          queryParams.push(...authorizedEmpCodes);
        } else if (targetHqs.length > 0) {
          const hqPlaceholders = targetHqs.map(() => '?').join(',');
          query += ` AND emp_code IN (SELECT emp_code FROM users WHERE hq_id IN (${hqPlaceholders}) AND emp_code IS NOT NULL)`;
          queryParams.push(...targetHqs);
        } else {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }

        if (divisionId) {
          if (scope?.permittedDivisionIds.length && !scope.permittedDivisionIds.includes(divisionId)) {
            return { query, params: queryParams, isEarlyReturnEmpty: true };
          }
          query += ` AND emp_code IN (SELECT emp_code FROM users WHERE division_id = ?)`;
          queryParams.push(divisionId);
        }
      } else {
        if (hqId) {
          query += ` AND emp_code IN (SELECT emp_code FROM users WHERE hq_id = ?)`;
          queryParams.push(hqId.trim());
        }
        if (divisionId) {
          query += ` AND emp_code IN (SELECT emp_code FROM users WHERE division_id = ?)`;
          queryParams.push(divisionId.trim());
        }
      }
    }

    // --- B. USERS ---
    else if (collection === 'users') {
      if (!isUnrestricted) {
        const permittedHqs = scope?.permittedHqIds || [];
        const authorizedUserIds = scope?.authorizedUserIds || [];

        const scopeResult = DataScopeService.evaluateHqScope(permittedHqs, hqId, hqIdsParam);
        const targetHqs = scopeResult.isEarlyReturnEmpty ? [] : scopeResult.targetHqIds;

        if (targetHqs.length > 0 && authorizedUserIds.length > 0) {
          const hqPlaceholders = targetHqs.map(() => '?').join(',');
          const userPlaceholders = authorizedUserIds.map(() => '?').join(',');
          query += ` AND (id IN (${userPlaceholders}) OR user_id IN (${userPlaceholders}) OR hq_id IN (${hqPlaceholders}))`;
          queryParams.push(...authorizedUserIds, ...authorizedUserIds, ...targetHqs);
        } else if (authorizedUserIds.length > 0) {
          const userPlaceholders = authorizedUserIds.map(() => '?').join(',');
          query += ` AND (id IN (${userPlaceholders}) OR user_id IN (${userPlaceholders}))`;
          queryParams.push(...authorizedUserIds, ...authorizedUserIds);
        } else if (targetHqs.length > 0) {
          const hqPlaceholders = targetHqs.map(() => '?').join(',');
          query += ` AND hq_id IN (${hqPlaceholders})`;
          queryParams.push(...targetHqs);
        } else {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }

        if (divisionId) {
          if (scope?.permittedDivisionIds.length && !scope.permittedDivisionIds.includes(divisionId)) {
            return { query, params: queryParams, isEarlyReturnEmpty: true };
          }
          query += ` AND division_id = ?`;
          queryParams.push(divisionId);
        }
      } else {
        if (hqId) {
          query += ` AND hq_id = ?`;
          queryParams.push(hqId.trim());
        }
        if (divisionId) {
          query += ` AND division_id = ?`;
          queryParams.push(divisionId.trim());
        }
      }
    }

    // --- C. LEAVE APPLICATIONS ---
    else if (collection === 'leave_applications') {
      if (!isUnrestricted) {
        const permittedHqs = scope?.permittedHqIds || [];
        const authorizedIdsAndCodes = Array.from(new Set([...(scope?.authorizedUserIds || []), ...(scope?.authorizedEmpCodes || [])]));

        const scopeResult = DataScopeService.evaluateHqScope(permittedHqs, hqId, hqIdsParam);
        const targetHqs = scopeResult.isEarlyReturnEmpty ? [] : scopeResult.targetHqIds;

        if (targetHqs.length > 0 && authorizedIdsAndCodes.length > 0) {
          const hqPlaceholders = targetHqs.map(() => '?').join(',');
          const idPlaceholders = authorizedIdsAndCodes.map(() => '?').join(',');
          query += ` AND (employee_id IN (${idPlaceholders}) OR (hq_id IS NOT NULL AND hq_id IN (${hqPlaceholders})))`;
          queryParams.push(...authorizedIdsAndCodes, ...targetHqs);
        } else if (authorizedIdsAndCodes.length > 0) {
          const idPlaceholders = authorizedIdsAndCodes.map(() => '?').join(',');
          query += ` AND employee_id IN (${idPlaceholders})`;
          queryParams.push(...authorizedIdsAndCodes);
        } else if (targetHqs.length > 0) {
          const hqPlaceholders = targetHqs.map(() => '?').join(',');
          query += ` AND hq_id IN (${hqPlaceholders})`;
          queryParams.push(...targetHqs);
        } else {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }
      } else {
        if (hqId) {
          query += ` AND hq_id = ?`;
          queryParams.push(hqId.trim());
        }
      }
    }

    // --- D. LEAVE ALLOCATIONS ---
    else if (collection === 'leave_allocations') {
      if (!isUnrestricted) {
        const permittedHqs = scope?.permittedHqIds || [];
        const authorizedIdsAndCodes = Array.from(new Set([...(scope?.authorizedUserIds || []), ...(scope?.authorizedEmpCodes || [])]));

        const scopeResult = DataScopeService.evaluateHqScope(permittedHqs, hqId, hqIdsParam);
        const targetHqs = scopeResult.isEarlyReturnEmpty ? [] : scopeResult.targetHqIds;

        if (targetHqs.length > 0 && authorizedIdsAndCodes.length > 0) {
          const hqPlaceholders = targetHqs.map(() => '?').join(',');
          const idPlaceholders = authorizedIdsAndCodes.map(() => '?').join(',');
          query += ` AND (employee_id IN (${idPlaceholders}) OR employee_id IN (SELECT emp_code FROM users WHERE hq_id IN (${hqPlaceholders})))`;
          queryParams.push(...authorizedIdsAndCodes, ...targetHqs);
        } else if (authorizedIdsAndCodes.length > 0) {
          const idPlaceholders = authorizedIdsAndCodes.map(() => '?').join(',');
          query += ` AND employee_id IN (${idPlaceholders})`;
          queryParams.push(...authorizedIdsAndCodes);
        } else {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }
      }
    }

    // --- E. FINANCIAL RECORDS (EXPENSES, PAYROLL, LOANS) ---
    else if (['expenses', 'payroll', 'loans'].includes(collection)) {
      if (!isUnrestricted) {
        const authorizedIdsAndCodes = Array.from(new Set([...(scope?.authorizedUserIds || []), ...(scope?.authorizedEmpCodes || [])]));
        if (authorizedIdsAndCodes.length === 0) {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }
        const idPlaceholders = authorizedIdsAndCodes.map(() => '?').join(',');
        query += ` AND employee_id IN (${idPlaceholders})`;
        queryParams.push(...authorizedIdsAndCodes);
      }
    }

    // --- F. USER HISTORIES & AUDIT LOGS ---
    else if (['user_history', 'role_change_history', 'user_covering_hq', 'user_covering_area', 'audit_logs', 'login_history'].includes(collection)) {
      if (!isUnrestricted) {
        const authorizedUserIds = scope?.authorizedUserIds || [];
        if (authorizedUserIds.length === 0) {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }
        const idPlaceholders = authorizedUserIds.map(() => '?').join(',');
        query += ` AND user_id IN (${idPlaceholders})`;
        queryParams.push(...authorizedUserIds);
      }
    }

    // --- G. APPROVALS ---
    else if (collection === 'approvals') {
      if (!isUnrestricted) {
        const authorizedUserIds = scope?.authorizedUserIds || [];
        const permittedHqs = scope?.permittedHqIds || [];
        if (authorizedUserIds.length === 0 && permittedHqs.length === 0) {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }
        const userPlaceholders = authorizedUserIds.map(() => '?').join(',');
        if (permittedHqs.length > 0 && authorizedUserIds.length > 0) {
          const hqPlaceholders = permittedHqs.map(() => '?').join(',');
          query += ` AND (manager_id IN (${userPlaceholders}) OR requested_by IN (${userPlaceholders}) OR requester_hq_id IN (${hqPlaceholders}))`;
          queryParams.push(...authorizedUserIds, ...authorizedUserIds, ...permittedHqs);
        } else if (authorizedUserIds.length > 0) {
          query += ` AND (manager_id IN (${userPlaceholders}) OR requested_by IN (${userPlaceholders}))`;
          queryParams.push(...authorizedUserIds, ...authorizedUserIds);
        }
      }
    }

    // --- H. FIELD / COMMERCIAL TABLES ---
    else {
      const isHierarchyTable = [
        'doctors', 'chemists', 'stockists', 'sales_targets', 'sales_entries',
        'dcr_entries', 'calls', 'tour_plans', 'sponsorships',
        'areas', 'beats', 'targets'
      ].includes(collection);

      const hqCol = collection === 'dcr_entries' ? 'employee_hq_id' : 'hq_id';

      if (isHierarchyTable && !isUnrestricted) {
        const isSelfRequest =
          employeeId &&
          (scope?.authorizedUserIds.includes(employeeId) || employeeId === authUser.id || employeeId === authUser.userId);

        if (!isSelfRequest) {
          const permittedHqIds = scope?.permittedHqIds || [
            authUser.hqId,
            ...(authUser.coveringHqIds || []),
          ].filter(Boolean) as string[];

          // Apply strict intersection rule: Client filters can ONLY NARROW scope, NEVER EXPAND it.
          const scopeResult = DataScopeService.evaluateHqScope(permittedHqIds, hqId, hqIdsParam);
          if (scopeResult.isEarlyReturnEmpty) {
            return { query, params: queryParams, isEarlyReturnEmpty: true };
          }

          const placeholders = scopeResult.targetHqIds.map(() => '?').join(',');
          query += ` AND ${hqCol} IN (${placeholders})`;
          queryParams.push(...scopeResult.targetHqIds);
        }
      } else if (collection !== 'divisions' && collection !== 'zones' && collection !== 'states' && collection !== 'holidays' && collection !== 'products' && collection !== 'sfc_rates' && collection !== 'da_rates' && collection !== 'head_office' && collection !== 'head_offices') {
        // Unrestricted admin or master table with optional client filter
        if (hqIdsParam && hqIdsParam.trim().length > 0) {
          const ids = hqIdsParam.split(',').map((s) => s.trim()).filter(Boolean);
          if (ids.length > 0) {
            const placeholders = ids.map(() => '?').join(',');
            query += ` AND ${hqCol} IN (${placeholders})`;
            queryParams.push(...ids);
          }
        } else if (hqId && hqId.trim().length > 0) {
          query += ` AND ${hqCol} = ?`;
          queryParams.push(hqId.trim());
        }
      }
    }

    // 5. User / Employee filter (Optional client refinement)
    if (employeeId) {
      if (!isUnrestricted) {
        // Enforce that client cannot request data for a user outside their authorized scope
        const authorized = (scope?.authorizedUserIds || []).includes(employeeId) ||
                           (scope?.authorizedEmpCodes || []).includes(employeeId) ||
                           employeeId === authUser.id ||
                           employeeId === authUser.userId;
        if (!authorized) {
          return { query, params: queryParams, isEarlyReturnEmpty: true };
        }
      }

      const userIdTables = [
        'dcr_entries', 'login_history', 'user_history', 'password_history',
        'role_change_history', 'user_covering_hq', 'user_covering_area'
      ];
      const empCol = userIdTables.includes(collection) ? 'user_id' : 'employee_id';
      query += ` AND ${empCol} = ?`;
      queryParams.push(employeeId);
    }

    // 6. Type & FY filters
    if (type) {
      query += ` AND type = ?`;
      queryParams.push(type);
    }

    if (fy) {
      const fyCol = collection === 'leave_allocations' ? 'year' : 'fy';
      query += ` AND ${fyCol} = ?`;
      queryParams.push(fy);
    }

    if (dateParam) {
      query += ` AND date = ?`;
      queryParams.push(dateParam);
    }

    // 7. Apply search filters
    query = applySearchFilter(query, queryParams, collection, search);

    // 8 & 9. Apply sorting & pagination
    query = applySortingAndPagination(query, queryParams, collection, url);

    return { query, params: queryParams, isEarlyReturnEmpty: false };
  }
}

