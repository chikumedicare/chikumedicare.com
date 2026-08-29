import { Env } from '../types';

export class EmployeeRepository {
	constructor(private env: Env) {}

	async checkEmpCodeExists(empCode: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM employees WHERE emp_code = ? AND id != ?`).bind(empCode, ignoreId).first();
	}

	async checkMobileExists(mobile: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM employees WHERE mobile = ? AND id != ?`).bind(mobile, ignoreId).first();
	}

	async checkAadharExists(aadhar: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM employees WHERE aadhar_number = ? AND id != ?`).bind(aadhar, ignoreId).first();
	}

	async checkPanExists(pan: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM employees WHERE pan_number = ? AND id != ?`).bind(pan, ignoreId).first();
	}

	async getLinkedUserByEmpCode(empCode: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id, is_active FROM users WHERE emp_code = ?`).bind(empCode).first();
	}

	getDeactivateUserStatements(empCode: string, userId: string, authUserId: string): any[] {
		const uhId = `uh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		return [
			this.env.chikusfa_db.prepare(`UPDATE users SET is_active = 0 WHERE emp_code = ?`).bind(empCode),
			this.env.chikusfa_db.prepare(`INSERT INTO user_history (id, user_id, action, changed_by) VALUES (?, ?, 'DEACTIVATED_VIA_HR', ?)`).bind(uhId, userId, authUserId),
			this.env.chikusfa_db.prepare(`UPDATE user_sessions SET is_revoked = 1, revoked_at = datetime('now'), revocation_reason = 'DEACTIVATED_VIA_HR' WHERE user_id = ?`).bind(userId)
		];
	}

	getSyncUserPiiStatements(empCode: string, fields: { fullName?: string; mobile?: string; email?: string }): any[] {
		const stmts = [];
		if (fields.fullName) {
			stmts.push(this.env.chikusfa_db.prepare(`UPDATE users SET full_name = ? WHERE emp_code = ?`).bind(fields.fullName, empCode));
		}
		if (fields.mobile) {
			stmts.push(this.env.chikusfa_db.prepare(`UPDATE users SET mobile = ? WHERE emp_code = ?`).bind(fields.mobile, empCode));
		}
		if (fields.email) {
			stmts.push(this.env.chikusfa_db.prepare(`UPDATE users SET email = ? WHERE emp_code = ?`).bind(fields.email, empCode));
		}
		return stmts;
	}

	async generateNextEmpCode(): Promise<string> {
		await this.env.chikusfa_db.prepare(
			`CREATE TABLE IF NOT EXISTS system_sequences (name TEXT PRIMARY KEY, current_val INTEGER NOT NULL DEFAULT 0)`
		).run();

		const seqRow: any = await this.env.chikusfa_db.prepare(
			`SELECT current_val FROM system_sequences WHERE name = 'employee_code'`
		).first();

		let nextVal = 1;
		if (seqRow && seqRow.current_val != null) {
			nextVal = Number(seqRow.current_val) + 1;
		} else {
			const maxRow: any = await this.env.chikusfa_db.prepare(
				`SELECT MAX(CAST(SUBSTR(emp_code, 6) AS INTEGER)) as max_num FROM employees WHERE emp_code LIKE 'CHIKU%'`
			).first();
			if (maxRow && maxRow.max_num != null && !isNaN(Number(maxRow.max_num))) {
				nextVal = Math.max(1, Number(maxRow.max_num) + 1);
			}
		}

		let candidateCode = `CHIKU${String(nextVal).padStart(5, '0')}`;
		let exists = await this.env.chikusfa_db.prepare(
			`SELECT id FROM employees WHERE emp_code = ?`
		).bind(candidateCode).first();

		while (exists) {
			nextVal++;
			candidateCode = `CHIKU${String(nextVal).padStart(5, '0')}`;
			exists = await this.env.chikusfa_db.prepare(
				`SELECT id FROM employees WHERE emp_code = ?`
			).bind(candidateCode).first();
		}

		await this.env.chikusfa_db.prepare(
			`INSERT INTO system_sequences (name, current_val) VALUES ('employee_code', ?) ON CONFLICT(name) DO UPDATE SET current_val = excluded.current_val`
		).bind(nextVal).run();

		return candidateCode;
	}
}
