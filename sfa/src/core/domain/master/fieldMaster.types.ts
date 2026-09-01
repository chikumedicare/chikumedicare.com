export interface Doctor {
  id: string;
  doctorCode?: string;
  registrationNo?: string;
  doctorName: string;
  gender?: 'Male' | 'Female' | 'Other';
  qualification?: string;
  otherQualification?: string;
  speciality?: string;
  otherSpeciality?: string;
  doctorClass?: 'A' | 'B' | 'C' | 'VIP';
  hqId: string;
  hqName?: string;
  areaId: string;
  areaName?: string;
  beatId?: string;
  beatName?: string;
  
  // Clinic / Hospital Address
  clinicAddressLine1?: string;
  clinicAddressLine2?: string;
  clinicCity?: string;
  clinicPin?: string;
  clinicState?: string;
  clinicAddress?: string;

  // Permanent Address
  permAddressLine1?: string;
  permAddressLine2?: string;
  permCity?: string;
  permPin?: string;
  permState?: string;
  permAddress?: string;

  // Compatibility fields
  city?: string;
  pinCode?: string;
  state?: string;

  dob?: string;
  anniversaryDate?: string;
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
  
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pinCode?: string;
  state?: string;
  address?: string;

  drugLicenseNumber?: string;
  gstin?: string;
  mobile?: string;
  email?: string;
  visitFrequency?: number;
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
  
  // Address fields
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  pinCode?: string;
  state?: string;
  address?: string;

  dl20b?: string;
  dl21b?: string;
  gstin?: string;
  panNumber?: string;
  mobile?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  productCode?: string;
  productName: string;
  category?: 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'OINTMENT' | 'GEL' | 'SACHET' | 'LOTION' | 'DROPS' | 'SERUM' | 'FACEWASH' | 'SOAP' | 'SUNSCREEN' | 'SHAMPOO' | 'OTHER';
  packSize?: string;
  composition?: string;
  hsnCode?: string;
  mrp: number;
  ptr: number;
  pts: number;
  nrv?: number;
  gstPercent?: number;
  divisionId?: string;
  divisionName?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Holiday {
  id: string;
  holidayName: string;
  date: string;
  financialYear?: string;
  stateId?: string;
  stateName?: string;
  hqId?: string;
  hqName?: string;
  type?: 'NATIONAL' | 'STATE' | 'RESTRICTED';
  isActive: boolean;
  createdAt?: string;
}
