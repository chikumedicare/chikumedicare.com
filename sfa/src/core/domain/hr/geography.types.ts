export interface Zone {
  id: string;
  code?: string;
  name: string;
  zone_name?: string;
  zoneName?: string;
  headUserId?: string;
  headUserName?: string;
  description?: string;
  isActive: boolean;
  divisionId?: string;
  stateId?: string;
  zoneId?: string;
  hqId?: string;
  areaId?: string;
  hqType?: string;
  city?: string;
  district?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  isPoolHq?: boolean;
  parentPoolHqId?: string;
  isSuperHq?: boolean;
  territoryType?: string;
  travelMode?: string;
  defaultTravelMode?: string;
  bothSideAllowed?: boolean;
  beatType?: string;
  displayOrder?: number;
}

export interface State {
  id: string;
  code?: string;
  name: string;
  state_name?: string;
  stateName?: string;
  zoneId?: string;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId?: string;
  stateId?: string;
  hqId?: string;
  areaId?: string;
  hqType?: string;
  city?: string;
  district?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  isPoolHq?: boolean;
  parentPoolHqId?: string;
  isSuperHq?: boolean;
  territoryType?: string;
  travelMode?: string;
  defaultTravelMode?: string;
  bothSideAllowed?: boolean;
  beatType?: string;
}

export interface Headquarter {
  id: string;
  code?: string;
  name: string;
  hq_name?: string;
  hqName?: string;
  stateId?: string;
  zoneId?: string;
  hqId?: string;
  areaId?: string;
  hqType?: string;
  city?: string;
  district?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  isPoolHq?: boolean;
  parentPoolHqId?: string;
  isSuperHq?: boolean;
  territoryType?: string;
  travelMode?: string;
  defaultTravelMode?: string;
  bothSideAllowed?: boolean;
  beatType?: string;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId?: string;
}

export interface Area {
  id: string;
  code?: string;
  name: string;
  area_name?: string;
  areaName?: string;
  area_code?: string;
  areaCode?: string;
  hqId?: string;
  zoneId?: string;
  stateId?: string;
  areaId?: string;
  hqType?: string;
  city?: string;
  district?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  isPoolHq?: boolean;
  parentPoolHqId?: string;
  isSuperHq?: boolean;
  territoryType?: string;
  travelMode?: string;
  defaultTravelMode?: string;
  bothSideAllowed?: boolean;
  beatType?: string;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId?: string;
}

export interface Beat {
  id: string;
  code?: string;
  name: string;
  beat_name?: string;
  beatName?: string;
  beat_code?: string;
  beatCode?: string;
  areaId?: string;
  hqId?: string;
  stateId?: string;
  zoneId?: string;
  hqType?: string;
  city?: string;
  district?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  isPoolHq?: boolean;
  parentPoolHqId?: string;
  isSuperHq?: boolean;
  beatType?: string;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId?: string;
  territoryType?: string;
  travelMode?: string;
  defaultTravelMode?: string;
  bothSideAllowed?: boolean;
}

export interface GeographyCoverage {
  userId: string;
  primaryHqId: string;
  coveringHqIds: string[];
  areaIds: string[];
}
