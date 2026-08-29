import { Env } from '../types';

export class CronRepository {
	constructor(private env: Env) {}

	async getActiveUsersForCron() {
		return await this.env.chikusfa_db.prepare(`
			SELECT 
				u.id, u.full_name as name, u.role, u.hq_id, u.emp_code,
				h.name as hq_name
			FROM users u
			LEFT JOIN hqs h ON u.hq_id = h.id
			WHERE u.is_active = 1
		`).all();
	}

	async getExistingDcrsForDate(date: string) {
		return await this.env.chikusfa_db.prepare('SELECT id, user_id, is_submitted FROM dcr_entries WHERE date = ?').bind(date).all();
	}

	async checkIsHoliday(date: string) {
		const { results } = await this.env.chikusfa_db.prepare('SELECT id FROM holidays WHERE date = ? AND is_active = 1').bind(date).all();
		return results.length > 0;
	}

	async getUsersOnLeave(date: string) {
		const { results } = await this.env.chikusfa_db.prepare(`
			SELECT employee_id 
			FROM leave_applications 
			WHERE ? >= from_date AND ? <= to_date AND status = 'APPROVED' AND is_active = 1
		`).bind(date, date).all();
		return new Set(results.map((l: any) => l.employee_id));
	}

	async getApprovedTourPlanWorkTypesForDate(date: string): Promise<Map<string, string>> {
		const tpMap = new Map<string, string>();
		try {
			const { results } = await this.env.chikusfa_db.prepare(`
				SELECT employee_id, details 
				FROM tour_plans 
				WHERE status = 'APPROVED' AND is_active = 1
			`).all();

			for (const row of results as any[]) {
				if (!row.employee_id || !row.details) continue;
				let detailsArray: any[] = [];
				if (typeof row.details === 'string') {
					try { detailsArray = JSON.parse(row.details); } catch (e) {}
				} else if (Array.isArray(row.details)) {
					detailsArray = row.details;
				}

				const dayEntry = detailsArray.find((d: any) => d.date === date);
				if (dayEntry && dayEntry.workType) {
					tpMap.set(row.employee_id, dayEntry.workType);
				}
			}
		} catch (e) {
			console.error("[CronRepository] Error fetching tour plans for date:", e);
		}
		return tpMap;
	}

	getUpdateDcrStatement(workType: string, submittedAt: string, remarks: string, id: string) {
		return this.env.chikusfa_db.prepare(`
			UPDATE dcr_entries 
			SET is_submitted = 1, work_type = ?, submitted_at = ?, updated_at = ?, updated_by = 'SYSTEM', day_remarks = ?
			WHERE id = ?
		`).bind(workType, submittedAt, submittedAt, remarks, id);
	}

	getInsertDcrStatement(
		dcrId: string, userId: string, date: string, workType: string, submittedAt: string,
		userName: string, role: string, hqId: string, hqName: string, remarks: string
	) {
		return this.env.chikusfa_db.prepare(`
			INSERT INTO dcr_entries (
				id, user_id, date, work_type, is_submitted, submitted_at, 
				created_at, updated_at, employee_id, employee_name, employee_role, 
				employee_hq_id, employee_hq_name, day_remarks
			) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			dcrId, userId, date, workType, submittedAt, submittedAt, submittedAt,
			userId, userName, role, hqId, hqName, remarks
		);
	}

	async executeBatch(stmts: any[]) {
		for (let i = 0; i < stmts.length; i += 100) {
			await this.env.chikusfa_db.batch(stmts.slice(i, i + 100));
		}
	}
}
