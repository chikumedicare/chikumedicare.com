import type { TaPolicy } from '../../../core/contracts/IDaGateway';

import { ApiClient } from '../../api/ApiClient';
import type { IDaGateway } from '../../../core/contracts/IDaGateway';
import type { DaRate } from '../../../core/domain/hr/leave.types';

export class CloudflareDaGateway implements IDaGateway {
  async getDaRates(): Promise<DaRate[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/da_rates?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      role: r.role || 'MR',
      cityType: (r.city_type || 'HQ') as 'HQ' | 'EX_HQ' | 'OUTSTATION' | 'TRANSIT',
      amount: Number(r.amount || 0),
      effectiveFrom: r.effective_from || '2026-04-01',
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      fareType: r.fare_type || 'TWO_WAY',
      kmRate0_199: Number(r.km_rate_0_199 || 0),
      kmRate200_299: Number(r.km_rate_200_299 || 0),
      travelMode299_599: r.travel_mode_299_599 || '',
      travelMode600Plus: r.travel_mode_600_plus || '',
    }));
  }

  async saveRoleDaRates(
    role: string,
    hq: number,
    exhq: number,
    outstation: number,
    transit: number,
    effectiveFrom: string = '2026-04-01',
    isActive: boolean = true,
    existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
    taPolicy?: TaPolicy
  ): Promise<void> {
    const tiers = [
      { type: 'HQ', amt: hq, id: existingIds?.hq },
      { type: 'EX_HQ', amt: exhq, id: existingIds?.exhq },
      { type: 'OUTSTATION', amt: outstation, id: existingIds?.outstation },
      { type: 'TRANSIT', amt: transit, id: existingIds?.transit },
    ];

    for (const tier of tiers) {
      const payload: Record<string, unknown> = {
        role,
        city_type: tier.type,
        amount: tier.amt,
        effective_from: effectiveFrom,
        is_active: isActive ? 1 : 0,
        fare_type: taPolicy?.fareType || 'TWO_WAY',
        km_rate_0_199: taPolicy?.kmRate0_199 || 0,
        km_rate_200_299: taPolicy?.kmRate200_299 || 0,
        travel_mode_299_599: taPolicy?.travelMode299_599 || 'Required Sleeper Ticket',
        travel_mode_600_plus: taPolicy?.travelMode600Plus || 'Required 3rd AC Ticket',
      };

      if (tier.id && !tier.id.startsWith('temp_')) {
        await ApiClient.fetch(`/api/data/da_rates/${tier.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await ApiClient.fetch('/api/data/da_rates', { method: 'POST', body: JSON.stringify(payload) });
      }
    }
  }

  async deleteRoleDaRates(existingIds: string[]): Promise<void> {
    for (const id of existingIds) {
      if (id) {
        await ApiClient.fetch(`/api/data/da_rates/${id}`, { method: 'DELETE' });
      }
    }
  }

  async bulkAdjustDaRates(
    currentRates: DaRate[],
    percentIncrement: number,
    fixedIncrement: number,
    targetRole?: string
  ): Promise<{ count: number }> {
    const filtered = currentRates.filter((r) => !targetRole || targetRole === 'ALL' || r.role === targetRole);
    for (const rate of filtered) {
      let newAmount = rate.amount;
      if (percentIncrement) newAmount = Math.round(newAmount * (1 + percentIncrement / 100));
      if (fixedIncrement) newAmount = Math.max(0, newAmount + fixedIncrement);

      await ApiClient.fetch(`/api/data/da_rates/${rate.id}`, {
        method: 'PUT',
        body: JSON.stringify({ amount: newAmount }),
      });
    }
    return { count: filtered.length };
  }
}
