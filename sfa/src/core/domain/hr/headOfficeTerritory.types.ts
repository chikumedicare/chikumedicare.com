export interface HeadOfficeRecord {
  id: string;
  code: string;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  pincode?: string;
  contact_person?: string;
  contact_phone?: string;
  is_active: boolean | number;
  created_at?: string;
  updated_at?: string;
}
