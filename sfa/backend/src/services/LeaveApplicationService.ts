import { DataService } from './DataService';
import { Env, AuthUser } from '../types';
import { LeaveRepository } from '../repositories/LeaveRepository';

export class LeaveApplicationService extends DataService {
	protected async preSaveCheck(env: Env, validData: any, existingData: any, id: string, action: 'CREATE' | 'UPDATE'): Promise<void> {

		if (action === 'CREATE' && validData.leave_type && validData.leave_type !== 'LWP' && validData.num_days > 0) {
			const repo = new LeaveRepository(env);
			const fyYear = validData.fy || new Date().getFullYear().toString();
			const alloc: any = await repo.getLeaveAllocation(validData.employee_id, fyYear);
			const balanceField = validData.leave_type === 'CL' ? 'balance_cl' : validData.leave_type === 'SL' ? 'balance_sl' : 'balance_pl';
			const currentBal = alloc ? Number(alloc[balanceField] || 0) : 0;
			const reqDays = Number(validData.num_days || 0);

			if (currentBal < reqDays) {
				throw new Error(`Insufficient ${validData.leave_type} balance. Requested: ${reqDays} day(s), Available: ${currentBal} day(s)`);
			}
		}
	}

	protected async getAdditionalSaveStatements(env: Env, action: 'CREATE' | 'UPDATE', id: string, validData: any, existingData: any, authUser: AuthUser): Promise<any[]> {
		const stmts: any[] = [];
		if (action === 'UPDATE' && validData.status && validData.status !== existingData?.status) {
			if (!validData.approved_by) {
				validData.approved_by = authUser ? String(authUser.id) : 'Admin';
			}
			validData.approved_at = new Date().toISOString();
		}
		if (action === 'CREATE' && validData.leave_type && validData.leave_type !== 'LWP' && validData.num_days > 0) {
			const allowedFields = ['balance_cl', 'balance_sl', 'balance_pl'];
			const balanceField = validData.leave_type === 'CL' ? 'balance_cl' : validData.leave_type === 'SL' ? 'balance_sl' : 'balance_pl';
			if (allowedFields.includes(balanceField)) {
				const repo = new LeaveRepository(env);
				const fyYear = validData.fy || new Date().getFullYear().toString();
				stmts.push(repo.getDeductBalanceStatement(balanceField, validData.num_days, validData.employee_id, fyYear));
			}
		}
		return stmts;
	}

	protected async getDeleteStatements(env: Env, id: string, authUser: AuthUser): Promise<any[]> {
		const stmts: any[] = [];
		const repo = new LeaveRepository(env);
		const leaveApp: any = await repo.getLeaveApplicationById(id);
		if (leaveApp && leaveApp.leave_type !== 'LWP' && leaveApp.is_active === 1) {
			const allowedFields = ['balance_cl', 'balance_sl', 'balance_pl'];
			const balanceField = leaveApp.leave_type === 'CL' ? 'balance_cl' : leaveApp.leave_type === 'SL' ? 'balance_sl' : 'balance_pl';
			if (allowedFields.includes(balanceField)) {
				const fyYear = leaveApp.fy || new Date().getFullYear().toString();
				stmts.push(repo.getRestoreBalanceStatement(balanceField, leaveApp.num_days, leaveApp.employee_id, fyYear));
			}
		}
		return stmts;
	}
}

