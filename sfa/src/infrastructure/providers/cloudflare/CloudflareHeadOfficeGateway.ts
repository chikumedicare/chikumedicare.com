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
      code: div.code,
      division_code: div.code,
      div_code: div.code,
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
    const rows = await ApiClient.fetch<any[]>('/api/data/head_office_profile?limit=1', { method: 'GET' });
    const r = rows && rows[0] ? rows[0] : {};
    return {
      companyName: String(r.company_name || r.companyName || 'Chiku Medicare Pvt. Ltd.'),
      brandName: String(r.brand_name || r.brandName || ''),
      addressLine1: String(r.address_line1 || r.addressLine1 || r.address || ''),
      city: String(r.city || ''),
      stateName: String(r.state_name || r.stateName || ''),
      pinCode: String(r.pin_code || r.pinCode || ''),
      phone: String(r.phone || ''),
      email: String(r.email || ''),
      website: String(r.website || ''),
      workingDaysPerMonth: Number(r.working_days_per_month || r.workingDaysPerMonth || 26),
    };
  }

  async updateHeadOfficeProfile(profile: Partial<HeadOfficeProfile>): Promise<HeadOfficeProfile> {
    const payload = {
      company_name: profile.companyName,
      brand_name: profile.brandName,
      address_line1: profile.addressLine1,
      city: profile.city,
      state_name: profile.stateName,
      pin_code: profile.pinCode,
      email: profile.email,
      phone: profile.phone,
      website: profile.website,
      working_days_per_month: profile.workingDaysPerMonth,
      updated_at: new Date().toISOString(),
    };
    const res = await ApiClient.fetch<any>('/api/data/head_office_profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      companyName: String(res?.company_name || profile.companyName || ''),
      brandName: String(res?.brand_name || profile.brandName || ''),
      addressLine1: String(res?.address_line1 || profile.addressLine1 || ''),
      city: String(res?.city || profile.city || ''),
      stateName: String(res?.state_name || profile.stateName || ''),
      pinCode: String(res?.pin_code || profile.pinCode || ''),
      email: String(res?.email || profile.email || ''),
      phone: String(res?.phone || profile.phone || ''),
      website: String(res?.website || profile.website || ''),
      workingDaysPerMonth: Number(res?.working_days_per_month || profile.workingDaysPerMonth || 26),
    };
  }
}
