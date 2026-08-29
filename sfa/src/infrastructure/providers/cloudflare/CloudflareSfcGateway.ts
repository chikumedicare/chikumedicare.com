import type { Headquarter, Area } from '../../../core/domain/hr/geography.types';
import type { DaRate } from '../../../core/domain/hr/leave.types';

import { ApiClient } from '../../api/ApiClient';
import type { ISfcGateway } from '../../../core/contracts/ISfcGateway';


import type { SfcRate } from '../../../core/domain/hr/sfc.types';

export class CloudflareSfcGateway implements ISfcGateway {
  async getSfcRates(): Promise<SfcRate[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/sfc_rates?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      fromNodeType: r.from_node_type || 'HQ',
      fromNodeId: r.from_node_id || r.from_hq_id || '',
      fromNodeName: r.from_node_name || r.from_hq_name || '',
      toNodeType: r.to_node_type || 'AREA',
      toNodeId: r.to_node_id || r.to_area_id || '',
      toNodeName: r.to_node_name || r.to_area_name || '',
      fromHqId: r.from_hq_id || r.from_node_id || '',
      fromHqName: r.from_hq_name || r.from_node_name || '',
      toAreaId: r.to_area_id || r.to_node_id || '',
      toAreaName: r.to_area_name || r.to_node_name || '',
      travelType: (r.travel_type || 'EX_HQ') as 'LOCAL_HQ' | 'EX_HQ' | 'OUTSTATION',
      distanceKm: Number(r.distance_km || 0),
      roundTripKm: Number(r.round_trip_km || Number(r.distance_km || 0) * 2),
      ratePerKm: Number(r.rate_per_km || 0),
      approvedFare: Number(r.approved_fare || 0),
      effectiveFrom: r.effective_from || '2026-04-01',
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at || '',
    }));
  }

  async saveSfcRate(draft: Partial<SfcRate>): Promise<SfcRate> {
    const distance = Number(draft.distanceKm || 0);
    const roundTrip = distance * 2;
    const rate = Number(draft.ratePerKm || 0);
    const calculatedFare = Number(draft.approvedFare) || Math.round(roundTrip * rate);

    const fromId = draft.fromNodeId || draft.fromHqId || '';
    const fromName = draft.fromNodeName || draft.fromHqName || fromId;
    const toId = draft.toNodeId || draft.toAreaId || '';
    const toName = draft.toNodeName || draft.toAreaName || toId;

    const payload: Record<string, unknown> = {
      from_node_type: draft.fromNodeType || 'HQ',
      from_node_id: fromId,
      from_node_name: fromName,
      to_node_type: draft.toNodeType || 'AREA',
      to_node_id: toId,
      to_node_name: toName,
      from_hq_id: fromId,
      from_hq_name: fromName,
      to_area_id: toId,
      to_area_name: toName,
      travel_type: draft.travelType || 'EX_HQ',
      distance_km: distance,
      round_trip_km: roundTrip,
      rate_per_km: rate,
      approved_fare: calculatedFare,
      effective_from: draft.effectiveFrom || '2026-04-01',
      is_active: draft.isActive === false ? 0 : 1,
    };

    let res: any;
    if (draft.id && !draft.id.startsWith('temp_')) {
      res = await ApiClient.fetch(`/api/data/sfc_rates/${draft.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      res = await ApiClient.fetch('/api/data/sfc_rates', { method: 'POST', body: JSON.stringify(payload) });
    }
    return {
      id: String(res?.id || draft.id || ''),
      fromNodeType: draft.fromNodeType || 'HQ',
      fromNodeId: fromId,
      fromNodeName: fromName,
      toNodeType: draft.toNodeType || 'AREA',
      toNodeId: toId,
      toNodeName: toName,
      fromHqId: fromId,
      fromHqName: fromName,
      toAreaId: toId,
      toAreaName: toName,
      travelType: draft.travelType || 'EX_HQ',
      distanceKm: distance,
      roundTripKm: roundTrip,
      ratePerKm: rate,
      approvedFare: calculatedFare,
      effectiveFrom: draft.effectiveFrom || '2026-04-01',
      isActive: draft.isActive !== false,
      createdAt: res?.createdAt || res?.created_at || new Date().toISOString(),
    };
  }

  async deleteSfcRate(id: string): Promise<void> {
    await ApiClient.fetch(`/api/data/sfc_rates/${id}`, { method: 'DELETE' });
  }

  async autoGenerateMissingRoutes(
    hqs: Headquarter[] = [],
    areas: Area[] = [],
    daRates: DaRate[] = [],
    onProgress?: (msg: string) => void
  ): Promise<{ createdCount: number }> {
    const existingList = await this.getSfcRates();
    const existingPairs = new Set(existingList.map((s) => `${s.fromNodeId}_${s.toNodeId}`));

    const activeDa = daRates.find((d) => d.isActive) || daRates[0];
    const defaultRatePerKm = Number(activeDa?.kmRate0_199 || 3.5);

    const missingPairs: Array<{
      fType: 'HQ' | 'AREA'; fId: string; fName: string;
      tType: 'HQ' | 'AREA'; tId: string; tName: string;
    }> = [];

    for (let i = 0; i < hqs.length; i++) {
      for (let j = 0; j < hqs.length; j++) {
        if (i !== j) {
          const h1 = hqs[i];
          const h2 = hqs[j];
          const key = `${h1.id}_${h2.id}`;
          if (!existingPairs.has(key)) {
            missingPairs.push({
              fType: 'HQ', fId: h1.id, fName: h1.name || h1.hq_name || h1.id,
              tType: 'HQ', tId: h2.id, tName: h2.name || h2.hq_name || h2.id,
            });
          }
        }
      }
    }

    for (const h of hqs) {
      for (const a of areas) {
        const key = `${h.id}_${a.id}`;
        if (!existingPairs.has(key)) {
          missingPairs.push({
            fType: 'HQ', fId: h.id, fName: h.name || h.hq_name || h.id,
            tType: 'AREA', tId: a.id, tName: a.name || a.area_name || a.id,
          });
        }
      }
    }

    if (missingPairs.length === 0) {
      if (onProgress) onProgress('All inter-distance SFC routes are already generated!');
      return { createdCount: 0 };
    }

    let count = 0;
    for (const p of missingPairs) {
      if (onProgress) onProgress(`Generating route ${count + 1}/${missingPairs.length}: ${p.fName} ➔ ${p.tName}...`);
      const seedStr = `${p.fId}_${p.tId}`;
      let hash = 0;
      for (let k = 0; k < seedStr.length; k++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(k);
        hash |= 0;
      }
      const roadKm = 25 + (Math.abs(hash) % 115);
      const roundTripKm = roadKm * 2;
      const calculatedFare = Math.round(roundTripKm * defaultRatePerKm);
      const category = roadKm <= 20 ? 'LOCAL_HQ' : roadKm <= 110 ? 'EX_HQ' : 'OUTSTATION';

      await this.saveSfcRate({
        fromNodeType: p.fType,
        fromNodeId: p.fId,
        fromNodeName: p.fName,
        toNodeType: p.tType,
        toNodeId: p.tId,
        toNodeName: p.tName,
        travelType: category,
        distanceKm: roadKm,
        roundTripKm,
        ratePerKm: defaultRatePerKm,
        approvedFare: calculatedFare,
        effectiveFrom: '2026-04-01',
        isActive: true,
      });

      count++;
    }

    if (onProgress) onProgress(`Successfully generated ${count} bidirectional inter-distance SFC route slabs!`);
    return { createdCount: count };
  }
}
