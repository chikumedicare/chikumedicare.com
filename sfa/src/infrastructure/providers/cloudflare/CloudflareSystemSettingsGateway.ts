import { ApiClient } from '../../api/ApiClient';
import type { ISystemSettingsGateway, SystemSettings } from '../../../core/contracts/ISystemSettingsGateway';

export class CloudflareSystemSettingsGateway implements ISystemSettingsGateway {
  async getSettings(): Promise<SystemSettings> {
    const rows = await ApiClient.fetch<any[]>('/api/data/system_settings', { method: 'GET' });
    const s = rows && rows[0] ? rows[0] : {};
    return {
      gpsTrackingEnabled: s.is_gps_enabled === 1 || s.is_gps_enabled === true || s.gps_enabled === 1 || s.gps_enabled === true,
      gpsSamplingIntervalSeconds: Number(s.gps_interval || s.gps_sampling_interval || 30),
      activeFinancialYear: String(s.active_fy || '2026-27'),
      requireApprovalForChemist: s.require_chemist_approval === 1 || s.require_chemist_approval === true,
      requireApprovalForDoctor: s.require_doctor_approval === 1 || s.require_doctor_approval === true,
      maxDailyCallLimit: Number(s.max_daily_calls || 50),
    };
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const body: Record<string, unknown> = {};
    if (settings.gpsTrackingEnabled !== undefined) body.is_gps_enabled = settings.gpsTrackingEnabled ? 1 : 0;
    if (settings.gpsSamplingIntervalSeconds !== undefined) body.gps_interval = settings.gpsSamplingIntervalSeconds;
    if (settings.activeFinancialYear !== undefined) body.active_fy = settings.activeFinancialYear;

    const res = await ApiClient.fetch<any>('/api/data/system_settings/global', { method: 'PUT', body: JSON.stringify(body) });
    return {
      gpsTrackingEnabled: res?.is_gps_enabled === 1 || res?.gps_enabled === 1 || settings.gpsTrackingEnabled === true,
      gpsSamplingIntervalSeconds: Number(res?.gps_interval || settings.gpsSamplingIntervalSeconds || 30),
      activeFinancialYear: String(res?.active_fy || settings.activeFinancialYear || '2026-27'),
      requireApprovalForChemist: true,
      requireApprovalForDoctor: true,
      maxDailyCallLimit: 50,
    };
  }
}
