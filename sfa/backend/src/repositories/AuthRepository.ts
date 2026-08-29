import { Env } from '../types';

export class AuthRepository {
	constructor(private env: Env) {}

	async getUserByUserId(userId: string) {
		return await this.env.chikusfa_db.prepare('SELECT * FROM users WHERE user_id = ?').bind(userId).first();
	}

	async getUserByRefreshToken(id: string) {
		return await this.env.chikusfa_db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').bind(id).first();
	}

	async updateFailedLogin(userId: string, attempts: number, lockedUntil: string | null, lhId: string, ipAddress: string, deviceId: string | null) {
		await this.env.chikusfa_db.batch([
			this.env.chikusfa_db.prepare(`UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?`).bind(attempts, lockedUntil, userId),
			this.env.chikusfa_db.prepare(`INSERT INTO login_history (id, user_id, ip_address, device_id, result) VALUES (?, ?, ?, ?, ?)`).bind(lhId, userId, ipAddress, deviceId, 'FAILED')
		]);
	}

	async registerDevice(userId: string, deviceId: string, deviceName: string | null, deviceModel: string | null, osVersion: string | null, appVersion: string | null) {
		await this.env.chikusfa_db.prepare('UPDATE users SET device_id = ?, device_name = ?, device_model = ?, os_version = ?, app_version = ?, registered_on = CURRENT_TIMESTAMP WHERE id = ?').bind(deviceId, deviceName, deviceModel, osVersion, appVersion, userId).run();
	}

	async updateDevice(userId: string, deviceName: string | null, deviceModel: string | null, osVersion: string | null, appVersion: string | null) {
		await this.env.chikusfa_db.prepare('UPDATE users SET os_version = ?, app_version = ?, device_name = ?, device_model = ? WHERE id = ?').bind(osVersion, appVersion, deviceName, deviceModel, userId).run();
	}

	async logFailedDeviceLogin(userId: string, lhId: string, ipAddress: string, deviceId: string) {
		await this.env.chikusfa_db.prepare(`INSERT INTO login_history (id, user_id, ip_address, device_id, result) VALUES (?, ?, ?, ?, ?)`).bind(lhId, userId, ipAddress, deviceId, 'LOCKED_DEVICE').run();
	}

	async updateSuccessfulLogin(userId: string, lhId: string, ipAddress: string, deviceId: string | null) {
		await this.env.chikusfa_db.batch([
			this.env.chikusfa_db.prepare('UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?').bind(userId),
			this.env.chikusfa_db.prepare(`INSERT INTO login_history (id, user_id, ip_address, device_id, result) VALUES (?, ?, ?, ?, ?)`).bind(lhId, userId, ipAddress, deviceId, 'SUCCESS')
		]);
	}

}
