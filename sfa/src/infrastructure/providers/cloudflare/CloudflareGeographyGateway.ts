import { IGeographyGateway } from '../../../core/contracts/IGeographyGateway';
import type { Zone, State, Headquarter, Area, Beat, GeographyCoverage } from '../../../core/domain/hr/geography.types';
import { ApiClient } from '../../api/ApiClient';

export class CloudflareGeographyGateway implements IGeographyGateway {
  async getZones(): Promise<Zone[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/zones?limit=100', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      name: String(r.name || r.zone_name || ''),
      code: String(r.code || r.zone_code || ''),
      divisionId: String(r.division_id || r.divisionId || ''),
      description: r.description || '',
      isActive: r.is_active === 1 || r.is_active === true,
    }));
  }

  async getStates(): Promise<State[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/states?limit=200', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      name: String(r.name || r.state_name || ''),
      code: String(r.code || r.state_code || ''),
      zoneId: String(r.zone_id || r.zoneId || ''),
      divisionId: String(r.division_id || r.divisionId || ''),
      description: r.description || '',
      displayOrder: r.display_order || 0,
      isActive: r.is_active === 1 || r.is_active === true,
    }));
  }

  async getHqs(): Promise<Headquarter[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/hqs?limit=500', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      name: String(r.name || r.hq_name || ''),
      code: String(r.code || r.hq_code || ''),
      stateId: String(r.state_id || r.stateId || ''),
      divisionId: String(r.division_id || r.divisionId || ''),
      hqType: r.hq_type || 'HQ',
      city: r.city || '',
      district: r.district || '',
      pinCode: r.pin_code || r.pincode || '',
      isPoolHq: r.is_pool_hq === 1 || r.is_pool_hq === true,
      parentPoolHqId: r.parent_pool_hq_id || '',
      latitude: r.latitude,
      longitude: r.longitude,
      displayOrder: r.display_order || 0,
      description: r.description || '',
      isActive: r.is_active === 1 || r.is_active === true,
    }));
  }

  async getHeadquarters(): Promise<Headquarter[]> {
    return await this.getHqs();
  }

  async getAreas(): Promise<Area[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/areas?limit=1000', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      name: String(r.name || r.area_name || ''),
      code: String(r.code || r.area_code || ''),
      hqId: String(r.hq_id || r.hqId || ''),
      divisionId: String(r.division_id || r.divisionId || ''),
      territoryType: r.territory_type || 'LOCAL',
      travelMode: r.travel_mode || 'TWO_SIDE',
      bothSideAllowed: r.both_side_allowed === 1 || r.both_side_allowed === true,
      displayOrder: r.display_order || 0,
      description: r.description || '',
      isActive: r.is_active === 1 || r.is_active === true,
    }));
  }

  async getBeats(): Promise<Beat[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/beats?limit=2000', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      name: String(r.name || r.beat_name || ''),
      code: String(r.code || r.beat_code || ''),
      areaId: String(r.area_id || r.areaId || ''),
      hqId: String(r.hq_id || r.hqId || ''),
      divisionId: String(r.division_id || r.divisionId || ''),
      beatType: r.beat_type || 'CORE',
      displayOrder: r.display_order || 0,
      description: r.description || '',
      isActive: r.is_active === 1 || r.is_active === true,
    }));
  }

  async createZone(payload: Partial<Zone>): Promise<Zone> {
    const body: Record<string, any> = {
      name: payload.name,
      division_id: payload.divisionId || undefined,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.zone_code = payload.code;
    return await ApiClient.fetch<Zone>('/api/data/zones', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateZone(id: string, payload: Partial<Zone>): Promise<Zone> {
    const body: Record<string, any> = {
      name: payload.name,
      division_id: payload.divisionId || undefined,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.zone_code = payload.code;
    return await ApiClient.fetch<Zone>('/api/data/zones/' + id, { method: 'PUT', body: JSON.stringify(body) });
  }

  async createState(payload: Partial<State>): Promise<State> {
    const body: Record<string, any> = {
      state_name: payload.name,
      zone_id: payload.zoneId,
      division_id: payload.divisionId || undefined,
      description: payload.description || undefined,
      display_order: payload.displayOrder || 0,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.state_code = payload.code;
    return await ApiClient.fetch<State>('/api/data/states', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateState(id: string, payload: Partial<State>): Promise<State> {
    const body: Record<string, any> = {
      state_name: payload.name,
      zone_id: payload.zoneId,
      division_id: payload.divisionId || undefined,
      description: payload.description || undefined,
      display_order: payload.displayOrder || 0,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.state_code = payload.code;
    return await ApiClient.fetch<State>('/api/data/states/' + id, { method: 'PUT', body: JSON.stringify(body) });
  }

  async createHq(payload: Partial<Headquarter>): Promise<Headquarter> {
    const body: Record<string, any> = {
      hq_name: payload.name,
      state_id: payload.stateId,
      division_id: payload.divisionId || undefined,
      hq_type: payload.hqType || 'HQ',
      city: payload.city || undefined,
      district: payload.district || undefined,
      pin_code: payload.pinCode || undefined,
      is_pool_hq: payload.isPoolHq ? 1 : 0,
      parent_pool_hq_id: payload.parentPoolHqId || undefined,
      latitude: payload.latitude || undefined,
      longitude: payload.longitude || undefined,
      display_order: payload.displayOrder || 0,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.hq_code = payload.code;
    return await ApiClient.fetch<Headquarter>('/api/data/hqs', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateHq(id: string, payload: Partial<Headquarter>): Promise<Headquarter> {
    const body: Record<string, any> = {
      hq_name: payload.name,
      state_id: payload.stateId,
      division_id: payload.divisionId || undefined,
      hq_type: payload.hqType || 'HQ',
      city: payload.city || undefined,
      district: payload.district || undefined,
      pin_code: payload.pinCode || undefined,
      is_pool_hq: payload.isPoolHq ? 1 : 0,
      parent_pool_hq_id: payload.parentPoolHqId || undefined,
      latitude: payload.latitude || undefined,
      longitude: payload.longitude || undefined,
      display_order: payload.displayOrder || 0,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.hq_code = payload.code;
    return await ApiClient.fetch<Headquarter>('/api/data/hqs/' + id, { method: 'PUT', body: JSON.stringify(body) });
  }

  async createArea(payload: Partial<Area>): Promise<Area> {
    const body: Record<string, any> = {
      area_name: payload.name,
      hq_id: payload.hqId,
      division_id: payload.divisionId || undefined,
      territory_type: payload.territoryType || 'LOCAL',
      travel_mode: payload.travelMode || 'TWO_SIDE',
      both_side_allowed: payload.bothSideAllowed === false ? 0 : 1,
      display_order: payload.displayOrder || 0,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.area_code = payload.code;
    return await ApiClient.fetch<Area>('/api/data/areas', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateArea(id: string, payload: Partial<Area>): Promise<Area> {
    const body: Record<string, any> = {
      area_name: payload.name,
      hq_id: payload.hqId,
      division_id: payload.divisionId || undefined,
      territory_type: payload.territoryType || 'LOCAL',
      travel_mode: payload.travelMode || 'TWO_SIDE',
      both_side_allowed: payload.bothSideAllowed === false ? 0 : 1,
      display_order: payload.displayOrder || 0,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.area_code = payload.code;
    return await ApiClient.fetch<Area>('/api/data/areas/' + id, { method: 'PUT', body: JSON.stringify(body) });
  }

  async createBeat(payload: Partial<Beat>): Promise<Beat> {
    const body: Record<string, any> = {
      beat_name: payload.name,
      area_id: payload.areaId,
      division_id: payload.divisionId || undefined,
      beat_type: payload.beatType || 'CORE',
      display_order: payload.displayOrder || 0,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.beat_code = payload.code;
    return await ApiClient.fetch<Beat>('/api/data/beats', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateBeat(id: string, payload: Partial<Beat>): Promise<Beat> {
    const body: Record<string, any> = {
      beat_name: payload.name,
      area_id: payload.areaId,
      division_id: payload.divisionId || undefined,
      beat_type: payload.beatType || 'CORE',
      display_order: payload.displayOrder || 0,
      description: payload.description || undefined,
      is_active: payload.isActive === false ? 0 : 1,
    };
    if (payload.code) body.beat_code = payload.code;
    return await ApiClient.fetch<Beat>('/api/data/beats/' + id, { method: 'PUT', body: JSON.stringify(body) });
  }

  async saveTerritory(type: string, data: any): Promise<any> {
    if (type === 'Zone') return data.id ? this.updateZone(data.id, data) : this.createZone(data);
    if (type === 'State') return data.id ? this.updateState(data.id, data) : this.createState(data);
    if (type === 'HQ') return data.id ? this.updateHq(data.id, data) : this.createHq(data);
    if (type === 'Area') return data.id ? this.updateArea(data.id, data) : this.createArea(data);
    if (type === 'Beat') return data.id ? this.updateBeat(data.id, data) : this.createBeat(data);
    return null;
  }

  async deleteTerritory(type: string, id: string): Promise<void> {
    const table = type === 'HQ' ? 'hqs' : type.toLowerCase() + 's';
    await ApiClient.fetch('/api/data/' + table + '/' + id, { method: 'DELETE' });
  }

  async getUserGeography(userId: string): Promise<GeographyCoverage | null> {
    const rows = await ApiClient.fetch<any[]>('/api/data/geography_coverage?user_id=' + userId + '&limit=1', { method: 'GET' });
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      userId,
      primaryHqId: String(r.primary_hq_id || r.primaryHqId || ''),
      coveringHqIds: typeof r.covering_hq_ids === 'string' ? JSON.parse(r.covering_hq_ids || '[]') : (r.coveringHqIds || []),
      areaIds: typeof r.area_ids === 'string' ? JSON.parse(r.area_ids || '[]') : (r.areaIds || []),
    };
  }

  async saveUserGeography(coverage: GeographyCoverage): Promise<void> {
    const payload = {
      user_id: coverage.userId,
      primary_hq_id: coverage.primaryHqId,
      covering_hq_ids: JSON.stringify(coverage.coveringHqIds || []),
      area_ids: JSON.stringify(coverage.areaIds || []),
      updated_at: new Date().toISOString(),
    };
    await ApiClient.fetch('/api/data/geography_coverage', { method: 'POST', body: JSON.stringify(payload) });
  }
}
