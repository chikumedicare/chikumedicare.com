import { ApiClient } from '../../api/ApiClient';
import type { Zone, State, Headquarter, Area, Beat } from '../../domain/hr/geography.types';
import { mapHqFromDb, mapAreaFromDb, mapBeatFromDb, mapZoneFromDb, mapStateFromDb } from './hrDataMapper';

export class GeographyGateway {
  static async getZones(divisionId?: string): Promise<Zone[]> {
    const url = divisionId ? `/api/data/zones?division_id=${divisionId}&includeInactive=true` : '/api/data/zones?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(url, { method: 'GET' });
    return (rows || []).map(mapZoneFromDb);
  }

  static async getStates(divisionId?: string): Promise<State[]> {
    const url = divisionId ? `/api/data/states?division_id=${divisionId}&includeInactive=true` : '/api/data/states?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(url, { method: 'GET' });
    return (rows || []).map(mapStateFromDb);
  }

  static async getHqs(divisionId?: string): Promise<Headquarter[]> {
    const url = divisionId ? `/api/data/hqs?division_id=${divisionId}&includeInactive=true` : '/api/data/hqs?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(url, { method: 'GET' });
    return (rows || []).map(mapHqFromDb);
  }

  static async getAreas(divisionId?: string): Promise<Area[]> {
    const url = divisionId ? `/api/data/areas?division_id=${divisionId}&includeInactive=true` : '/api/data/areas?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(url, { method: 'GET' });
    return (rows || []).map(mapAreaFromDb);
  }

  static async getBeats(divisionId?: string): Promise<Beat[]> {
    const url = divisionId ? `/api/data/beats?division_id=${divisionId}&includeInactive=true` : '/api/data/beats?includeInactive=true';
    const rows = await ApiClient.fetch<any[]>(url, { method: 'GET' });
    return (rows || []).map(mapBeatFromDb);
  }

  static async createZone(data: Partial<Zone>): Promise<any> {
    const body: any = { name: data.name, is_active: data.isActive !== false ? 1 : 0 };
    if (data.code) body.zone_code = data.code;
    if (data.divisionId) body.division_id = data.divisionId;
    if (data.description) body.description = data.description;
    if (data.headUserId) body.head_user_id = data.headUserId;
    if (data.headUserName) body.head_user_name = data.headUserName;
    return await ApiClient.fetch('/api/data/zones', { method: 'POST', body: JSON.stringify(body) });
  }

  static async updateZone(id: string, updates: Partial<Zone>): Promise<any> {
    const body: any = {};
    if (updates.code !== undefined) body.zone_code = updates.code;
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.divisionId !== undefined) body.division_id = updates.divisionId;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.headUserId !== undefined) body.head_user_id = updates.headUserId;
    if (updates.headUserName !== undefined) body.head_user_name = updates.headUserName;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch(`/api/data/zones/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  static async createState(data: Partial<State>): Promise<any> {
    const body: any = { state_name: data.name, zone_id: data.zoneId, is_active: data.isActive !== false ? 1 : 0 };
    if (data.code) body.state_code = data.code;
    if (data.divisionId) body.division_id = data.divisionId;
    if (data.displayOrder !== undefined) body.display_order = data.displayOrder;
    if (data.description !== undefined) body.description = data.description;
    return await ApiClient.fetch('/api/data/states', { method: 'POST', body: JSON.stringify(body) });
  }

  static async updateState(id: string, updates: Partial<State>): Promise<any> {
    const body: any = {};
    if (updates.code !== undefined) body.state_code = updates.code;
    if (updates.name !== undefined) body.state_name = updates.name;
    if (updates.zoneId !== undefined) body.zone_id = updates.zoneId;
    if (updates.divisionId !== undefined) body.division_id = updates.divisionId;
    if (updates.displayOrder !== undefined) body.display_order = updates.displayOrder;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch(`/api/data/states/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  static async createHq(data: Partial<Headquarter>): Promise<any> {
    const body: any = {
      hq_name: data.name,
      state_id: data.stateId,
      zone_id: data.zoneId || null,
      division_id: data.divisionId || null,
      hq_type: data.hqType || 'HQ',
      city: data.city || null,
      district: data.district || null,
      pin_code: data.pinCode || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_pool_hq: data.isPoolHq ? 1 : 0,
      parent_pool_hq_id: data.parentPoolHqId || null,
      is_super_hq: data.isSuperHq ? 1 : 0,
      display_order: data.displayOrder || 0,
      description: data.description || null,
      is_active: data.isActive !== false ? 1 : 0,
    };
    if (data.code) body.hq_code = data.code;
    return await ApiClient.fetch('/api/data/hqs', { method: 'POST', body: JSON.stringify(body) });
  }

  static async updateHq(id: string, updates: Partial<Headquarter>): Promise<any> {
    const body: any = {};
    if (updates.code !== undefined) body.hq_code = updates.code;
    if (updates.name !== undefined) body.hq_name = updates.name;
    if (updates.stateId !== undefined) body.state_id = updates.stateId;
    if (updates.zoneId !== undefined) body.zone_id = updates.zoneId;
    if (updates.divisionId !== undefined) body.division_id = updates.divisionId;
    if (updates.hqType !== undefined) body.hq_type = updates.hqType;
    if (updates.city !== undefined) body.city = updates.city;
    if (updates.district !== undefined) body.district = updates.district;
    if (updates.pinCode !== undefined) body.pin_code = updates.pinCode;
    if (updates.latitude !== undefined) body.latitude = updates.latitude;
    if (updates.longitude !== undefined) body.longitude = updates.longitude;
    if (updates.isPoolHq !== undefined) body.is_pool_hq = updates.isPoolHq ? 1 : 0;
    if (updates.parentPoolHqId !== undefined) body.parent_pool_hq_id = updates.parentPoolHqId;
    if (updates.isSuperHq !== undefined) body.is_super_hq = updates.isSuperHq ? 1 : 0;
    if (updates.displayOrder !== undefined) body.display_order = updates.displayOrder;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch(`/api/data/hqs/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  static async createArea(data: Partial<Area>): Promise<any> {
    const body: any = {
      area_name: data.name,
      hq_id: data.hqId,
      division_id: data.divisionId || null,
      territory_type: data.territoryType || 'LOCAL',
      travel_mode: data.travelMode || 'TWO_SIDE',
      both_side_allowed: data.bothSideAllowed !== false ? 1 : 0,
      display_order: data.displayOrder || 0,
      description: data.description || null,
      is_active: data.isActive !== false ? 1 : 0,
    };
    if (data.code) body.area_code = data.code;
    return await ApiClient.fetch('/api/data/areas', { method: 'POST', body: JSON.stringify(body) });
  }

  static async updateArea(id: string, updates: Partial<Area>): Promise<any> {
    const body: any = {};
    if (updates.code !== undefined) body.area_code = updates.code;
    if (updates.name !== undefined) body.area_name = updates.name;
    if (updates.hqId !== undefined) body.hq_id = updates.hqId;
    if (updates.divisionId !== undefined) body.division_id = updates.divisionId;
    if (updates.territoryType !== undefined) body.territory_type = updates.territoryType;
    if (updates.travelMode !== undefined) body.travel_mode = updates.travelMode;
    if (updates.bothSideAllowed !== undefined) body.both_side_allowed = updates.bothSideAllowed ? 1 : 0;
    if (updates.displayOrder !== undefined) body.display_order = updates.displayOrder;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch(`/api/data/areas/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  static async createBeat(data: Partial<Beat>): Promise<any> {
    const body: any = {
      beat_name: data.name,
      area_id: data.areaId,
      division_id: data.divisionId || null,
      beat_type: data.beatType || 'CORE',
      display_order: data.displayOrder || 0,
      description: data.description || null,
      is_active: data.isActive !== false ? 1 : 0,
    };
    if (data.code) body.beat_code = data.code;
    return await ApiClient.fetch('/api/data/beats', { method: 'POST', body: JSON.stringify(body) });
  }

  static async updateBeat(id: string, updates: Partial<Beat>): Promise<any> {
    const body: any = {};
    if (updates.code !== undefined) body.beat_code = updates.code;
    if (updates.name !== undefined) body.beat_name = updates.name;
    if (updates.areaId !== undefined) body.area_id = updates.areaId;
    if (updates.divisionId !== undefined) body.division_id = updates.divisionId;
    if (updates.beatType !== undefined) body.beat_type = updates.beatType;
    if (updates.displayOrder !== undefined) body.display_order = updates.displayOrder;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch(`/api/data/beats/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }
}
