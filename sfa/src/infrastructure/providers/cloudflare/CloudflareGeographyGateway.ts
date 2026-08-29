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
      isActive: r.is_active === 1 || r.is_active === true,
    }));
  }

  async createZone(payload: Partial<Zone>): Promise<Zone> {
    return await ApiClient.fetch<Zone>('/api/data/zones', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateZone(id: string, payload: Partial<Zone>): Promise<Zone> {
    return await ApiClient.fetch<Zone>('/api/data/zones/' + id, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async createState(payload: Partial<State>): Promise<State> {
    return await ApiClient.fetch<State>('/api/data/states', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateState(id: string, payload: Partial<State>): Promise<State> {
    return await ApiClient.fetch<State>('/api/data/states/' + id, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async createHq(payload: Partial<Headquarter>): Promise<Headquarter> {
    return await ApiClient.fetch<Headquarter>('/api/data/hqs', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateHq(id: string, payload: Partial<Headquarter>): Promise<Headquarter> {
    return await ApiClient.fetch<Headquarter>('/api/data/hqs/' + id, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async createArea(payload: Partial<Area>): Promise<Area> {
    return await ApiClient.fetch<Area>('/api/data/areas', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateArea(id: string, payload: Partial<Area>): Promise<Area> {
    return await ApiClient.fetch<Area>('/api/data/areas/' + id, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async createBeat(payload: Partial<Beat>): Promise<Beat> {
    return await ApiClient.fetch<Beat>('/api/data/beats', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateBeat(id: string, payload: Partial<Beat>): Promise<Beat> {
    return await ApiClient.fetch<Beat>('/api/data/beats/' + id, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async saveTerritory(type: string, data: any): Promise<any> {
    const table = type === 'HQ' ? 'hqs' : type.toLowerCase() + 's';
    if (data.id) {
      return await ApiClient.fetch('/api/data/' + table + '/' + data.id, { method: 'PUT', body: JSON.stringify(data) });
    }
    return await ApiClient.fetch('/api/data/' + table, { method: 'POST', body: JSON.stringify(data) });
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
