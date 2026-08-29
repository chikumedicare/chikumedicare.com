import { Env } from '../types';

export class MasterDataRepository {
	constructor(private env: Env) {}

	async checkZoneCodeExists(zoneCode: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM zones WHERE zone_code = ? AND id != ?`).bind(zoneCode, ignoreId).first();
	}
	async checkZoneNameExists(name: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM zones WHERE name = ? AND id != ?`).bind(name, ignoreId).first();
	}
	async checkStateCodeExists(stateCode: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM states WHERE state_code = ? AND id != ?`).bind(stateCode, ignoreId).first();
	}
	async checkStateNameExists(stateName: string, zoneId: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM states WHERE state_name = ? AND zone_id = ? AND id != ?`).bind(stateName, zoneId, ignoreId).first();
	}
	async checkActiveHqsInState(stateId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM hqs WHERE state_id = ? AND is_active = 1`).bind(stateId).first();
	}
	async checkHqCodeExists(hqCode: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM hqs WHERE hq_code = ? AND id != ?`).bind(hqCode, ignoreId).first();
	}
	async checkHqNameExists(hqName: string, stateId: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM hqs WHERE hq_name = ? AND state_id = ? AND id != ?`).bind(hqName, stateId, ignoreId).first();
	}
	async checkActiveDepsForHq(hqId: string) {
		return await this.env.chikusfa_db.prepare(`
			SELECT 1 FROM areas WHERE hq_id = ? AND is_active = 1
			UNION SELECT 1 FROM users WHERE hq_id = ? AND is_active = 1
			UNION SELECT 1 FROM doctors WHERE hq_id = ? AND is_active = 1
			UNION SELECT 1 FROM chemists WHERE hq_id = ? AND is_active = 1
			UNION SELECT 1 FROM stockists WHERE hq_id = ? AND is_active = 1
		`).bind(hqId, hqId, hqId, hqId, hqId).first();
	}
	async checkAreaCodeExists(areaCode: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM areas WHERE area_code = ? AND id != ?`).bind(areaCode, ignoreId).first();
	}
	async checkAreaNameExists(areaName: string, hqId: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM areas WHERE area_name = ? AND hq_id = ? AND id != ?`).bind(areaName, hqId, ignoreId).first();
	}
	async checkActiveDepsForArea(areaId: string) {
		return await this.env.chikusfa_db.prepare(`
			SELECT 1 FROM users WHERE primary_area_id = ? AND is_active = 1
			UNION SELECT 1 FROM doctors WHERE area_id = ? AND is_active = 1
			UNION SELECT 1 FROM chemists WHERE area_id = ? AND is_active = 1
			UNION SELECT 1 FROM stockists WHERE area_id = ? AND is_active = 1
			UNION SELECT 1 FROM targets WHERE area_id = ?
			UNION SELECT 1 FROM dcr_entries WHERE area_id = ?
		`).bind(areaId, areaId, areaId, areaId, areaId, areaId).first();
	}
	async getParentHq(hqId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT state_id, zone_id FROM hqs WHERE id = ?`).bind(hqId).first();
	}
	async checkBeatCodeExists(beatCode: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM beats WHERE beat_code = ? AND id != ?`).bind(beatCode, ignoreId).first();
	}
	async checkBeatNameExists(beatName: string, areaId: string, ignoreId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT id FROM beats WHERE beat_name = ? AND area_id = ? AND id != ?`).bind(beatName, areaId, ignoreId).first();
	}
	async checkActiveDepsForBeat(beatId: string) {
		return await this.env.chikusfa_db.prepare(`
			SELECT 1 FROM doctors WHERE beat_id = ? AND is_active = 1
			UNION SELECT 1 FROM chemists WHERE beat_id = ? AND is_active = 1
			UNION SELECT 1 FROM stockists WHERE beat_id = ? AND is_active = 1
			UNION SELECT 1 FROM targets WHERE beat_id = ?
			UNION SELECT 1 FROM dcr_entries WHERE beat_id = ?
		`).bind(beatId, beatId, beatId, beatId, beatId).first();
	}
	async getParentArea(areaId: string) {
		return await this.env.chikusfa_db.prepare(`SELECT hq_id, state_id, zone_id FROM areas WHERE id = ?`).bind(areaId).first();
	}
	async hasActiveStates(zoneId: string) {
		const { results } = await this.env.chikusfa_db.prepare(`SELECT id FROM states WHERE zone_id = ? AND is_active = 1 LIMIT 1`).bind(zoneId).all();
		return results.length > 0;
	}
	async hasActiveHqs(stateId: string) {
		const { results } = await this.env.chikusfa_db.prepare(`SELECT id FROM hqs WHERE state_id = ? AND is_active = 1 LIMIT 1`).bind(stateId).all();
		return results.length > 0;
	}
	async hasActiveAreas(hqId: string) {
		const { results } = await this.env.chikusfa_db.prepare(`SELECT id FROM areas WHERE hq_id = ? AND is_active = 1 LIMIT 1`).bind(hqId).all();
		return results.length > 0;
	}
	async hasUsersMappedToArea(areaId: string) {
		const { results } = await this.env.chikusfa_db.prepare(`SELECT id FROM users WHERE area_ids LIKE ? AND is_active = 1 LIMIT 1`).bind(`%"${areaId}"%`).all();
		return results.length > 0;
	}
}
