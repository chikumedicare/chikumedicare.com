export type { TaPolicy } from '../domain/hr/leave.types';
import type { DaRate, TaPolicy } from '../domain/hr/leave.types';

export interface IDaGateway {
  getDaRates(): Promise<DaRate[]>;
  saveRoleDaRates(
    role: string,
    hq: number,
    exhq: number,
    outstation: number,
    transit: number,
    effectiveFrom?: string,
    isActive?: boolean,
    existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
    taPolicy?: TaPolicy
  ): Promise<void>;
  deleteRoleDaRates(ids: string[]): Promise<void>;
  bulkAdjustDaRates(
    currentRates: DaRate[],
    percentIncrement: number,
    fixedIncrement: number,
    targetRole?: string
  ): Promise<{ count: number }>;
}
