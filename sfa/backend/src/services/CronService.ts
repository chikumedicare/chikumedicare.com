import { Env } from '../types';
import { CronRepository } from '../repositories/CronRepository';

export class CronService {
	async handleScheduled(env: Env) {
		const nowUTC = new Date();
		const istOffset = 5.5 * 60 * 60 * 1000;
		const nowIST = new Date(nowUTC.getTime() + istOffset);
		const today = nowIST.toISOString().split('T')[0];
		
		try {
			const repo = new CronRepository(env);
			const { results: activeUsers } = await repo.getActiveUsersForCron();
			
			const { results: existingDcrs } = await repo.getExistingDcrsForDate(today);
			
			const isHoliday = await repo.checkIsHoliday(today);
			
			const usersOnLeave = await repo.getUsersOnLeave(today);
			const tourPlanWorkTypes = await repo.getApprovedTourPlanWorkTypesForDate(today);

			const submittedUserIds = new Set(
				existingDcrs.filter((d: any) => d.is_submitted === 1 || d.is_submitted === true).map((d: any) => d.user_id)
			);
			
			const stmts = [];
			const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
			
			let markedCount = 0;
			const isSunday = nowIST.getDay() === 0;

			for (const user of activeUsers as any[]) {
				if (!submittedUserIds.has(user.id)) {
					const existingDcr: any = existingDcrs.find((d: any) => d.user_id === user.id);
					
					let determinedWorkType = 'ABSENT';
					let remarks = 'Auto-marked (No final submit)';

					if (usersOnLeave.has(user.id)) {
						determinedWorkType = 'LEAVE';
						remarks = 'Auto-marked Approved Leave';
					} else if (isHoliday) {
						determinedWorkType = 'HOLIDAY';
						remarks = 'Auto-marked Holiday';
					} else if (tourPlanWorkTypes.has(user.id)) {
						determinedWorkType = tourPlanWorkTypes.get(user.id)!;
						remarks = `Auto-marked from Approved Tour Plan (${determinedWorkType})`;
					} else if (isSunday) {
						determinedWorkType = 'WEEKLY_OFF';
						remarks = 'Auto-marked Sunday Weekly Off';
					}

					if (existingDcr) {
						stmts.push(
							repo.getUpdateDcrStatement(determinedWorkType, now, remarks, existingDcr.id)
						);
					} else {
						const dcrId = `dcr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
						stmts.push(
							repo.getInsertDcrStatement(dcrId, user.id, today, determinedWorkType, now, user.name, user.role, user.hq_id, user.hq_name || '', remarks)
						);
					}
					markedCount++;
				}
			}
			
			await repo.executeBatch(stmts);
			console.log(`Auto-Absent Cron completed for ${today}. Marked ${markedCount} users as HOLIDAY/LEAVE/ABSENT.`);
		} catch (e) {
			console.error("Auto-Absent Cron failed:", e);
		}
	}
}


