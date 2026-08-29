export interface HeadOfficeProfile {
  id?: string;
  companyName: string;
  brandName?: string;
  cinNumber?: string;
  panNumber?: string;
  gstin?: string;
  drugLicenseNo20b?: string;
  drugLicenseNo21b?: string;
  fssaiLicenseNo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateName?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  helplineNumber?: string;
  activeFinancialYear?: string;
  workingDaysPerMonth?: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Division {
  id: string;
  code: string;
  name: string;
  headUserId?: string;
  headUserName?: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
