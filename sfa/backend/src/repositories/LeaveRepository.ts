import { Env } from '../types';

const ALLOWED_BALANCE_FIELDS = ['balance_cl', 'balance_sl', 'balance_pl'];

export class LeaveRepository {
	constructor(private env: Env) {}

	async getLeaveApplicationById(id: string) {
		return await this.env.chikusfa_db.prepare('SELECT * FROM leave_applications WHERE id = ?').bind(id).first();
	}

	async getLeaveAllocation(employeeId: string, year: string) {
		return await this.env.chikusfa_db.prepare(
			`SELECT * FROM leave_allocations WHERE employee_id = ? AND year = ? AND is_active = 1`
		).bind(employeeId, year).first();
	}

	private validateBalanceField(balanceField: string): string {
		if (!ALLOWED_BALANCE_FIELDS.includes(balanceField)) {
			throw new Error(`Invalid balance field: ${balanceField}`);
		}
		return balanceField;
	}

	getRestoreBalanceStatement(balanceField: string, numDays: number, employeeId: string, fyYear: string) {
		const safeField = this.validateBalanceField(balanceField);
		return this.env.chikusfa_db.prepare(
			`UPDATE leave_allocations SET ${safeField} = ${safeField} + ? WHERE employee_id = ? AND year = ?`
		).bind(numDays, employeeId, fyYear);
	}

	getDeductBalanceStatement(balanceField: string, numDays: number, employeeId: string, fyYear: string) {
		const safeField = this.validateBalanceField(balanceField);
		return this.env.chikusfa_db.prepare(
			`UPDATE leave_allocations SET ${safeField} = MAX(${safeField} - ?, 0) WHERE employee_id = ? AND year = ?`
		).bind(numDays, employeeId, fyYear);
	}
}
