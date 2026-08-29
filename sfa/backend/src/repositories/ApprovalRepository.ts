import { Env } from '../types';

export class ApprovalRepository {
	constructor(private env: Env) {}

	async getCollectionItem(collection: string, id: string) {
		return await this.env.chikusfa_db.prepare(`SELECT * FROM ${collection} WHERE id = ?`).bind(id).first();
	}

	async getTourPlan(employeeId: string, monthYear: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM tour_plans WHERE employee_id = ? AND month_year = ?`).bind(employeeId, monthYear).first();
	}

	async updateTourPlan(id: string, details: string, managerId: string, approvedAt: string) {
		await this.env.chikusfa_db.prepare(
			`UPDATE tour_plans SET details = ?, status = 'APPROVED', approved_by = ?, approved_at = ? WHERE id = ?`
		).bind(details, managerId, approvedAt, id).run();
	}

	async insertTourPlan(id: string, employeeId: string, fy: string, monthYear: string, details: string, managerId: string, approvedAt: string) {
		await this.env.chikusfa_db.prepare(
			`INSERT INTO tour_plans (id, employee_id, fy, month_year, details, status, approved_by, approved_at, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
		).bind(
			id, employeeId, fy, monthYear, details, 'APPROVED', managerId, approvedAt, approvedAt
		).run();
	}

	async insertLeaveApplication(id: string, employeeId: string, employeeName: string, leaveType: string, fromDate: string, toDate: string, numDays: number, reason: string, emergencyContact: string, managerId: string, approvedAt: string, fy: string, hqId: string) {
		await this.env.chikusfa_db.prepare(
			`INSERT INTO leave_applications (id, employee_id, employee_name, leave_type, from_date, to_date, num_days, reason, emergency_contact, status, approved_by, approved_at, fy, hq_id, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?, ?, ?, 1, ?)`
		).bind(
			id, employeeId, employeeName, leaveType, fromDate, toDate, numDays, reason, emergencyContact, managerId, approvedAt, fy, hqId, approvedAt
		).run();
	}

	async getLeaveAllocation(employeeId: string, year: string) {
		return await this.env.chikusfa_db.prepare(
			`SELECT * FROM leave_allocations WHERE employee_id = ? AND year = ? AND is_active = 1`
		).bind(employeeId, year).first();
	}

	async updateLeaveAllocation(balanceField: string, numDays: number, employeeId: string, year: string) {
		const allowedFields = ['balance_cl', 'balance_sl', 'balance_pl'];
		if (!allowedFields.includes(balanceField)) {
			throw new Error(`Invalid balance field: ${balanceField}`);
		}
		const res = await this.env.chikusfa_db.prepare(
			`UPDATE leave_allocations SET ${balanceField} = ${balanceField} - ?, updated_at = ? WHERE employee_id = ? AND year = ? AND ${balanceField} >= ?`
		).bind(numDays, new Date().toISOString(), employeeId, year, numDays).run();

		if (res.meta.changes === 0) {
			throw new Error(`409 Conflict: Concurrent leave allocation depletion. Insufficient ${balanceField.replace('balance_', '').toUpperCase()} balance remaining.`);
		}
	}

	async insertSponsorship(id: string, doctorId: string, doctorName: string, hqId: string, employeeId: string, employeeName: string, amount: number, eventDate: string, reason: string, managerId: string, approvedAt: string) {
		await this.env.chikusfa_db.prepare(
			`INSERT INTO sponsorships (id, doctor_id, doctor_name, hq_id, employee_id, employee_name, amount, event_date, reason, status, approved_by, approved_at, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?, 1, ?)`
		).bind(
			id, doctorId, doctorName, hqId, employeeId, employeeName, amount, eventDate, reason, managerId, approvedAt, approvedAt
		).run();
	}

	async updateSponsorshipStatus(id: string, status: string, managerId: string, remarks: string, approvedAt: string) {
		await this.env.chikusfa_db.prepare(
			`UPDATE sponsorships SET status = ?, approved_by = ?, manager_remarks = ?, approved_at = ?, updated_at = ? WHERE id = ?`
		).bind(status, managerId, remarks, approvedAt, approvedAt, id).run();
	}
}
