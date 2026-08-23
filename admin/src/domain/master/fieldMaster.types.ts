export interface Doctor {
  id: string;
  doctorCode?: string;
  doctorName: string;
  qualification?: string;
  speciality?: string;
  doctorClass?: 'A' | 'B' | 'C' | 'VIP';
  hqId: string;
  hqName?: string;
  areaId: string;
  areaName?: string;
  beatId?: string;
  beatName?: string;
  clinicAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  mobile?: string;
  email?: string;
  visitFrequency?: number;
  preferredTime?: string;
  isApproved?: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface Chemist {
  id: string;
  chemistCode?: string;
  chemistName: string;
  contactPerson?: string;
  chemistClass?: 'A' | 'B' | 'C';
  hqId: string;
  hqName?: string;
  areaId: string;
  areaName?: string;
  beatId?: string;
  beatName?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  mobile?: string;
  email?: string;
  drugLicenseNumber?: string;
  gstin?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Stockist {
  id: string;
  stockistCode?: string;
  stockistName: string;
  contactPerson?: string;
  hqId: string;
  hqName?: string;
  areaId?: string;
  areaName?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  mobile?: string;
  email?: string;
  dl20b?: string;
  dl21b?: string;
  gstin?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  productCode?: string;
  productName: string;
  category?: 'TABLET' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'OINTMENT' | 'GEL' | 'SACHET' | 'CAPSULE' | 'OTHER';
  packSize?: string;
  composition?: string;
  mrp: number;
  pts: number;
  ptr: number;
  gstPercent?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Holiday {
  id: string;
  holidayName: string;
  date: string;
  stateId?: string;
  stateName?: string;
  hqId?: string;
  hqName?: string;
  type?: 'NATIONAL' | 'STATE' | 'RESTRICTED';
  isActive: boolean;
  createdAt?: string;
}
