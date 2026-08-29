export interface SfcRate {
  id: string;
  fromNodeType?: 'SUPER_HQ' | 'HQ' | 'AREA';
  fromNodeId: string;
  fromNodeName?: string;
  toNodeType?: 'HQ' | 'AREA';
  toNodeId: string;
  toNodeName?: string;
  fromHqId?: string;
  fromHqName?: string;
  toAreaId?: string;
  toAreaName?: string;
  travelType: 'LOCAL_HQ' | 'EX_HQ' | 'OUTSTATION';
  distanceKm: number;
  roundTripKm: number;
  ratePerKm: number;
  approvedFare: number;
  effectiveFrom?: string;
  isActive: boolean;
  createdAt?: string;
}
