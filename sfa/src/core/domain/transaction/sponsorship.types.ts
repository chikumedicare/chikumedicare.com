export type SponsorshipType =
  | 'Financial Support'
  | 'Product Scheme'
  | 'Educational Support'
  | 'Travel Support'
  | 'Accommodation Support'
  | 'Registration Support'
  | 'Others';

export interface ProductSchemeDetail {
  productId: string;
  productName: string;
  schemeType: 'Free Goods' | 'Net Rate';
  schemeValue: string;
  remark?: string;
}

export interface SponsorshipRecord {
  id: string;
  hqId?: string;
  hqName?: string;
  employeeId?: string;
  employeeName?: string;
  doctorId: string;
  doctorName: string;
  doctorDegree?: string;
  doctorSpecialty?: string;
  doctorRegNo?: string;
  chemistIds?: string[];
  chemistNames?: string[];
  sponsorshipDate: string; // YYYY-MM-DD
  monthYear: string; // YYYY-MM
  financialYear: string; // e.g. 2026-27
  sponsorshipType: SponsorshipType;
  amount: number; // ₹ Support Value
  
  // Specific Type Payloads
  programName?: string; // Educational / Registration
  institutionOrOrganizer?: string;
  locationCity?: string;
  travelType?: 'Flight' | 'Train' | 'Bus' | 'Taxi' | 'Other';
  fromLocation?: string;
  toLocation?: string;
  hotelName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  productSchemes?: ProductSchemeDetail[];
  
  referenceIdType?: string;
  referenceIdNumber?: string;
  remark: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  approvedBy?: string;
}
