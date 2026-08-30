import { IHeadOfficeGateway, Division, HeadOfficeProfile } from '../../../core/contracts/IHeadOfficeGateway';
import { ApiClient } from '../../api/ApiClient';

export class CloudflareHeadOfficeGateway implements IHeadOfficeGateway {
  async getDivisions(): Promise<Division[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/divisions?limit=100', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id || ''),
      name: String(r.name || r.division_name || ''),
      code: String(r.code || r.division_code || r.div_code || ''),
      headOfficeId: String(r.head_office_id || r.headOfficeId || ''),
      headUserId: String(r.head_user_id || r.headUserId || ''),
      headUserName: String(r.head_user_name || r.headUserName || ''),
      displayOrder: Number(r.display_order || r.displayOrder || 0),
      isActive: r.is_active === 1 || r.is_active === true || r.isActive === true,
      description: String(r.description || ''),
    }));
  }

  async saveDivision(div: Partial<Division>): Promise<Division> {
    const payload = {
      name: div.name,
      division_code: div.code,
      head_office_id: div.headOfficeId || undefined,
      head_user_id: div.headUserId || undefined,
      head_user_name: div.headUserName || undefined,
      display_order: div.displayOrder || 0,
      is_active: div.isActive !== false ? 1 : 0,
      description: div.description || '',
    };
    let res: any;
    if (div.id) {
      res = await ApiClient.fetch<any>('/api/data/divisions/' + div.id, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await ApiClient.fetch<any>('/api/data/divisions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    return {
      id: String(res?.id || ''),
      name: String(res?.name || res?.division_name || ''),
      code: String(res?.code || res?.division_code || res?.div_code || ''),
      headOfficeId: String(res?.head_office_id || res?.headOfficeId || ''),
      headUserId: String(res?.head_user_id || res?.headUserId || ''),
      headUserName: String(res?.head_user_name || res?.headUserName || ''),
      displayOrder: Number(res?.display_order || res?.displayOrder || 0),
      isActive: res?.is_active === 1 || res?.is_active === true,
      description: String(res?.description || ''),
    };
  }

  async deleteDivision(id: string): Promise<void> {
    await ApiClient.fetch('/api/data/divisions/' + id, { method: 'DELETE' });
  }

  async getHeadOfficeProfile(): Promise<HeadOfficeProfile> {
    const rows = await ApiClient.fetch<any[]>('/api/data/head_office?limit=1', { method: 'GET' });
    const r = rows && rows[0] ? rows[0] : {};
    return {
      id: String(r.id || ''),
      companyName: String(r.company_name || r.companyName || 'CHIKU MEDICARE PRIVATE LIMITED'),
      brandName: String(r.brand_name || r.brandName || 'CHIKU MEDICARE'),
      cinNumber: String(r.cin_number || r.cinNumber || ''),
      panNumber: String(r.pan_number || r.panNumber || ''),
      gstin: String(r.gstin || ''),
      drugLicenseNo20b: String(r.drug_license_no_20b || r.drugLicenseNo20b || ''),
      drugLicenseNo21b: String(r.drug_license_no_21b || r.drugLicenseNo21b || ''),
      fssaiLicenseNo: String(r.fssai_license_no || r.fssaiLicenseNo || ''),
      addressLine1: String(r.address_line1 || r.addressLine1 || ''),
      addressLine2: String(r.address_line2 || r.addressLine2 || ''),
      city: String(r.city || ''),
      stateName: String(r.state_name || r.stateName || ''),
      pinCode: String(r.pin_code || r.pinCode || ''),
      phone: String(r.phone || ''),
      email: String(r.email || ''),
      website: String(r.website || ''),
      helplineNumber: String(r.helpline_number || r.helplineNumber || ''),
      activeFinancialYear: String(r.active_financial_year || r.activeFinancialYear || '2026-27'),
      workingDaysPerMonth: Number(r.working_days_per_month || r.workingDaysPerMonth || 26),
    };
  }

  async updateHeadOfficeProfile(profile: Partial<HeadOfficeProfile>): Promise<HeadOfficeProfile> {
    const existing = await ApiClient.fetch<any[]>('/api/data/head_office?limit=1', { method: 'GET' });
    const existingId = existing && existing[0]?.id ? existing[0].id : 'hea_1786990376047_xxozx9';

    const payload: any = {
      company_name: profile.companyName,
      brand_name: profile.brandName,
      cin_number: profile.cinNumber,
      pan_number: profile.panNumber,
      gstin: profile.gstin,
      drug_license_no_20b: profile.drugLicenseNo20b,
      drug_license_no_21b: profile.drugLicenseNo21b,
      fssai_license_no: profile.fssaiLicenseNo,
      address_line1: profile.addressLine1,
      address_line2: profile.addressLine2,
      city: profile.city,
      state_name: profile.stateName,
      pin_code: profile.pinCode,
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      helpline_number: profile.helplineNumber,
      active_financial_year: profile.activeFinancialYear || '2026-27',
      working_days_per_month: profile.workingDaysPerMonth || 26,
      updated_at: new Date().toISOString(),
    };

    if (existingId) {
      await ApiClient.fetch<any>('/api/data/head_office/' + existingId, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      await ApiClient.fetch<any>('/api/data/head_office', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    return await this.getHeadOfficeProfile();
  }
}
