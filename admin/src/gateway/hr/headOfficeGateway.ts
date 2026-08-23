import { ApiClient } from '../../api/ApiClient';
import type { HeadOfficeProfile, Division } from '../../domain/hr/headOffice.types';

export function mapHeadOfficeFromDb(row: any): HeadOfficeProfile {
  if (!row) {
    return {
      id: 'ho_primary',
      companyName: 'Chiku Medicare Pvt. Ltd.',
      brandName: 'Chiku Healthcare',
      activeFinancialYear: '2026-27',
      workingDaysPerMonth: 26,
    };
  }
  return {
    id: String(row.id || 'ho_primary'),
    companyName: row.company_name || '',
    brandName: row.brand_name || '',
    cinNumber: row.cin_number || '',
    panNumber: row.pan_number || '',
    gstin: row.gstin || '',
    drugLicenseNo20b: row.drug_license_no_20b || '',
    drugLicenseNo21b: row.drug_license_no_21b || '',
    fssaiLicenseNo: row.fssai_license_no || '',
    addressLine1: row.address_line1 || '',
    addressLine2: row.address_line2 || '',
    city: row.city || '',
    stateName: row.state_name || '',
    pinCode: row.pin_code || '',
    phone: row.phone || '',
    email: row.email || '',
    website: row.website || '',
    helplineNumber: row.helpline_number || '',
    activeFinancialYear: row.active_financial_year || '2026-27',
    workingDaysPerMonth: row.working_days_per_month != null ? Number(row.working_days_per_month) : 26,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export function mapDivisionFromDb(row: any): Division {
  return {
    id: String(row.id),
    code: row.div_code || '',
    name: row.name || '',
    headUserId: row.head_user_id || undefined,
    headUserName: row.head_user_name || undefined,
    description: row.description || '',
    displayOrder: row.display_order != null ? Number(row.display_order) : 0,
    isActive: row.is_active === 1 || row.is_active === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class HeadOfficeGateway {
  static async getProfile(): Promise<HeadOfficeProfile> {
    const rows = await ApiClient.fetch<any[]>('/api/data/head_office', { method: 'GET' });
    const primary = (rows && rows.length > 0) ? rows[0] : null;
    return mapHeadOfficeFromDb(primary);
  }

  static async saveProfile(profile: Partial<HeadOfficeProfile>): Promise<any> {
    const body: any = {
      company_name: profile.companyName,
      brand_name: profile.brandName || null,
      cin_number: profile.cinNumber || null,
      pan_number: profile.panNumber || null,
      gstin: profile.gstin || null,
      drug_license_no_20b: profile.drugLicenseNo20b || null,
      drug_license_no_21b: profile.drugLicenseNo21b || null,
      fssai_license_no: profile.fssaiLicenseNo || null,
      address_line1: profile.addressLine1 || null,
      address_line2: profile.addressLine2 || null,
      city: profile.city || null,
      state_name: profile.stateName || null,
      pin_code: profile.pinCode || null,
      phone: profile.phone || null,
      email: profile.email || null,
      website: profile.website || null,
      helpline_number: profile.helplineNumber || null,
      active_financial_year: profile.activeFinancialYear || '2026-27',
      working_days_per_month: profile.workingDaysPerMonth || 26,
    };

    const existing = await ApiClient.fetch<any[]>('/api/data/head_office', { method: 'GET' });
    if (existing && existing.length > 0) {
      const id = existing[0].id || 'ho_primary';
      return await ApiClient.fetch(`/api/data/head_office/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      body.id = 'ho_primary';
      return await ApiClient.fetch('/api/data/head_office', { method: 'POST', body: JSON.stringify(body) });
    }
  }

  static async getDivisions(): Promise<Division[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/divisions?includeInactive=true', { method: 'GET' });
    return (rows || []).map(mapDivisionFromDb);
  }

  static async createDivision(data: Partial<Division>): Promise<any> {
    const body: any = {
      name: data.name,
      head_user_id: data.headUserId || null,
      head_user_name: data.headUserName || null,
      description: data.description || null,
      display_order: data.displayOrder || 0,
      is_active: data.isActive !== false ? 1 : 0,
    };
    if (data.code) body.div_code = data.code;
    return await ApiClient.fetch('/api/data/divisions', { method: 'POST', body: JSON.stringify(body) });
  }

  static async updateDivision(id: string, updates: Partial<Division>): Promise<any> {
    const body: any = {};
    if (updates.code !== undefined) body.div_code = updates.code;
    if (updates.name !== undefined) body.name = updates.name;
    if (updates.headUserId !== undefined) body.head_user_id = updates.headUserId;
    if (updates.headUserName !== undefined) body.head_user_name = updates.headUserName;
    if (updates.description !== undefined) body.description = updates.description;
    if (updates.displayOrder !== undefined) body.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) body.is_active = updates.isActive ? 1 : 0;
    return await ApiClient.fetch(`/api/data/divisions/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }
}
