export interface Zone {
  id: string;
  code: string;
  name: string;
  headUserId?: string;
  headUserName?: string;
  description?: string;
  isActive: boolean;
  divisionId: string;
}

export interface State {
  id: string;
  code: string;
  name: string;
  zoneId: string;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId: string;
}

export interface Headquarter {
  id: string;
  code: string;
  name: string;
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
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId: string;
}

export interface Area {
  id: string;
  code: string;
  name: string;
  hqId: string;
  zoneId?: string;
  stateId?: string;
  territoryType?: string;
  travelMode?: string;
  defaultTravelMode?: string;
  bothSideAllowed?: boolean;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId: string;
}

export interface Beat {
  id: string;
  code: string;
  name: string;
  areaId: string;
  hqId?: string;
  stateId?: string;
  zoneId?: string;
  beatType?: string;
  displayOrder?: number;
  description?: string;
  isActive: boolean;
  divisionId: string;
}

export interface GeographyCoverage {
  userId: string;
  primaryHqId: string;
  coveringHqIds: string[];
  areaIds: string[];
}
