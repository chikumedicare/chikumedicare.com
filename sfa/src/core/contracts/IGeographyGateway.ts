import type { Zone, State, Headquarter, Area, Beat, GeographyCoverage } from '../domain/hr/geography.types';

export interface IGeographyGateway {
  getZones(): Promise<Zone[]>;
  getStates(): Promise<State[]>;
  getHqs(): Promise<Headquarter[]>;
  getHeadquarters?(): Promise<Headquarter[]>;
  getAreas(): Promise<Area[]>;
  getBeats(): Promise<Beat[]>;
  createZone(payload: Partial<Zone>): Promise<Zone>;
  updateZone(id: string, payload: Partial<Zone>): Promise<Zone>;
  createState(payload: Partial<State>): Promise<State>;
  updateState(id: string, payload: Partial<State>): Promise<State>;
  createHq(payload: Partial<Headquarter>): Promise<Headquarter>;
  updateHq(id: string, payload: Partial<Headquarter>): Promise<Headquarter>;
  createArea(payload: Partial<Area>): Promise<Area>;
  updateArea(id: string, payload: Partial<Area>): Promise<Area>;
  createBeat(payload: Partial<Beat>): Promise<Beat>;
  updateBeat(id: string, payload: Partial<Beat>): Promise<Beat>;
  saveTerritory?(type: string, data: any): Promise<any>;
  deleteTerritory?(type: string, id: string): Promise<void>;
  getUserGeography?(userId: string): Promise<GeographyCoverage | null>;
  saveUserGeography?(coverage: GeographyCoverage): Promise<void>;
}
