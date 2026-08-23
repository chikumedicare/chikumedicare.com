import { ApiClient } from '../../api/ApiClient';
import type { Employee } from '../../domain/hr/employee.types';
import type { SfaUser, SfaRole } from '../../domain/hr/user.types';
import type { Zone, State, Headquarter, Area, Beat } from '../../domain/hr/geography.types';
import type { LeaveAllocation, DaRate } from '../../domain/hr/leave.types';
import { EmployeeGateway } from './employeeGateway';
import { UserGateway } from './userGateway';
import { GeographyGateway } from './geographyGateway';
import { LeaveGateway } from './leaveGateway';
import { DaGateway } from './daGateway';

export class HrGateway {
  // --- AUTHENTICATION ---
  static async login(userId: string, password: string) {
    const data = await ApiClient.fetch<{ token: string; refreshToken: string; user: any }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password, clientType: 'web-admin' }),
    });
    if (data.token) {
      if (data.user?.role !== 'ADMIN' && data.user?.role !== 'OWNER') {
        ApiClient.clearTokens();
        throw {
          error: 'Access Denied: Web Admin Portal is restricted to ADMIN and OWNER accounts only. Field representatives must use the SFA Mobile App.',
          status: 403,
        };
      }
      ApiClient.setTokens(data.token, data.refreshToken);
      localStorage.setItem('chiku_admin_logged_in', 'true');
      localStorage.setItem('chiku_auth_user', JSON.stringify(data.user));
    }
    return data;
  }

  static async verifySession(): Promise<any> {
    return await ApiClient.fetch('/api/verify', { method: 'GET' });
  }

  static logout(): void {
    ApiClient.clearTokens();
  }

  // --- DIVISIONS ---
  static async getDivisions(): Promise<any[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/divisions?includeInactive=false', { method: 'GET' });
    return (rows || []).map((row: any) => ({
      id: String(row.id),
      code: row.div_code || row.code || '',
      name: row.name || '',
      isActive: row.is_active === 1 || row.is_active === true,
    }));
  }

  // --- EMPLOYEES ---
  static getEmployees = EmployeeGateway.getEmployees;
  static createEmployee = EmployeeGateway.createEmployee;
  static updateEmployee = EmployeeGateway.updateEmployee;

  // --- USERS ---
  static getUsers = UserGateway.getUsers;
  static createUser = UserGateway.createUser;
  static updateUser = UserGateway.updateUser;
  static transferUser = UserGateway.transferUser;
  static promoteUser = UserGateway.promoteUser;
  static getTransferHistory = UserGateway.getTransferHistory;
  static getPromotionHistory = UserGateway.getPromotionHistory;
  static resetPassword = UserGateway.resetPassword;
  static resetDevice = UserGateway.resetDevice;
  static unlockAccount = UserGateway.unlockAccount;
  static getUserLoginAudit = UserGateway.getUserLoginAudit;

  // --- GEOGRAPHY ---
  static getZones = GeographyGateway.getZones;
  static getStates = GeographyGateway.getStates;
  static getHqs = GeographyGateway.getHqs;
  static getAreas = GeographyGateway.getAreas;
  static getBeats = GeographyGateway.getBeats;
  static createZone = GeographyGateway.createZone;
  static updateZone = GeographyGateway.updateZone;
  static createState = GeographyGateway.createState;
  static updateState = GeographyGateway.updateState;
  static createHq = GeographyGateway.createHq;
  static updateHq = GeographyGateway.updateHq;
  static createArea = GeographyGateway.createArea;
  static updateArea = GeographyGateway.updateArea;
  static createBeat = GeographyGateway.createBeat;
  static updateBeat = GeographyGateway.updateBeat;

  // --- LEAVE & DA ---
  static getLeaves = LeaveGateway.getLeaves;
  static createLeaveAllocation = LeaveGateway.createLeaveAllocation;
  static updateLeaveAllocation = LeaveGateway.updateLeaveAllocation;
  static deleteLeaveAllocation = LeaveGateway.deleteLeaveAllocation;
  static getLeaveApplications = LeaveGateway.getLeaveApplications;
  static updateLeaveApplicationStatus = LeaveGateway.updateLeaveApplicationStatus;

  static getDaRates = DaGateway.getDaRates;
  static saveRoleDaRates = DaGateway.saveRoleDaRates;
  static deleteRoleDaRates = DaGateway.deleteRoleDaRates;
  static bulkAdjustDaRates = DaGateway.bulkAdjustDaRates;
}
