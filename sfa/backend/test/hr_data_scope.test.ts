import { describe, it, expect } from 'vitest';
import { DataScopeService, UserDataScope } from '../src/services/DataScopeService';
import { HierarchyService } from '../src/services/HierarchyService';
import { UserService } from '../src/services/UserService';
import { DataService } from '../src/services/DataService';
import { AuthService } from '../src/services/AuthService';
import { AuthController } from '../src/controllers/AuthController';
import { getAuthUser } from '../src/middleware/auth';
import { DataQueryBuilder } from '../src/controllers/DataQueryBuilder';
import { DataSecurityGuard } from '../src/controllers/DataSecurityGuard';
import { UserController } from '../src/controllers/UserController';
import { ApprovalController } from '../src/controllers/ApprovalController';
import { ApprovalRepository } from '../src/repositories/ApprovalRepository';
import { AuthUser } from '../src/types';

describe('DataScopeService Tests', () => {
  describe('evaluateHqScope (Zero Client Trust Intersection)', () => {
    const permittedHqs = ['HQ_INDORE', 'HQ_BHOPAL', 'HQ_UJJAIN'];

    it('defaults to all permitted HQs when no client filter is passed', () => {
      const res = DataScopeService.evaluateHqScope(permittedHqs, null, null);
      expect(res.isEarlyReturnEmpty).toBe(false);
      expect(res.targetHqIds).toEqual(permittedHqs);
    });

    it('narrows scope when client requests a permitted single HQ', () => {
      const res = DataScopeService.evaluateHqScope(permittedHqs, 'HQ_INDORE', null);
      expect(res.isEarlyReturnEmpty).toBe(false);
      expect(res.targetHqIds).toEqual(['HQ_INDORE']);
    });

    it('returns empty when client requests an unpermitted single HQ (Expansion Attack)', () => {
      const res = DataScopeService.evaluateHqScope(permittedHqs, 'HQ_DELHI', null);
      expect(res.isEarlyReturnEmpty).toBe(true);
      expect(res.targetHqIds).toEqual([]);
    });

    it('intersects permitted HQs with multi-HQ client request', () => {
      const res = DataScopeService.evaluateHqScope(permittedHqs, null, 'HQ_INDORE,HQ_MUMBAI,HQ_UJJAIN');
      expect(res.isEarlyReturnEmpty).toBe(false);
      expect(res.targetHqIds).toEqual(['HQ_INDORE', 'HQ_UJJAIN']);
    });

    it('returns empty when multi-HQ client request has zero overlap with permitted scope', () => {
      const res = DataScopeService.evaluateHqScope(permittedHqs, null, 'HQ_MUMBAI,HQ_PUNE,HQ_JAIPUR');
      expect(res.isEarlyReturnEmpty).toBe(true);
      expect(res.targetHqIds).toEqual([]);
    });
  });

  describe('canAccessResource', () => {
    const mrAuthUser: AuthUser = {
      id: 'usr_mr_1',
      userId: 'MR_001',
      role: 'MR',
      fullName: 'Medical Rep 1',
      hqId: 'HQ_INDORE',
    };

    const mrScope: UserDataScope = {
      isUnrestricted: false,
      selfId: 'usr_mr_1',
      selfUserId: 'MR_001',
      selfEmpCode: 'CHIKU001',
      permittedHqIds: ['HQ_INDORE'],
      permittedAreaIds: ['AREA_1'],
      permittedDivisionIds: ['DIV_CARDIO'],
      subordinateUserIds: [],
      subordinateEmpCodes: [],
      authorizedUserIds: ['usr_mr_1', 'MR_001'],
      authorizedEmpCodes: ['CHIKU001'],
    };

    it('allows MR to access their own employee record', () => {
      const allowed = DataScopeService.canAccessResource('employees', { emp_code: 'CHIKU001' }, mrAuthUser, mrScope);
      expect(allowed).toBe(true);
    });

    it('forbids MR from accessing another employee record', () => {
      const allowed = DataScopeService.canAccessResource('employees', { emp_code: 'CHIKU999' }, mrAuthUser, mrScope);
      expect(allowed).toBe(false);
    });

    it('allows MR to access their own payroll record', () => {
      const allowed = DataScopeService.canAccessResource('payroll', { employee_id: 'usr_mr_1' }, mrAuthUser, mrScope);
      expect(allowed).toBe(true);
    });

    it('forbids MR from accessing another employee payroll record', () => {
      const allowed = DataScopeService.canAccessResource('payroll', { employee_id: 'usr_mr_other' }, mrAuthUser, mrScope);
      expect(allowed).toBe(false);
    });

    it('allows ASM to access subordinate employee records', () => {
      const asmAuthUser: AuthUser = {
        id: 'usr_asm_1',
        userId: 'ASM_001',
        role: 'ASM',
        fullName: 'ASM Manager',
        hqId: 'HQ_INDORE',
      };

      const asmScope: UserDataScope = {
        isUnrestricted: false,
        selfId: 'usr_asm_1',
        selfUserId: 'ASM_001',
        selfEmpCode: 'CHIKU_ASM',
        permittedHqIds: ['HQ_INDORE', 'HQ_UJJAIN'],
        permittedAreaIds: ['AREA_1', 'AREA_2'],
        permittedDivisionIds: ['DIV_CARDIO'],
        subordinateUserIds: ['usr_mr_1', 'MR_001'],
        subordinateEmpCodes: ['CHIKU001'],
        authorizedUserIds: ['usr_asm_1', 'ASM_001', 'usr_mr_1', 'MR_001'],
        authorizedEmpCodes: ['CHIKU_ASM', 'CHIKU001'],
      };

      const allowedSub = DataScopeService.canAccessResource('employees', { emp_code: 'CHIKU001' }, asmAuthUser, asmScope);
      expect(allowedSub).toBe(true);

      const allowedNonSub = DataScopeService.canAccessResource('employees', { emp_code: 'CHIKU_STRANGER' }, asmAuthUser, asmScope);
      expect(allowedNonSub).toBe(false);
    });
  });
});

describe('DataQueryBuilder HR Backend Scoping Tests', () => {
  const mrAuthUser: AuthUser = {
    id: 'usr_mr_1',
    userId: 'MR_001',
    role: 'MR',
    fullName: 'Medical Rep 1',
    hqId: 'HQ_INDORE',
  };

  const mrScope: UserDataScope = {
    isUnrestricted: false,
    selfId: 'usr_mr_1',
    selfUserId: 'MR_001',
    selfEmpCode: 'CHIKU001',
    permittedHqIds: ['HQ_INDORE'],
    permittedAreaIds: ['AREA_1'],
    permittedDivisionIds: ['DIV_CARDIO'],
    subordinateUserIds: [],
    subordinateEmpCodes: [],
    authorizedUserIds: ['usr_mr_1', 'MR_001'],
    authorizedEmpCodes: ['CHIKU001'],
  };

  const adminAuthUser: AuthUser = {
    id: 'usr_admin',
    userId: 'ADMIN',
    role: 'ADMIN',
    fullName: 'Administrator',
  };

  const adminScope: UserDataScope = {
    isUnrestricted: true,
    selfId: 'usr_admin',
    selfUserId: 'ADMIN',
    selfEmpCode: null,
    permittedHqIds: [],
    permittedAreaIds: [],
    permittedDivisionIds: [],
    subordinateUserIds: [],
    subordinateEmpCodes: [],
    authorizedUserIds: ['usr_admin', 'ADMIN'],
    authorizedEmpCodes: [],
  };

  describe('employees collection query building', () => {
    it('strictly scopes employee queries to authorized emp_codes and permitted HQs for MR', () => {
      const url = new URL('https://api.example.com/api/data/employees');
      const { query, params, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('employees', url, mrAuthUser, mrScope);

      expect(isEarlyReturnEmpty).toBe(false);
      expect(query).toContain('emp_code IN (?)');
      expect(query).toContain('SELECT emp_code FROM users WHERE hq_id IN (?)');
      expect(params).toContain('CHIKU001');
      expect(params).toContain('HQ_INDORE');
    });

    it('generates unrestricted query for Admin', () => {
      const url = new URL('https://api.example.com/api/data/employees');
      const { query, params, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('employees', url, adminAuthUser, adminScope);

      expect(isEarlyReturnEmpty).toBe(false);
      expect(query).toBe('SELECT * FROM employees WHERE 1=1 AND is_active = 1');
      expect(params.length).toBe(0);
    });

    it('blocks MR expansion attempt when requesting an unauthorized HQ via ?hqId=', () => {
      const url = new URL('https://api.example.com/api/data/employees?hqId=HQ_MUMBAI');
      const { query, params } = DataQueryBuilder.buildSelectQuery('employees', url, mrAuthUser, mrScope);

      // Evaluating unpermitted HQ results in scope restricted to only authorizedEmpCodes
      expect(query).toContain('emp_code IN (?)');
      expect(params).toContain('CHIKU001');
      expect(params).not.toContain('HQ_MUMBAI');
    });

    it('blocks IDOR attempt when non-admin requests an unpermitted employeeId', () => {
      const url = new URL('https://api.example.com/api/data/employees?employeeId=ATTACK_TARGET_USER');
      const { isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('employees', url, mrAuthUser, mrScope);

      expect(isEarlyReturnEmpty).toBe(true);
    });
  });

  describe('users collection query building', () => {
    it('scopes user list to authorized user IDs and permitted HQs for non-admin', () => {
      const url = new URL('https://api.example.com/api/data/users');
      const { query, params, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('users', url, mrAuthUser, mrScope);

      expect(isEarlyReturnEmpty).toBe(false);
      expect(query).toContain('id IN (?,?)');
      expect(query).toContain('user_id IN (?,?)');
      expect(query).toContain('hq_id IN (?)');
      expect(params).toContain('usr_mr_1');
      expect(params).toContain('MR_001');
      expect(params).toContain('HQ_INDORE');
    });
  });

  describe('payroll and expenses collections query building', () => {
    it('strictly scopes payroll queries to authorized employee IDs and emp codes', () => {
      const url = new URL('https://api.example.com/api/data/payroll');
      const { query, params, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('payroll', url, mrAuthUser, mrScope);

      expect(isEarlyReturnEmpty).toBe(false);
      expect(query).toContain('employee_id IN (?,?,?)');
      expect(params).toContain('usr_mr_1');
      expect(params).toContain('MR_001');
      expect(params).toContain('CHIKU001');
    });

    it('strictly scopes expenses queries to authorized employee IDs and emp codes', () => {
      const url = new URL('https://api.example.com/api/data/expenses');
      const { query, params, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('expenses', url, mrAuthUser, mrScope);

      expect(isEarlyReturnEmpty).toBe(false);
      expect(query).toContain('employee_id IN (?,?,?)');
      expect(params).toContain('usr_mr_1');
      expect(params).toContain('MR_001');
      expect(params).toContain('CHIKU001');
    });
  });

  describe('leave_applications query building', () => {
    it('scopes leave applications to authorized employee IDs/codes and permitted HQs', () => {
      const url = new URL('https://api.example.com/api/data/leave_applications');
      const { query, params, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('leave_applications', url, mrAuthUser, mrScope);

      expect(isEarlyReturnEmpty).toBe(false);
      expect(query).toContain('employee_id IN (?,?,?)');
      expect(query).toContain('hq_id IN (?)');
      expect(params).toContain('usr_mr_1');
      expect(params).toContain('HQ_INDORE');
    });
  });

  describe('user_history and audit_logs query building', () => {
    it('scopes user history to authorized user IDs', () => {
      const url = new URL('https://api.example.com/api/data/user_history');
      const { query, params, isEarlyReturnEmpty } = DataQueryBuilder.buildSelectQuery('user_history', url, mrAuthUser, mrScope);

      expect(isEarlyReturnEmpty).toBe(false);
      expect(query).toContain('user_id IN (?,?)');
      expect(params).toContain('usr_mr_1');
      expect(params).toContain('MR_001');
    });
  });
});

describe('DataSecurityGuard Mutation Security Tests', () => {
  const mrAuthUser: AuthUser = {
    id: 'usr_mr_1',
    userId: 'MR_001',
    role: 'MR',
    fullName: 'Medical Rep 1',
    hqId: 'HQ_INDORE',
  };

  const mrScope: UserDataScope = {
    isUnrestricted: false,
    selfId: 'usr_mr_1',
    selfUserId: 'MR_001',
    selfEmpCode: 'CHIKU001',
    permittedHqIds: ['HQ_INDORE'],
    permittedAreaIds: ['AREA_1'],
    permittedDivisionIds: ['DIV_CARDIO'],
    subordinateUserIds: [],
    subordinateEmpCodes: [],
    authorizedUserIds: ['usr_mr_1', 'MR_001'],
    authorizedEmpCodes: ['CHIKU001'],
  };

  it('rejects employee mutation outside permitted HQ with 403 Forbidden', () => {
    const res = DataSecurityGuard.verifyHierarchyAccess(
      'employees',
      mrAuthUser,
      { emp_code: 'CHIKU001', hq_id: 'HQ_MUMBAI' },
      mrScope
    );
    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);
  });

  it('rejects employee mutation with unpermitted emp_code with 403 Forbidden', () => {
    const res = DataSecurityGuard.verifyHierarchyAccess(
      'employees',
      mrAuthUser,
      { emp_code: 'CHIKU_VICTIM', hq_id: 'HQ_INDORE' },
      mrScope
    );
    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);
  });

  it('rejects mutation with unauthorized division with 403 Forbidden', () => {
    const res = DataSecurityGuard.verifyHierarchyAccess(
      'users',
      mrAuthUser,
      { id: 'usr_mr_1', division_id: 'DIV_NEURO' },
      mrScope
    );
    expect(res).not.toBeNull();
    expect(res?.status).toBe(403);
  });

  it('allows authorized mutation for own record in authorized HQ and division', () => {
    const res = DataSecurityGuard.verifyHierarchyAccess(
      'employees',
      mrAuthUser,
      { emp_code: 'CHIKU001', hq_id: 'HQ_INDORE', division_id: 'DIV_CARDIO' },
      mrScope
    );
    expect(res).toBeNull();
  });
});

describe('RBAC Role Permissions & HR Mutation Authorization Tests', () => {
  const mrAuthUser: AuthUser = {
    id: 'usr_mr_1',
    userId: 'MR_001',
    role: 'MR',
    fullName: 'Medical Rep 1',
    hqId: 'HQ_INDORE',
  };

  const mrScope: UserDataScope = {
    isUnrestricted: false,
    selfId: 'usr_mr_1',
    selfUserId: 'MR_001',
    selfEmpCode: 'CHIKU001',
    permittedHqIds: ['HQ_INDORE'],
    permittedAreaIds: ['AREA_1'],
    permittedDivisionIds: ['DIV_CARDIO'],
    subordinateUserIds: [],
    subordinateEmpCodes: [],
    authorizedUserIds: ['usr_mr_1', 'MR_001'],
    authorizedEmpCodes: ['CHIKU001'],
  };

  const adminAuthUser: AuthUser = {
    id: 'usr_admin',
    userId: 'ADMIN',
    role: 'ADMIN',
    fullName: 'Administrator',
  };

  describe('verifyHrMutationAuthorization', () => {
    it('blocks non-admin from creating an employee record', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'employees',
        mrAuthUser,
        'CREATE',
        { emp_code: 'CHIKU002', first_name: 'John', last_name: 'Doe' },
        null,
        mrScope
      );
      expect(res).not.toBeNull();
      expect(res?.status).toBe(403);
    });

    it('blocks non-admin from creating or deleting user accounts', () => {
      const resCreate = DataSecurityGuard.verifyHrMutationAuthorization(
        'users',
        mrAuthUser,
        'CREATE',
        { user_id: 'NEW_USER', role: 'MR' },
        null,
        mrScope
      );
      expect(resCreate?.status).toBe(403);

      const resDelete = DataSecurityGuard.verifyHrMutationAuthorization(
        'users',
        mrAuthUser,
        'DELETE',
        null,
        { id: 'usr_other' },
        mrScope
      );
      expect(resDelete?.status).toBe(403);
    });

    it('blocks non-admin from updating another user account', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'users',
        mrAuthUser,
        'UPDATE',
        { mobile: '9999999999' },
        { id: 'usr_other', user_id: 'OTHER_USER' },
        mrScope
      );
      expect(res?.status).toBe(403);
    });

    it('blocks non-admin from modifying privileged fields on own account (e.g. elevating role)', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'users',
        mrAuthUser,
        'UPDATE',
        { role: 'ADMIN' },
        { id: 'usr_mr_1', user_id: 'MR_001', role: 'MR' },
        mrScope
      );
      expect(res?.status).toBe(403);
    });

    it('allows non-admin to update non-privileged fields on own account (e.g. mobile)', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'users',
        mrAuthUser,
        'UPDATE',
        { mobile: '9876543210' },
        { id: 'usr_mr_1', user_id: 'MR_001', role: 'MR', mobile: '9000000000' },
        mrScope
      );
      expect(res).toBeNull();
    });

    it('blocks non-admin from allocating leaves (leave_allocations)', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'leave_allocations',
        mrAuthUser,
        'CREATE',
        { employee_id: 'CHIKU001', cl: 12, sl: 10, pl: 15, year: '2026' },
        null,
        mrScope
      );
      expect(res?.status).toBe(403);
    });

    it('blocks non-admin from modifying company DA rates or SFC rates', () => {
      const resDa = DataSecurityGuard.verifyHrMutationAuthorization(
        'da_rates',
        mrAuthUser,
        'CREATE',
        { role: 'MR', amount: 999 },
        null,
        mrScope
      );
      expect(resDa?.status).toBe(403);

      const resSfc = DataSecurityGuard.verifyHrMutationAuthorization(
        'sfc_rates',
        mrAuthUser,
        'CREATE',
        { approved_fare: 500 },
        null,
        mrScope
      );
      expect(resSfc?.status).toBe(403);
    });

    it('blocks non-admin from mutating payroll or loans', () => {
      const resPay = DataSecurityGuard.verifyHrMutationAuthorization(
        'payroll',
        mrAuthUser,
        'CREATE',
        { employee_id: 'usr_mr_1', net_pay: 50000 },
        null,
        mrScope
      );
      expect(resPay?.status).toBe(403);

      const resLoan = DataSecurityGuard.verifyHrMutationAuthorization(
        'loans',
        mrAuthUser,
        'CREATE',
        { employee_id: 'usr_mr_1', principal_amount: 10000 },
        null,
        mrScope
      );
      expect(resLoan?.status).toBe(403);
    });

    it('blocks mutations to immutable audit logs and history tables', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'user_history',
        adminAuthUser, // even for admin, audit logs are immutable via data API
        'DELETE',
        null,
        { id: 'uh_1' },
        undefined
      );
      expect(res?.status).toBe(403);
    });

    it('blocks non-admin from creating pre-approved leave applications', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'leave_applications',
        mrAuthUser,
        'CREATE',
        { employee_id: 'usr_mr_1', status: 'APPROVED', num_days: 2 },
        null,
        mrScope
      );
      expect(res?.status).toBe(403);
    });

    it('blocks non-admin from applying for leave for another user', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'leave_applications',
        mrAuthUser,
        'CREATE',
        { employee_id: 'usr_victim', status: 'PENDING', num_days: 2 },
        null,
        mrScope
      );
      expect(res?.status).toBe(403);
    });

    it('blocks non-admin from directly approving leaves via data API', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'leave_applications',
        mrAuthUser,
        'UPDATE',
        { status: 'APPROVED' },
        { id: 'la_1', employee_id: 'usr_mr_1', status: 'PENDING' },
        mrScope
      );
      expect(res?.status).toBe(403);
    });

    it('allows Admin to perform HR and administrative operations', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'employees',
        adminAuthUser,
        'CREATE',
        { emp_code: 'CHIKU002', first_name: 'Jane', last_name: 'Smith' },
        null,
        undefined
      );
      expect(res).toBeNull();

      const resAlloc = DataSecurityGuard.verifyHrMutationAuthorization(
        'leave_allocations',
        adminAuthUser,
        'CREATE',
        { employee_id: 'CHIKU001', cl: 10, sl: 10, pl: 10, year: '2026' },
        null,
        undefined
      );
      expect(resAlloc).toBeNull();
    });
  });
});

describe('Hierarchy Integrity & Reporting Validation Tests', () => {
  const mockDb = {
    users: [
      { id: 'usr_mr_1', user_id: 'MR_001', full_name: 'MR One', role: 'MR', is_active: 1, status: 'ACTIVE', reports_to_id: 'usr_asm_1', manager_id: 'usr_asm_1' },
      { id: 'usr_asm_1', user_id: 'ASM_001', full_name: 'ASM One', role: 'ASM', is_active: 1, status: 'ACTIVE', reports_to_id: 'usr_rsm_1', manager_id: 'usr_rsm_1' },
      { id: 'usr_rsm_1', user_id: 'RSM_001', full_name: 'RSM One', role: 'RSM', is_active: 1, status: 'ACTIVE', reports_to_id: 'usr_admin', manager_id: 'usr_admin' },
      { id: 'usr_inactive_asm', user_id: 'ASM_DEAD', full_name: 'ASM Inactive', role: 'ASM', is_active: 0, status: 'INACTIVE', reports_to_id: 'usr_rsm_1', manager_id: 'usr_rsm_1' },
      { id: 'usr_admin', user_id: 'ADMIN', full_name: 'Super Admin', role: 'ADMIN', is_active: 1, status: 'ACTIVE', reports_to_id: null, manager_id: null },
      { id: 'usr_loop_a', user_id: 'LOOP_A', full_name: 'Loop A', role: 'ASM', is_active: 1, status: 'ACTIVE', reports_to_id: 'usr_loop_b', manager_id: 'usr_loop_b' },
      { id: 'usr_loop_b', user_id: 'LOOP_B', full_name: 'Loop B', role: 'ASM', is_active: 1, status: 'ACTIVE', reports_to_id: 'usr_loop_a', manager_id: 'usr_loop_a' },
    ],
    prepare(sql: string) {
      return {
        bind(...params: any[]) {
          return {
            first: async () => {
              const id = params[0];
              return mockDb.users.find((u) => u.id === id || u.user_id === id) || null;
            }
          };
        }
      };
    }
  };

  const mockEnv: any = { chikusfa_db: mockDb };

  it('rejects self-reporting assignment', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_mr_1', 'MR', 'usr_mr_1')
    ).rejects.toThrow('A user cannot report to themselves');
  });

  it('rejects self-reporting in reports_to_ids array', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_mr_1', 'MR', null, ['usr_mr_1'])
    ).rejects.toThrow('A user cannot report to themselves');
  });

  it('rejects assignment to non-existent manager', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_mr_1', 'MR', 'GHOST_USER')
    ).rejects.toThrow('does not exist');
  });

  it('rejects assignment to inactive or terminated manager', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_mr_1', 'MR', 'usr_inactive_asm')
    ).rejects.toThrow('is inactive or deleted');
  });

  it('rejects junior rank manager assigned to senior rank subordinate (e.g. RSM reporting to ASM)', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_rsm_1', 'RSM', 'usr_asm_1')
    ).rejects.toThrow("cannot report to a junior rank 'ASM'");
  });

  it('rejects junior rank manager assigned to senior rank subordinate (e.g. ASM reporting to MR)', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_asm_1', 'ASM', 'usr_mr_1')
    ).rejects.toThrow("cannot report to a junior rank 'MR'");
  });

  it('detects circular reporting loops and throws an error', async () => {
    // Attempting to set usr_loop_a's manager to usr_loop_b when usr_loop_b already reports to usr_loop_a
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_loop_a', 'ASM', 'usr_loop_b')
    ).rejects.toThrow('Circular reporting chain detected');
  });

  it('allows valid hierarchical manager assignment (MR -> ASM)', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_mr_1', 'MR', 'usr_asm_1')
    ).resolves.toBeUndefined();
  });

  it('allows valid hierarchical manager assignment (ASM -> RSM)', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_asm_1', 'ASM', 'usr_rsm_1')
    ).resolves.toBeUndefined();
  });

  it('allows valid hierarchical manager assignment (RSM -> ADMIN)', async () => {
    await expect(
      HierarchyService.validateReportingIntegrity(mockEnv, 'usr_rsm_1', 'RSM', 'usr_admin')
    ).resolves.toBeUndefined();
  });
});

describe('Transfer Security & Geography Validation Tests', () => {
  const transferDb = {
    users: [
      { id: 'usr_mr_1', user_id: 'MR_001', role: 'MR', hq_id: 'HQ_INDORE', division_id: 'DIV_CARDIO', primary_area_id: 'AREA_INDORE_1', is_active: 1 },
      { id: 'usr_admin', user_id: 'ADMIN', role: 'ADMIN', hq_id: 'HQ000', division_id: null, primary_area_id: null, is_active: 1 },
      { id: 'usr_asm_1', user_id: 'ASM_001', role: 'ASM', hq_id: 'HQ_INDORE', division_id: 'DIV_CARDIO', is_active: 1 },
    ],
    hqs: [
      { id: 'HQ_INDORE', name: 'Indore', division_id: 'DIV_CARDIO', state_id: 'ST_MP', is_active: 1, is_pool_hq: 0 },
      { id: 'HQ_BHOPAL', name: 'Bhopal', division_id: 'DIV_CARDIO', state_id: 'ST_MP', is_active: 1, is_pool_hq: 0 },
      { id: 'HQ_MUMBAI', name: 'Mumbai', division_id: 'DIV_NEURO', state_id: 'ST_MH', is_active: 1, is_pool_hq: 0 },
      { id: 'HQ_INACTIVE', name: 'Dead HQ', division_id: 'DIV_CARDIO', state_id: 'ST_MP', is_active: 0, is_pool_hq: 0 },
    ],
    divisions: [
      { id: 'DIV_CARDIO', name: 'Cardio', is_active: 1 },
      { id: 'DIV_NEURO', name: 'Neuro', is_active: 1 },
      { id: 'DIV_DEAD', name: 'Dead Div', is_active: 0 },
    ],
    areas: [
      { id: 'AREA_INDORE_1', name: 'Indore Central', hq_id: 'HQ_INDORE', is_active: 1 },
      { id: 'AREA_BHOPAL_1', name: 'Bhopal Central', hq_id: 'HQ_BHOPAL', is_active: 1 },
      { id: 'AREA_MUMBAI_1', name: 'Mumbai Central', hq_id: 'HQ_MUMBAI', is_active: 1 },
      { id: 'AREA_DEAD', name: 'Dead Area', hq_id: 'HQ_BHOPAL', is_active: 0 },
    ],
    states: [
      { id: 'ST_MP', name: 'Madhya Pradesh', zone_id: 'ZN_CENTRAL' },
      { id: 'ST_MH', name: 'Maharashtra', zone_id: 'ZN_WEST' },
    ],
    zones: [
      { id: 'ZN_CENTRAL', name: 'Central Zone' },
      { id: 'ZN_WEST', name: 'West Zone' },
    ],
    prepare(sql: string) {
      const createStmt = (boundParams: any[] = []) => ({
        bind(...params: any[]) {
          return createStmt(params);
        },
        first: async () => {
          const val = boundParams[0];
          if (sql.includes('FROM users')) {
            return transferDb.users.find((u) => u.id === val || u.user_id === val) || null;
          }
          if (sql.includes('FROM hqs')) {
            return transferDb.hqs.find((h) => h.id === val) || null;
          }
          if (sql.includes('FROM divisions')) {
            return transferDb.divisions.find((d) => d.id === val) || null;
          }
          if (sql.includes('FROM areas')) {
            return transferDb.areas.find((a) => a.id === val) || null;
          }
          if (sql.includes('FROM states')) {
            return transferDb.states.find((s) => s.id === val) || null;
          }
          return null;
        },
        all: async () => {
          if (sql.includes('FROM users')) return { results: transferDb.users };
          if (sql.includes('FROM hqs')) return { results: transferDb.hqs };
          if (sql.includes('FROM states')) return { results: transferDb.states };
          if (sql.includes('FROM zones')) return { results: transferDb.zones };
          if (sql.includes('FROM areas')) return { results: transferDb.areas };
          if (sql.includes('FROM divisions')) return { results: transferDb.divisions };
          return { results: [] };
        },
      });
      return createStmt();
    },
    batch: async () => [],
  };

  const mockTransferEnv: any = { chikusfa_db: transferDb };

  const adminActor: AuthUser = {
    id: 'usr_admin',
    userId: 'ADMIN',
    role: 'ADMIN',
    fullName: 'Administrator',
  };

  const mrActor: AuthUser = {
    id: 'usr_mr_1',
    userId: 'MR_001',
    role: 'MR',
    fullName: 'MR One',
    hqId: 'HQ_INDORE',
  };

  it('rejects transfer attempt by non-admin actor without permission', async () => {
    const req = new Request('https://api.example.com/api/users/usr_mr_1/transfer', {
      method: 'POST',
      body: JSON.stringify({ hqId: 'HQ_BHOPAL', divisionId: 'DIV_CARDIO' }),
    });

    const res = await UserController.transfer(req, mockTransferEnv, mrActor, { id: 'usr_mr_1' });
    expect(res.status).toBe(403);
  });

  it('rejects transfer attempt on an ADMIN or OWNER account', async () => {
    const req = new Request('https://api.example.com/api/users/usr_admin/transfer', {
      method: 'POST',
      body: JSON.stringify({ hqId: 'HQ_BHOPAL', divisionId: 'DIV_CARDIO' }),
    });

    const res = await UserController.transfer(req, mockTransferEnv, adminActor, { id: 'usr_admin' });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('System administrators cannot be transferred');
  });

  it('rejects transfer when destination HQ is missing, inactive, or non-existent', async () => {
    const reqNoHq = new Request('https://api.example.com/api/users/usr_mr_1/transfer', {
      method: 'POST',
      body: JSON.stringify({ divisionId: 'DIV_CARDIO' }),
    });
    const resNoHq = await UserController.transfer(reqNoHq, mockTransferEnv, adminActor, { id: 'usr_mr_1' });
    expect(resNoHq.status).toBe(400);

    const reqDeadHq = new Request('https://api.example.com/api/users/usr_mr_1/transfer', {
      method: 'POST',
      body: JSON.stringify({ hqId: 'HQ_INACTIVE' }),
    });
    const resDeadHq = await UserController.transfer(reqDeadHq, mockTransferEnv, adminActor, { id: 'usr_mr_1' });
    expect(resDeadHq.status).toBe(400);
    const body = await resDeadHq.json();
    expect(body.error).toContain('does not exist or is inactive');
  });

  it('rejects transfer when primary area belongs to a different HQ (mismatch check)', async () => {
    // Transferring to HQ_BHOPAL but specifying AREA_MUMBAI_1 (which belongs to HQ_MUMBAI)
    const req = new Request('https://api.example.com/api/users/usr_mr_1/transfer', {
      method: 'POST',
      body: JSON.stringify({ hqId: 'HQ_BHOPAL', primaryAreaId: 'AREA_MUMBAI_1' }),
    });

    const res = await UserController.transfer(req, mockTransferEnv, adminActor, { id: 'usr_mr_1' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('belongs to HQ');
  });

  it('rejects no-op / redundant transfer to identical location', async () => {
    // User is already in HQ_INDORE, DIV_CARDIO, AREA_INDORE_1
    const req = new Request('https://api.example.com/api/users/usr_mr_1/transfer', {
      method: 'POST',
      body: JSON.stringify({ hqId: 'HQ_INDORE', divisionId: 'DIV_CARDIO', primaryAreaId: 'AREA_INDORE_1' }),
    });

    const res = await UserController.transfer(req, mockTransferEnv, adminActor, { id: 'usr_mr_1' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('already assigned to this exact HQ');
  });

  it('successfully executes transfer when source, destination geography, and actor are valid', async () => {
    const req = new Request('https://api.example.com/api/users/usr_mr_1/transfer', {
      method: 'POST',
      body: JSON.stringify({
        hqId: 'HQ_BHOPAL',
        divisionId: 'DIV_CARDIO',
        primaryAreaId: 'AREA_BHOPAL_1',
        reason: 'Business Reorganization',
      }),
    });

    const res = await UserController.transfer(req, mockTransferEnv, adminActor, { id: 'usr_mr_1' });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe('Promotion Security & Generic Update Bypass Protection Tests', () => {
  const promoteDb = {
    users: [
      { id: 'usr_mr_1', user_id: 'MR_001', role: 'MR', designation: 'Medical Rep', hq_id: 'HQ_INDORE', is_active: 1 },
      { id: 'usr_owner', user_id: 'OWNER', role: 'OWNER', designation: 'Owner', hq_id: 'HQ000', is_active: 1 },
      { id: 'usr_admin', user_id: 'ADMIN', role: 'ADMIN', designation: 'Administrator', hq_id: 'HQ000', is_active: 1 },
    ],
    hqs: [
      { id: 'HQ_INDORE', name: 'Indore', is_active: 1, state_id: 'ST_MP' },
      { id: 'HQ_BHOPAL', name: 'Bhopal', is_active: 1, state_id: 'ST_MP' },
      { id: 'HQ_DEAD', name: 'Dead HQ', is_active: 0, state_id: 'ST_MP' },
    ],
    states: [{ id: 'ST_MP', name: 'MP', zone_id: 'ZN_CENTRAL' }],
    zones: [{ id: 'ZN_CENTRAL', name: 'Central Zone' }],
    prepare(sql: string) {
      const createStmt = (boundParams: any[] = []) => ({
        bind(...params: any[]) {
          return createStmt(params);
        },
        first: async () => {
          const val = boundParams[0];
          if (sql.includes('FROM users')) {
            return promoteDb.users.find((u) => u.id === val || u.user_id === val) || null;
          }
          if (sql.includes('FROM hqs')) {
            return promoteDb.hqs.find((h) => h.id === val) || null;
          }
          if (sql.includes('FROM states')) {
            return promoteDb.states.find((s) => s.id === val) || null;
          }
          return null;
        },
        all: async () => {
          if (sql.includes('FROM users')) return { results: promoteDb.users };
          if (sql.includes('FROM hqs')) return { results: promoteDb.hqs };
          if (sql.includes('FROM states')) return { results: promoteDb.states };
          if (sql.includes('FROM zones')) return { results: promoteDb.zones };
          return { results: [] };
        },
      });
      return createStmt();
    },
    batch: async () => [],
  };

  const mockPromoteEnv: any = { chikusfa_db: promoteDb };

  const adminActor: AuthUser = {
    id: 'usr_admin',
    userId: 'ADMIN',
    role: 'ADMIN',
    fullName: 'Administrator',
  };

  const mrActor: AuthUser = {
    id: 'usr_mr_1',
    userId: 'MR_001',
    role: 'MR',
    fullName: 'MR One',
    hqId: 'HQ_INDORE',
  };

  describe('Generic User Update Bypass Protection (UserService.preSaveCheck)', () => {
    class TestableUserService extends UserService {
      public async testPreSaveCheck(env: any, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE') {
        return this.preSaveCheck(env, validData, existingData, id, action);
      }
    }
    const userService = new TestableUserService('users');

    it('strictly blocks direct role modification via generic update', async () => {
      await expect(
        userService.testPreSaveCheck(
          mockPromoteEnv,
          { role: 'ASM', mobile: '9999999999' },
          { id: 'usr_mr_1', role: 'MR' },
          'usr_mr_1',
          'UPDATE'
        )
      ).rejects.toThrow('Direct role change via generic user update is prohibited');
    });

    it('strictly blocks direct territory relocation via generic update', async () => {
      await expect(
        userService.testPreSaveCheck(
          mockPromoteEnv,
          { hq_id: 'HQ_BHOPAL', mobile: '9999999999' },
          { id: 'usr_mr_1', role: 'MR', hq_id: 'HQ_INDORE' },
          'usr_mr_1',
          'UPDATE'
        )
      ).rejects.toThrow('Direct territory relocation via generic user update is prohibited');
    });

    it('strictly blocks direct division modification via generic update', async () => {
      await expect(
        userService.testPreSaveCheck(
          mockPromoteEnv,
          { division_id: 'DIV_NEURO', mobile: '9999999999' },
          { id: 'usr_mr_1', role: 'MR', division_id: 'DIV_CARDIO' },
          'usr_mr_1',
          'UPDATE'
        )
      ).rejects.toThrow('Direct division relocation via generic user update is prohibited');
    });

    it('strictly blocks direct manager modification via generic update', async () => {
      await expect(
        userService.testPreSaveCheck(
          mockPromoteEnv,
          { reports_to_id: 'usr_asm_2', mobile: '9999999999' },
          { id: 'usr_mr_1', role: 'MR', reports_to_id: 'usr_asm_1' },
          'usr_mr_1',
          'UPDATE'
        )
      ).rejects.toThrow('Direct manager modification via generic user update is prohibited');
    });

    it('strictly blocks direct lifecycle status change via generic update', async () => {
      await expect(
        userService.testPreSaveCheck(
          mockPromoteEnv,
          { status: 'TERMINATED', mobile: '9999999999' },
          { id: 'usr_mr_1', role: 'MR', status: 'ACTIVE' },
          'usr_mr_1',
          'UPDATE'
        )
      ).rejects.toThrow('Direct user lifecycle status modification via generic user update is prohibited');
    });

    it('strictly blocks direct hierarchy status change via generic update', async () => {
      await expect(
        userService.testPreSaveCheck(
          mockPromoteEnv,
          { hierarchy_status: 'ACTIVE', mobile: '9999999999' },
          { id: 'usr_mr_1', role: 'MR', hierarchy_status: 'UNASSIGNED' },
          'usr_mr_1',
          'UPDATE'
        )
      ).rejects.toThrow('Direct hierarchy status modification is prohibited');
    });

    it('allows updating non-restricted user fields via generic update', async () => {
      await expect(
        userService.testPreSaveCheck(
          mockPromoteEnv,
          { role: 'MR', hq_id: 'HQ_INDORE', mobile: '9876543210' },
          { id: 'usr_mr_1', role: 'MR', hq_id: 'HQ_INDORE', mobile: '9000000000' },
          'usr_mr_1',
          'UPDATE'
        )
      ).resolves.toBeUndefined();
    });
  });

  describe('Direct Status Change Bypass in Tour Plans & Expenses', () => {
    it('blocks direct tour plan status alteration via generic update', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'tour_plans',
        mrActor,
        'UPDATE',
        { status: 'APPROVED' },
        { id: 'tp_1', employee_id: 'usr_mr_1', status: 'SUBMITTED' },
        undefined
      );
      expect(res?.status).toBe(403);
    });

    it('blocks direct expense status alteration via generic update', () => {
      const res = DataSecurityGuard.verifyHrMutationAuthorization(
        'expenses',
        mrActor,
        'UPDATE',
        { status: 'PAID' },
        { id: 'exp_1', employee_id: 'usr_mr_1', status: 'SUBMITTED' },
        undefined
      );
      expect(res?.status).toBe(403);
    });
  });

  describe('Promotion Workflow Security (UserController.promote)', () => {
    it('blocks non-admin actor from executing promotions', async () => {
      const req = new Request('https://api.example.com/api/users/usr_mr_1/promote', {
        method: 'POST',
        body: JSON.stringify({ role: 'ASM' }),
      });

      const res = await UserController.promote(req, mockPromoteEnv, mrActor, { id: 'usr_mr_1' });
      expect(res.status).toBe(403);
    });

    it('blocks promoting or demoting the root OWNER account', async () => {
      const req = new Request('https://api.example.com/api/users/usr_owner/promote', {
        method: 'POST',
        body: JSON.stringify({ role: 'VP' }),
      });

      const res = await UserController.promote(req, mockPromoteEnv, adminActor, { id: 'usr_owner' });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain('Root OWNER account cannot be promoted or demoted');
    });

    it('blocks promoting any user to root OWNER role', async () => {
      const req = new Request('https://api.example.com/api/users/usr_mr_1/promote', {
        method: 'POST',
        body: JSON.stringify({ role: 'OWNER' }),
      });

      const res = await UserController.promote(req, mockPromoteEnv, adminActor, { id: 'usr_mr_1' });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain('Cannot assign root OWNER role');
    });

    it('rejects invalid target roles', async () => {
      const req = new Request('https://api.example.com/api/users/usr_mr_1/promote', {
        method: 'POST',
        body: JSON.stringify({ role: 'HACKER_SUPERUSER' }),
      });

      const res = await UserController.promote(req, mockPromoteEnv, adminActor, { id: 'usr_mr_1' });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('Invalid target role');
    });

    it('rejects redundant promotion to identical role', async () => {
      const req = new Request('https://api.example.com/api/users/usr_mr_1/promote', {
        method: 'POST',
        body: JSON.stringify({ role: 'MR' }),
      });

      const res = await UserController.promote(req, mockPromoteEnv, adminActor, { id: 'usr_mr_1' });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('already assigned the role');
    });

    it('successfully executes promotion from MR to ASM with audit log and hierarchy rebuild', async () => {
      const req = new Request('https://api.example.com/api/users/usr_mr_1/promote', {
        method: 'POST',
        body: JSON.stringify({
          role: 'ASM',
          designation: 'Area Sales Manager',
          remarks: 'Annual Performance Appraisal Promotion',
        }),
      });

      const res = await UserController.promote(req, mockPromoteEnv, adminActor, { id: 'usr_mr_1' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});

describe('Approval Concurrency & Atomic State Transition Tests', () => {
  const approvalDb = {
    approvals: [
      {
        id: 'appr_pending_1',
        type: 'TOUR_PLAN',
        requested_by: 'usr_mr_1',
        manager_id: 'usr_asm_1',
        status: 'PENDING',
        entity_data: JSON.stringify({ employeeId: 'usr_mr_1', monthYear: '08-2026', details: [{ day: 1 }] }),
      },
      {
        id: 'appr_already_approved',
        type: 'TOUR_PLAN',
        requested_by: 'usr_mr_1',
        manager_id: 'usr_asm_1',
        status: 'APPROVED',
        entity_data: JSON.stringify({ employeeId: 'usr_mr_1', monthYear: '08-2026' }),
      },
      {
        id: 'appr_self',
        type: 'TOUR_PLAN',
        requested_by: 'usr_asm_1',
        manager_id: 'usr_asm_1',
        status: 'PENDING',
        entity_data: JSON.stringify({ employeeId: 'usr_asm_1', monthYear: '08-2026' }),
      },
    ],
    leave_allocations: [
      { id: 'la_1', employee_id: 'usr_mr_1', year: '2026', balance_cl: 1, balance_sl: 5, balance_pl: 10, is_active: 1 },
    ],
    prepare(sql: string) {
      const createStmt = (boundParams: any[] = []) => ({
        bind(...params: any[]) {
          return createStmt(params);
        },
        first: async () => {
          const val = boundParams[0];
          if (sql.includes('FROM approvals')) {
            return approvalDb.approvals.find((a) => a.id === val) || null;
          }
          if (sql.includes('FROM leave_allocations')) {
            return approvalDb.leave_allocations.find((l) => l.employee_id === boundParams[0] && l.year === boundParams[1]) || null;
          }
          if (sql.includes('FROM tour_plans')) {
            return null;
          }
          return null;
        },
        all: async () => {
          if (sql.includes('FROM approvals')) {
            return { results: approvalDb.approvals };
          }
          return { results: [] };
        },
        run: async () => {
          if (sql.includes('UPDATE approvals')) {
            const targetId = boundParams[3];
            const target = approvalDb.approvals.find((a) => a.id === targetId);
            if (target && target.status === 'PENDING') {
              target.status = boundParams[0];
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes('UPDATE leave_allocations')) {
            const numDays = boundParams[0];
            const empId = boundParams[2];
            const year = boundParams[3];
            const minReq = boundParams[4];
            const alloc = approvalDb.leave_allocations.find((l) => l.employee_id === empId && l.year === year);
            if (alloc && alloc.balance_cl >= minReq) {
              alloc.balance_cl -= numDays;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          return { meta: { changes: 1 } };
        },
      });
      return createStmt();
    },
    batch: async (stmts: any[]) => {
      for (const s of stmts) {
        if (s.run) await s.run();
      }
      return [];
    },
  };

  const mockApprEnv: any = { chikusfa_db: approvalDb };

  const asmManager: AuthUser = {
    id: 'usr_asm_1',
    userId: 'ASM_001',
    role: 'ASM',
    fullName: 'ASM Manager',
  };

  const mrUser: AuthUser = {
    id: 'usr_mr_1',
    userId: 'MR_001',
    role: 'MR',
    fullName: 'MR One',
  };

  const strangerManager: AuthUser = {
    id: 'usr_stranger',
    userId: 'STRANGER',
    role: 'ASM',
    fullName: 'Stranger Manager',
  };

  it('rejects action on already approved/processed request with 409 Conflict', async () => {
    const req = new Request('https://api.example.com/api/approvals/action', {
      method: 'POST',
      body: JSON.stringify({ id: 'appr_already_approved', action: 'APPROVED' }),
    });

    const res = await ApprovalController.action(req, mockApprEnv, asmManager);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain('already processed');
  });

  it('blocks self-approval attempt with 403 Forbidden', async () => {
    const req = new Request('https://api.example.com/api/approvals/action', {
      method: 'POST',
      body: JSON.stringify({ id: 'appr_self', action: 'APPROVED' }),
    });

    const res = await ApprovalController.action(req, mockApprEnv, asmManager);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('Self-approval is strictly prohibited');
  });

  it('blocks unauthorized manager from actioning request with 403 Forbidden', async () => {
    const req = new Request('https://api.example.com/api/approvals/action', {
      method: 'POST',
      body: JSON.stringify({ id: 'appr_pending_1', action: 'APPROVED' }),
    });

    const res = await ApprovalController.action(req, mockApprEnv, strangerManager);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('not authorized to action this approval');
  });

  it('detects concurrent depletion in updateLeaveAllocation and throws 409 Conflict', async () => {
    const repo = new ApprovalRepository(mockApprEnv);
    // balance_cl is 1, attempting to deduct 5 days concurrently
    await expect(
      repo.updateLeaveAllocation('balance_cl', 5, 'usr_mr_1', '2026')
    ).rejects.toThrow('409 Conflict: Concurrent leave allocation depletion');
  });

  it('successfully transitions pending approval atomically', async () => {
    const req = new Request('https://api.example.com/api/approvals/action', {
      method: 'POST',
      body: JSON.stringify({ id: 'appr_pending_1', action: 'APPROVED', remarks: 'Looks good' }),
    });

    const res = await ApprovalController.action(req, mockApprEnv, asmManager);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('APPROVED');
  });
});

describe('Audit Integrity & Authenticated Session Actor Tests', () => {
  const auditDb = {
    doctors: [] as any[],
    audit_logs: [] as any[],
    prepare(sql: string) {
      const createStmt = (boundParams: any[] = []) => ({
        bind(...params: any[]) {
          return createStmt(params);
        },
        first: async () => {
          return null;
        },
        all: async () => {
          return { results: [] };
        },
        run: async () => {
          if (sql.includes('INSERT INTO audit_logs')) {
            auditDb.audit_logs.push({
              id: boundParams[0],
              timestamp: boundParams[1],
              module: boundParams[2],
              type: boundParams[3],
              status: boundParams[4],
              message: boundParams[5],
              user_id: boundParams[6],
              user_name: boundParams[7],
              action: boundParams[8],
              entity_type: boundParams[9],
              entity_id: boundParams[10],
              details: boundParams[11],
            });
            return { meta: { changes: 1 } };
          }
          if (sql.includes('INSERT INTO doctors')) {
            auditDb.doctors.push(boundParams);
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 1 } };
        },
      });
      return createStmt();
    },
    batch: async () => [],
  };

  const mockAuditEnv: any = { chikusfa_db: auditDb };

  const sessionUser: AuthUser = {
    id: 'usr_legit_actor_123',
    userId: 'MR_LEGIT',
    role: 'MR',
    fullName: 'Legitimate Field Representative',
    hqId: 'HQ_INDORE',
  };

  it('strictly ignores client-supplied spoofed created_by and binds authenticated session userId', async () => {
    const dataService = new DataService('doctors');
    const payloadWithSpoofedAudit = {
      name: 'Dr. Ramesh Sharma',
      qualification: 'MBBS',
      hq_id: 'HQ_INDORE',
      area_id: 'AREA_INDORE_1',
      created_by: 'SPOOFED_ADMIN_ID',
      changed_by: 'HACKER_ATTACK',
      user_id: 'SPOOFED_USER',
    };

    const res = await dataService.create(mockAuditEnv, 'doc_test_1', payloadWithSpoofedAudit, sessionUser);
    expect(res.created_by).toBe('MR_LEGIT');
    expect(res.changed_by).toBeUndefined();

    // Verify audit log has authenticated session user identity
    const lastAudit = auditDb.audit_logs[auditDb.audit_logs.length - 1];
    expect(lastAudit).toBeDefined();
    expect(lastAudit.user_id).toBe('usr_legit_actor_123');
    expect(lastAudit.user_name).toBe('Legitimate Field Representative');
  });

  it('strictly ignores client-supplied spoofed updated_by and binds authenticated session userId', async () => {
    const dataService = new DataService('doctors');
    const updatePayloadWithSpoofedAudit = {
      name: 'Dr. Ramesh Sharma Updated',
      qualification: 'MBBS, MD',
      hq_id: 'HQ_INDORE',
      updated_by: 'SPOOFED_ADMIN_ID',
      changed_by: 'ATTACKER',
    };

    const res = await dataService.update(
      mockAuditEnv,
      'doc_test_1',
      updatePayloadWithSpoofedAudit,
      sessionUser,
      { id: 'doc_test_1', name: 'Dr. Ramesh Sharma', hq_id: 'HQ_INDORE' }
    );
    expect(res.updated_by).toBe('MR_LEGIT');
    expect(res.changed_by).toBeUndefined();

    // Verify audit log has authenticated session user identity
    const lastAudit = auditDb.audit_logs[auditDb.audit_logs.length - 1];
    expect(lastAudit.user_id).toBe('usr_legit_actor_123');
    expect(lastAudit.user_name).toBe('Legitimate Field Representative');
  });
});

describe('Session, Refresh Token Rotation & Revocation Security Tests', () => {
  const jwtSecret = 'test_jwt_secret_key_minimum_32_characters_long_12345';
  const passwordHash = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // sha256 of 'password'

  const authDb = {
    users: [
      {
        id: 'usr_auth_1',
        user_id: 'MR_AUTH_1',
        full_name: 'Test Auth User',
        role: 'MR',
        password_hash: passwordHash,
        is_active: 1,
        status: 'ACTIVE',
        hq_id: 'HQ_INDORE',
        failed_login_attempts: 0,
        locked_until: null,
      },
    ],
    user_sessions: [] as any[],
    login_history: [] as any[],
    audit_logs: [] as any[],
    prepare(sql: string) {
      const createStmt = (boundParams: any[] = []) => ({
        bind(...params: any[]) {
          return createStmt(params);
        },
        first: async () => {
          const val = boundParams[0];
          if (sql.includes('FROM users')) {
            return authDb.users.find((u) => u.id === val || u.user_id === val) || null;
          }
          if (sql.includes('FROM user_sessions')) {
            return authDb.user_sessions.find((s) => s.id === val) || null;
          }
          return null;
        },
        all: async () => {
          if (sql.includes('FROM users')) return { results: authDb.users };
          if (sql.includes('FROM user_sessions')) return { results: authDb.user_sessions };
          return { results: [] };
        },
        run: async () => {
          if (sql.includes('INSERT INTO user_sessions')) {
            authDb.user_sessions.push({
              id: boundParams[0],
              user_id: boundParams[1],
              session_family_id: boundParams[2],
              refresh_token_hash: boundParams[3],
              device_id: boundParams[4],
              user_agent: boundParams[5],
              ip_address: boundParams[6],
              created_at: boundParams[7],
              last_active_at: boundParams[8],
              expires_at: boundParams[9],
              is_revoked: 0,
            });
            return { meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE user_sessions SET is_revoked = 1') && sql.includes('session_family_id = ?')) {
            const famId = boundParams[0];
            authDb.user_sessions.forEach((s) => {
              if (s.session_family_id === famId) {
                s.is_revoked = 1;
                s.revocation_reason = 'REUSE_DETECTED';
              }
            });
            return { meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE user_sessions SET is_revoked = 1') && sql.includes('id = ?')) {
            const sessId = boundParams[0];
            const s = authDb.user_sessions.find((x) => x.id === sessId);
            if (s) s.is_revoked = 1;
            return { meta: { changes: 1 } };
          }
          if (sql.includes('UPDATE user_sessions SET refresh_token_hash = ?')) {
            const newHash = boundParams[0];
            const newExpires = boundParams[1];
            const sessId = boundParams[2];
            const s = authDb.user_sessions.find((x) => x.id === sessId);
            if (s) {
              s.refresh_token_hash = newHash;
              s.expires_at = newExpires;
            }
            return { meta: { changes: 1 } };
          }
          if (sql.includes('INSERT INTO login_history')) {
            authDb.login_history.push(boundParams);
            return { meta: { changes: 1 } };
          }
          if (sql.includes('INSERT INTO audit_logs')) {
            authDb.audit_logs.push(boundParams);
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 1 } };
        },
      });
      return createStmt();
    },
    batch: async () => [],
  };

  const mockSessionEnv: any = {
    chikusfa_db: authDb,
    JWT_SECRET: jwtSecret,
  };

  it('login issues short-lived access token, long-lived refresh token, and creates active server session', async () => {
    const authService = new AuthService();
    const loginReq = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId: 'MR_AUTH_1', password: 'password' }),
    });

    const loginRes = await authService.login(loginReq, mockSessionEnv);
    expect(loginRes.token).toBeDefined();
    expect(loginRes.refreshToken).toBeDefined();
    expect(loginRes.cookieHeader).toContain('chiku_refresh_token=');
    expect(loginRes.cookieHeader).toContain('HttpOnly');
    expect(loginRes.cookieHeader).toContain('SameSite=Strict');

    // Verify session stored in database
    expect(authDb.user_sessions.length).toBe(1);
    expect(authDb.user_sessions[0].user_id).toBe('usr_auth_1');
    expect(authDb.user_sessions[0].is_revoked).toBe(0);
  });

  it('refresh rotates refresh token and updates server-side session hash', async () => {
    const authService = new AuthService();
    const currentSession = authDb.user_sessions[0];
    const initialHash = currentSession.refresh_token_hash;

    // Build refresh token from login
    const loginReq = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId: 'MR_AUTH_1', password: 'password' }),
    });
    const loginRes = await authService.login(loginReq, mockSessionEnv);

    const refreshReq = new Request('https://api.example.com/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: loginRes.refreshToken }),
    });

    const refreshRes = await authService.refresh(refreshReq, mockSessionEnv);
    expect(refreshRes.token).toBeDefined();
    expect(refreshRes.refreshToken).toBeDefined();
    expect(refreshRes.refreshToken).not.toBe(loginRes.refreshToken);

    // Verify hash rotated in database
    const latestSession = authDb.user_sessions[authDb.user_sessions.length - 1];
    expect(latestSession.refresh_token_hash).not.toBe(initialHash);
  });

  it('detects token reuse and immediately revokes all sessions in the family', async () => {
    const authService = new AuthService();
    // 1. Initial Login
    const loginReq = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId: 'MR_AUTH_1', password: 'password' }),
    });
    const loginRes = await authService.login(loginReq, mockSessionEnv);
    const oldRefreshToken = loginRes.refreshToken;

    // 2. Legitimate Refresh -> Old token becomes invalidated
    const refreshReq1 = new Request('https://api.example.com/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: oldRefreshToken }),
    });
    await authService.refresh(refreshReq1, mockSessionEnv);

    // 3. Attacker presents oldRefreshToken (Reuse Attack)
    const attackReq = new Request('https://api.example.com/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: oldRefreshToken }),
    });

    await expect(authService.refresh(attackReq, mockSessionEnv)).rejects.toThrow(
      'Session compromised or reused. Re-authentication required.'
    );

    // Verify session was revoked with REUSE_DETECTED
    const compromisedSession = authDb.user_sessions[authDb.user_sessions.length - 1];
    expect(compromisedSession.is_revoked).toBe(1);
    expect(compromisedSession.revocation_reason).toBe('REUSE_DETECTED');
  });

  it('logout marks session as revoked and generates clear cookie header', async () => {
    const authService = new AuthService();
    const loginReq = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId: 'MR_AUTH_1', password: 'password' }),
    });
    const loginRes = await authService.login(loginReq, mockSessionEnv);

    const logoutReq = new Request('https://api.example.com/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: loginRes.refreshToken }),
    });

    const logoutRes = await authService.logout(logoutReq, mockSessionEnv);
    expect(logoutRes.success).toBe(true);
    expect(logoutRes.clearCookieHeader).toContain('Max-Age=0');
  });

  it('getAuthUser middleware strictly rejects access token when session is revoked in D1 database', async () => {
    const authService = new AuthService();
    const loginReq = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId: 'MR_AUTH_1', password: 'password' }),
    });
    const loginRes = await authService.login(loginReq, mockSessionEnv);
    const token = loginRes.token;

    // 1. Token should be valid initially
    const validReq = new Request('https://api.example.com/api/data/doctors', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const authUser = await getAuthUser(validReq, mockSessionEnv);
    expect(authUser).not.toBeNull();
    expect(authUser?.userId).toBe('MR_AUTH_1');

    // 2. Revoke session in database
    const currentSession = authDb.user_sessions[authDb.user_sessions.length - 1];
    currentSession.is_revoked = 1;

    // 3. getAuthUser should now reject the token even though JWT signature is valid
    const rejectedReq = new Request('https://api.example.com/api/data/doctors', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rejectedUser = await getAuthUser(rejectedReq, mockSessionEnv);
    expect(rejectedUser).toBeNull();
  });

  it('getAuthUser middleware strictly rejects access token when user is deactivated in D1 database', async () => {
    const authService = new AuthService();
    const loginReq = new Request('https://api.example.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId: 'MR_AUTH_1', password: 'password' }),
    });
    const loginRes = await authService.login(loginReq, mockSessionEnv);
    const token = loginRes.token;

    // Deactivate user in database
    const user = authDb.users.find((u) => u.id === 'usr_auth_1');
    if (user) user.is_active = 0;

    const req = new Request('https://api.example.com/api/data/doctors', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await getAuthUser(req, mockSessionEnv);
    expect(res).toBeNull();
  });
});








