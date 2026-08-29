import type { SfcRate } from '../domain/hr/sfc.types';
import type { Headquarter, Area } from '../domain/hr/geography.types';
import type { DaRate } from '../domain/hr/leave.types';

export interface ISfcGateway {
  getSfcRates(): Promise<SfcRate[]>;
  saveSfcRate(draft: Partial<SfcRate>): Promise<SfcRate>;
  deleteSfcRate(id: string): Promise<void>;
  autoGenerateMissingRoutes(
    hqs?: Headquarter[],
    areas?: Area[],
    daRates?: DaRate[],
    onProgress?: (msg: string) => void
  ): Promise<{ createdCount: number }>;
}
