export interface SystemSettings {
  gpsTrackingEnabled: boolean;
  gpsSamplingIntervalSeconds: number;
  activeFinancialYear: string;
  requireApprovalForChemist: boolean;
  requireApprovalForDoctor: boolean;
  maxDailyCallLimit: number;
}

export interface ISystemSettingsGateway {
  getSettings(): Promise<SystemSettings>;
  updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
}
