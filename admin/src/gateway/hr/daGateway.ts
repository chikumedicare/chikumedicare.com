import { ApiClient } from '../../api/ApiClient';
import type { DaRate } from '../../domain/hr/leave.types';

export class DaGateway {
  static async getDaRates(): Promise<DaRate[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/da_rates?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      role: r.role || '',
      cityType: (r.city_type || 'HQ') as 'HQ' | 'EX_HQ' | 'OUTSTATION' | 'TRANSIT',
      amount: Number(r.amount || 0),
      effectiveFrom: r.effective_from || '',
      isActive: r.is_active === 1 || r.is_active === true,
      fareType: (r.fare_type || 'TWO_WAY') as 'ONE_WAY' | 'TWO_WAY',
      kmRate0_199: Number(r.km_rate_0_199 || 0),
      kmRate200_299: Number(r.km_rate_200_299 || 0),
      travelMode299_599: r.travel_mode_299_599 || 'Required Sleeper Ticket',
      travelMode600Plus: r.travel_mode_600_plus || 'Required 3rd AC Ticket',
    }));
  }

  static async saveRoleDaRates(
    role: string,
    hq: number,
    exhq: number,
    outstation: number,
    transit: number,
    effectiveFrom?: string,
    isActive = true,
    existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
    taPolicy?: {
      fareType?: 'ONE_WAY' | 'TWO_WAY';
      kmRate0_199?: number;
      kmRate200_299?: number;
      travelMode299_599?: string;
      travelMode600Plus?: string;
    }
  ): Promise<any> {
    const tiers: Array<{ cityType: 'HQ' | 'EX_HQ' | 'OUTSTATION' | 'TRANSIT'; amount: number; id?: string }> = [
      { cityType: 'HQ', amount: hq, id: existingIds?.hq },
      { cityType: 'EX_HQ', amount: exhq, id: existingIds?.exhq },
      { cityType: 'OUTSTATION', amount: outstation, id: existingIds?.outstation },
      { cityType: 'TRANSIT', amount: transit, id: existingIds?.transit },
    ];

    for (const tier of tiers) {
      const payload: Record<string, any> = {
        role,
        city_type: tier.cityType,
        amount: tier.amount,
        effective_from: effectiveFrom || '2024-04-01',
        is_active: isActive ? 1 : 0,
        fare_type: taPolicy?.fareType || 'TWO_WAY',
        km_rate_0_199: taPolicy?.kmRate0_199 || 0,
        km_rate_200_299: taPolicy?.kmRate200_299 || 0,
        travel_mode_299_599: taPolicy?.travelMode299_599 || 'Required Sleeper Ticket',
        travel_mode_600_plus: taPolicy?.travelMode600Plus || 'Required 3rd AC Ticket',
      };

      if (tier.id && !tier.id.startsWith('temp_')) {
        await ApiClient.fetch(`/api/data/da_rates/${tier.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await ApiClient.fetch('/api/data/da_rates', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    }
    return { success: true };
  }

  static async deleteRoleDaRates(existingIds: string[]): Promise<any> {
    for (const id of existingIds) {
      if (id) {
        await ApiClient.fetch(`/api/data/da_rates/${id}`, { method: 'DELETE' });
      }
    }
    return { success: true };
  }

  static async bulkAdjustDaRates(
    currentRates: DaRate[],
    percentIncrement: number,
    fixedIncrement: number,
    targetRole?: string
  ): Promise<any> {
    const filtered = currentRates.filter((r) => !targetRole || targetRole === 'ALL' || r.role === targetRole);
    for (const rate of filtered) {
      let newAmount = rate.amount;
      if (percentIncrement) {
        newAmount = Math.round(newAmount * (1 + percentIncrement / 100));
      }
      if (fixedIncrement) {
        newAmount = Math.max(0, newAmount + fixedIncrement);
      }

      await ApiClient.fetch(`/api/data/da_rates/${rate.id}`, {
        method: 'PUT',
        body: JSON.stringify({ amount: newAmount }),
      });
    }
    return { success: true, count: filtered.length };
  }
}
