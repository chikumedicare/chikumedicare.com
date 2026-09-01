import { Env, AuthUser } from '../types';
import { ApprovalRepository } from '../repositories/ApprovalRepository';
import { camelToSnake } from '../utils/helpers';

export class ApprovalService {
	async applyApproval(env: Env, approval: any, authUser: AuthUser) {
		const entityData = typeof approval.entity_data === 'string' ? JSON.parse(approval.entity_data) : approval.entity_data;

		let collection = '';
		if (approval.type.startsWith('DR_')) collection = 'doctors';
		else if (approval.type.startsWith('CHEMIST_')) collection = 'chemists';
		else if (approval.type.startsWith('STOCKIST_')) collection = 'stockists';
		else if (approval.type === 'TOUR_PLAN') collection = 'tour_plans';
		
		if (!collection && approval.type !== 'LEAVE') return; 

		if (approval.type.includes('_ADD') || approval.type.includes('_EDIT') || approval.type.includes('_DELETE')) {
			const dataService = (await import('./ServiceRegistry')).ServiceRegistry.get(collection);
			const id = entityData.id || `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			if (collection === 'doctors' && approval.type.includes('_ADD')) {
				const doctorPayload: any = {
					name: entityData.name || entityData.doctorName || '',
					dr_code: entityData.dr_code || entityData.doctorCode || undefined,
					registration_no: entityData.registration_no || entityData.registrationNo || null,
					qualification: entityData.qualification || '',
					speciality: entityData.speciality || 'General',
					category: entityData.category || entityData.doctorClass || 'B',
					hq_id: entityData.hq_id || entityData.hqId || '',
					area_id: entityData.area_id || entityData.areaId || '',
					beat_id: entityData.beat_id || entityData.beatId || null,
					mobile: entityData.mobile || '',
					email: entityData.email || null,
					clinic_address: entityData.clinic_address || entityData.clinicAddress || '',
					dob: entityData.dob || null,
					anniversary_date: entityData.anniversary_date || entityData.anniversaryDate || null,
					visit_frequency: Number(entityData.visit_frequency || entityData.visitFrequency || 1),
					is_active: 1,
				};
				await dataService.create(env, id, doctorPayload, authUser);
				return;
			}

			const mappedData: any = {};
			for (const key of Object.keys(entityData)) {
				if (key !== 'id') {
					mappedData[camelToSnake(key)] = entityData[key];
				}
			}

			if (approval.type.includes('_ADD')) {
				await dataService.create(env, id, mappedData, authUser);
			} 
			else if (approval.type.includes('_EDIT')) {
				if (!entityData.id) throw new Error('ID required for EDIT');
				const repo = new ApprovalRepository(env);
				const existingData = await repo.getCollectionItem(collection, entityData.id);
				await dataService.update(env, entityData.id, mappedData, authUser, existingData);
			}
			else if (approval.type.includes('_DELETE')) {
				if (!entityData.id) throw new Error('ID required for DELETE');
				const repo = new ApprovalRepository(env);
				const existingData = await repo.getCollectionItem(collection, entityData.id);
				mappedData.is_active = 0;
				await dataService.update(env, entityData.id, mappedData, authUser, existingData);
			}
		}
		else if (approval.type === 'TOUR_PLAN') {
			const id = entityData.id || `tp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			const repo = new ApprovalRepository(env);
			const existing: any = await repo.getTourPlan(entityData.employeeId, entityData.monthYear);

			if (existing) {
				await repo.updateTourPlan(existing.id, JSON.stringify(entityData.details || []), approval.manager_id, new Date().toISOString());
			} else {
				await repo.insertTourPlan(id, entityData.employeeId, entityData.fy, entityData.monthYear, JSON.stringify(entityData.details || []), approval.manager_id, new Date().toISOString());
			}
		}
		else if (approval.type === 'LEAVE') {
			const id = entityData.id || `la_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			const now = new Date().toISOString();
			const repo = new ApprovalRepository(env);

			const leaveType = entityData.leaveType;
			const fyYear = entityData.fy || new Date().getFullYear().toString();

			if (leaveType !== 'LWP') {
				const balanceField = leaveType === 'CL' ? 'balance_cl' : leaveType === 'SL' ? 'balance_sl' : 'balance_pl';
				const alloc: any = await repo.getLeaveAllocation(entityData.employeeId, fyYear);
				const currentBal = alloc ? Number(alloc[balanceField] || 0) : 0;
				const reqDays = Number(entityData.numDays || 0);

				if (currentBal < reqDays) {
					throw new Error(`Insufficient ${leaveType} balance. Requested: ${reqDays} day(s), Available: ${currentBal} day(s)`);
				}
			}

			await repo.insertLeaveApplication(id, entityData.employeeId, entityData.employeeName || '', entityData.leaveType, entityData.fromDate, entityData.toDate, entityData.numDays, entityData.reason || '', entityData.emergencyContact || '', approval.manager_id, now, entityData.fy || '', entityData.hqId || '');

			if (leaveType !== 'LWP') {
				const balanceField = leaveType === 'CL' ? 'balance_cl' : leaveType === 'SL' ? 'balance_sl' : 'balance_pl';
				await repo.updateLeaveAllocation(balanceField, entityData.numDays, entityData.employeeId, fyYear);
			}
		}
		else if (approval.type === 'SPONSORSHIP' || approval.type === 'sponsorship') {
			const id = entityData.id || approval.id;
			const now = new Date().toISOString();
			const repo = new ApprovalRepository(env);
			const existing: any = await repo.getCollectionItem('sponsorships', id);

			if (existing) {
				await repo.updateSponsorshipStatus(id, 'APPROVED', authUser.id, approval.manager_remarks || 'Approved by Admin', now);
			} else {
				await repo.insertSponsorship(
					id,
					entityData.doctorId || '',
					entityData.doctorName || '',
					entityData.hqId || authUser.hqId || '',
					approval.requested_by || authUser.id,
					entityData.employeeName || authUser.fullName || '',
					entityData.amount || 0,
					entityData.eventDate || now.split('T')[0],
					entityData.reason || '',
					authUser.id,
					now
				);
			}
		}
	}

	async rejectApproval(env: Env, approval: any, authUser: AuthUser, remarks: string = '') {
		if (approval.type === 'SPONSORSHIP' || approval.type === 'sponsorship') {
			const entityData = typeof approval.entity_data === 'string' ? JSON.parse(approval.entity_data) : approval.entity_data;
			const id = entityData?.id || approval.id;
			const now = new Date().toISOString();
			const repo = new ApprovalRepository(env);
			const existing: any = await repo.getCollectionItem('sponsorships', id);

			if (existing) {
				await repo.updateSponsorshipStatus(id, 'REJECTED', authUser.id, remarks || 'Rejected by Admin', now);
			}
		}
	}
}
