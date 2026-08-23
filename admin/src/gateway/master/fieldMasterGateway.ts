import { ApiClient } from '../../api/ApiClient';
import type { Doctor, Chemist, Stockist, Product, Holiday } from '../../domain/master/fieldMaster.types';

export class FieldMasterGateway {
  // DOCTOR GATEWAY
  static async getDoctors(): Promise<Doctor[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/doctors?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      doctorCode: r.doctor_code || r.code || '',
      doctorName: r.doctor_name || r.name || '',
      qualification: r.qualification || '',
      speciality: r.speciality || '',
      doctorClass: r.doctor_class || r.class || 'A',
      hqId: r.hq_id || '',
      hqName: r.hq_name || '',
      areaId: r.area_id || '',
      areaName: r.area_name || '',
      beatId: r.beat_id || '',
      beatName: r.beat_name || '',
      clinicAddress: r.clinic_address || r.address || '',
      city: r.city || '',
      state: r.state || '',
      pinCode: r.pin_code || '',
      mobile: r.mobile || r.phone || '',
      email: r.email || '',
      visitFrequency: Number(r.visit_frequency || 2),
      preferredTime: r.preferred_time || '',
      isApproved: r.is_approved === 1 || r.is_approved === true,
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at || '',
    }));
  }

  static async saveDoctor(draft: Partial<Doctor>): Promise<any> {
    const payload: Record<string, any> = {
      doctor_code: draft.doctorCode || '',
      doctor_name: draft.doctorName || '',
      qualification: draft.qualification || '',
      speciality: draft.speciality || '',
      doctor_class: draft.doctorClass || 'A',
      hq_id: draft.hqId || '',
      hq_name: draft.hqName || '',
      area_id: draft.areaId || '',
      area_name: draft.areaName || '',
      beat_id: draft.beatId || '',
      beat_name: draft.beatName || '',
      clinic_address: draft.clinicAddress || '',
      city: draft.city || '',
      state: draft.state || '',
      pin_code: draft.pinCode || '',
      mobile: draft.mobile || '',
      email: draft.email || '',
      visit_frequency: Number(draft.visitFrequency || 2),
      preferred_time: draft.preferredTime || '',
      is_approved: draft.isApproved === false ? 0 : 1,
      is_active: draft.isActive === false ? 0 : 1,
    };

    if (draft.id && !draft.id.startsWith('temp_')) {
      return await ApiClient.fetch(`/api/data/doctors/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      return await ApiClient.fetch('/api/data/doctors', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  static async deleteDoctor(id: string): Promise<any> {
    return await ApiClient.fetch(`/api/data/doctors/${id}`, { method: 'DELETE' });
  }

  // CHEMIST GATEWAY
  static async getChemists(): Promise<Chemist[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/chemists?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      chemistCode: r.chemist_code || r.code || '',
      chemistName: r.chemist_name || r.name || '',
      contactPerson: r.contact_person || '',
      chemistClass: r.chemist_class || r.class || 'A',
      hqId: r.hq_id || '',
      hqName: r.hq_name || '',
      areaId: r.area_id || '',
      areaName: r.area_name || '',
      beatId: r.beat_id || '',
      beatName: r.beat_name || '',
      address: r.address || '',
      city: r.city || '',
      state: r.state || '',
      pinCode: r.pin_code || '',
      mobile: r.mobile || r.phone || '',
      email: r.email || '',
      drugLicenseNumber: r.drug_license_number || r.dl_number || '',
      gstin: r.gstin || '',
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at || '',
    }));
  }

  static async saveChemist(draft: Partial<Chemist>): Promise<any> {
    const payload: Record<string, any> = {
      chemist_code: draft.chemistCode || '',
      chemist_name: draft.chemistName || '',
      contact_person: draft.contactPerson || '',
      chemist_class: draft.chemistClass || 'A',
      hq_id: draft.hqId || '',
      hq_name: draft.hqName || '',
      area_id: draft.areaId || '',
      area_name: draft.areaName || '',
      beat_id: draft.beatId || '',
      beat_name: draft.beatName || '',
      address: draft.address || '',
      city: draft.city || '',
      state: draft.state || '',
      pin_code: draft.pinCode || '',
      mobile: draft.mobile || '',
      email: draft.email || '',
      drug_license_number: draft.drugLicenseNumber || '',
      gstin: draft.gstin || '',
      is_active: draft.isActive === false ? 0 : 1,
    };

    if (draft.id && !draft.id.startsWith('temp_')) {
      return await ApiClient.fetch(`/api/data/chemists/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      return await ApiClient.fetch('/api/data/chemists', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  static async deleteChemist(id: string): Promise<any> {
    return await ApiClient.fetch(`/api/data/chemists/${id}`, { method: 'DELETE' });
  }

  // STOCKIST GATEWAY
  static async getStockists(): Promise<Stockist[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/stockists?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      stockistCode: r.stockist_code || r.code || '',
      stockistName: r.stockist_name || r.name || '',
      contactPerson: r.contact_person || '',
      hqId: r.hq_id || '',
      hqName: r.hq_name || '',
      areaId: r.area_id || '',
      areaName: r.area_name || '',
      address: r.address || '',
      city: r.city || '',
      state: r.state || '',
      pinCode: r.pin_code || '',
      mobile: r.mobile || r.phone || '',
      email: r.email || '',
      dl20b: r.dl20b || r.dl_20b || '',
      dl21b: r.dl21b || r.dl_21b || '',
      gstin: r.gstin || '',
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at || '',
    }));
  }

  static async saveStockist(draft: Partial<Stockist>): Promise<any> {
    const payload: Record<string, any> = {
      stockist_code: draft.stockistCode || '',
      stockist_name: draft.stockistName || '',
      contact_person: draft.contactPerson || '',
      hq_id: draft.hqId || '',
      hq_name: draft.hqName || '',
      area_id: draft.areaId || '',
      area_name: draft.areaName || '',
      address: draft.address || '',
      city: draft.city || '',
      state: draft.state || '',
      pin_code: draft.pinCode || '',
      mobile: draft.mobile || '',
      email: draft.email || '',
      dl20b: draft.dl20b || '',
      dl21b: draft.dl21b || '',
      gstin: draft.gstin || '',
      is_active: draft.isActive === false ? 0 : 1,
    };

    if (draft.id && !draft.id.startsWith('temp_')) {
      return await ApiClient.fetch(`/api/data/stockists/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      return await ApiClient.fetch('/api/data/stockists', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  static async deleteStockist(id: string): Promise<any> {
    return await ApiClient.fetch(`/api/data/stockists/${id}`, { method: 'DELETE' });
  }

  // PRODUCT GATEWAY
  static async getProducts(): Promise<Product[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/products?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      productCode: r.product_code || r.code || '',
      productName: r.product_name || r.name || '',
      category: r.category || 'TABLET',
      packSize: r.pack_size || '',
      composition: r.composition || '',
      mrp: Number(r.mrp || 0),
      pts: Number(r.pts || 0),
      ptr: Number(r.ptr || 0),
      gstPercent: Number(r.gst_percent || 12),
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at || '',
    }));
  }

  static async saveProduct(draft: Partial<Product>): Promise<any> {
    const payload: Record<string, any> = {
      product_code: draft.productCode || '',
      product_name: draft.productName || '',
      category: draft.category || 'TABLET',
      pack_size: draft.packSize || '',
      composition: draft.composition || '',
      mrp: Number(draft.mrp || 0),
      pts: Number(draft.pts || 0),
      ptr: Number(draft.ptr || 0),
      gst_percent: Number(draft.gstPercent || 12),
      is_active: draft.isActive === false ? 0 : 1,
    };

    if (draft.id && !draft.id.startsWith('temp_')) {
      return await ApiClient.fetch(`/api/data/products/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      return await ApiClient.fetch('/api/data/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  static async deleteProduct(id: string): Promise<any> {
    return await ApiClient.fetch(`/api/data/products/${id}`, { method: 'DELETE' });
  }

  // HOLIDAY GATEWAY
  static async getHolidays(): Promise<Holiday[]> {
    const rows = await ApiClient.fetch<any[]>('/api/data/holidays?includeInactive=true', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      holidayName: r.holiday_name || r.name || '',
      date: r.date || '',
      stateId: r.state_id || '',
      stateName: r.state_name || '',
      hqId: r.hq_id || '',
      hqName: r.hq_name || '',
      type: r.type || 'NATIONAL',
      isActive: r.is_active === 1 || r.is_active === true,
      createdAt: r.created_at || '',
    }));
  }

  static async saveHoliday(draft: Partial<Holiday>): Promise<any> {
    const payload: Record<string, any> = {
      holiday_name: draft.holidayName || '',
      date: draft.date || '',
      state_id: draft.stateId || '',
      state_name: draft.stateName || '',
      hq_id: draft.hqId || '',
      hq_name: draft.hqName || '',
      type: draft.type || 'NATIONAL',
      is_active: draft.isActive === false ? 0 : 1,
    };

    if (draft.id && !draft.id.startsWith('temp_')) {
      return await ApiClient.fetch(`/api/data/holidays/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      return await ApiClient.fetch('/api/data/holidays', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
  }

  static async deleteHoliday(id: string): Promise<any> {
    return await ApiClient.fetch(`/api/data/holidays/${id}`, { method: 'DELETE' });
  }
}
