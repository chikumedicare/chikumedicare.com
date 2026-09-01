import { IFieldMasterGateway, MasterEntity } from '../../../core/contracts/IFieldMasterGateway';
import type { Doctor, Chemist, Stockist, Product, Holiday } from '../../../core/domain/master/fieldMaster.types';
import { ApiClient } from '../../api/ApiClient';

export class CloudflareFieldMasterGateway implements IFieldMasterGateway {
  async getCollection<T = MasterEntity>(collectionName: string): Promise<T[]> {
    return await ApiClient.fetch<T[]>('/api/data/' + collectionName + '?limit=500', { method: 'GET' });
  }

  async createItem<T = MasterEntity>(collectionName: string, item: Partial<T>): Promise<T> {
    return await ApiClient.fetch<T>('/api/data/' + collectionName, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem<T = MasterEntity>(collectionName: string, id: string, item: Partial<T>): Promise<T> {
    return await ApiClient.fetch<T>('/api/data/' + collectionName + '/' + id, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteItem(collectionName: string, id: string): Promise<void> {
    await ApiClient.fetch('/api/data/' + collectionName + '/' + id, { method: 'DELETE' });
  }

  async getDoctors(): Promise<Doctor[]> {
    const rows = await ApiClient.fetch<Record<string, any>[]>('/api/data/doctors?limit=500', { method: 'GET' });
    return (rows || []).map((r) => ({
      id: String(r.id),
      doctorCode: r.dr_code || r.doctorCode || '',
      doctorName: r.name || r.doctorName || '',
      qualification: r.qualification || '',
      speciality: r.speciality || 'General',
      doctorClass: (r.category || r.doctorClass || 'B') as 'A' | 'B' | 'C' | 'VIP',
      hqId: r.hq_id || r.hqId || '',
      areaId: r.area_id || r.areaId || '',
      beatId: r.beat_id || r.beatId || '',
      mobile: r.mobile || '',
      email: r.email || '',
      clinicAddress: r.clinic_address || r.clinicAddress || '',
      dob: r.dob || '',
      anniversaryDate: r.anniversary_date || r.anniversaryDate || '',
      visitFrequency: Number(r.visit_frequency || r.visitFrequency || 1),
      isActive: r.is_active === 1 || r.is_active === true || r.isActive === true,
      createdAt: r.created_at || r.createdAt || '',
    }));
  }

  async saveDoctor(doc: Partial<Doctor>): Promise<Doctor> {
    const payload: Record<string, unknown> = {
      name: doc.doctorName || (doc as any).name || '',
      dr_code: doc.doctorCode || (doc as any).dr_code || undefined,
      qualification: doc.qualification || '',
      speciality: doc.speciality || 'General',
      category: doc.doctorClass || (doc as any).category || 'B',
      hq_id: doc.hqId || (doc as any).hq_id || '',
      area_id: doc.areaId || (doc as any).area_id || '',
      beat_id: doc.beatId || (doc as any).beat_id || null,
      mobile: doc.mobile || '',
      email: doc.email || null,
      clinic_address: doc.clinicAddress || (doc as any).clinic_address || '',
      dob: doc.dob || null,
      anniversary_date: doc.anniversaryDate || (doc as any).anniversary_date || null,
      visit_frequency: Number(doc.visitFrequency || 1),
      is_active: doc.isActive !== false ? 1 : 0,
    };

    let res: any;
    if (doc.id) {
      res = await this.updateItem<any>('doctors', doc.id, payload);
    } else {
      res = await this.createItem<any>('doctors', payload);
    }

    return {
      id: String(res?.id || doc.id || ''),
      doctorCode: res?.dr_code || doc.doctorCode || '',
      doctorName: res?.name || doc.doctorName || '',
      qualification: res?.qualification || doc.qualification || '',
      speciality: res?.speciality || doc.speciality || 'General',
      doctorClass: (res?.category || doc.doctorClass || 'B') as 'A' | 'B' | 'C' | 'VIP',
      hqId: res?.hq_id || doc.hqId || '',
      areaId: res?.area_id || doc.areaId || '',
      beatId: res?.beat_id || doc.beatId || '',
      mobile: res?.mobile || doc.mobile || '',
      email: res?.email || doc.email || '',
      clinicAddress: res?.clinic_address || doc.clinicAddress || '',
      dob: res?.dob || doc.dob || '',
      anniversaryDate: res?.anniversary_date || doc.anniversaryDate || '',
      visitFrequency: Number(res?.visit_frequency || doc.visitFrequency || 1),
      isActive: res?.is_active === 1 || doc.isActive !== false,
      createdAt: res?.created_at || res?.createdAt || new Date().toISOString(),
    };
  }

  async deleteDoctor(id: string): Promise<void> {
    await this.deleteItem('doctors', id);
  }

  async getChemists(): Promise<Chemist[]> {
    return await this.getCollection<Chemist>('chemists');
  }
  async saveChemist(chemist: Partial<Chemist>): Promise<Chemist> {
    if (chemist.id) return await this.updateItem<Chemist>('chemists', chemist.id, chemist);
    return await this.createItem<Chemist>('chemists', chemist);
  }
  async deleteChemist(id: string): Promise<void> {
    await this.deleteItem('chemists', id);
  }

  async getStockists(): Promise<Stockist[]> {
    return await this.getCollection<Stockist>('stockists');
  }
  async saveStockist(stockist: Partial<Stockist>): Promise<Stockist> {
    if (stockist.id) return await this.updateItem<Stockist>('stockists', stockist.id, stockist);
    return await this.createItem<Stockist>('stockists', stockist);
  }
  async deleteStockist(id: string): Promise<void> {
    await this.deleteItem('stockists', id);
  }

  async getProducts(): Promise<Product[]> {
    return await this.getCollection<Product>('products');
  }
  async saveProduct(prod: Partial<Product>): Promise<Product> {
    if (prod.id) return await this.updateItem<Product>('products', prod.id, prod);
    return await this.createItem<Product>('products', prod);
  }
  async deleteProduct(id: string): Promise<void> {
    await this.deleteItem('products', id);
  }

  async getHolidays(): Promise<Holiday[]> {
    return await this.getCollection<Holiday>('holidays');
  }
  async saveHoliday(holiday: Partial<Holiday>): Promise<Holiday> {
    if (holiday.id) return await this.updateItem<Holiday>('holidays', holiday.id, holiday);
    return await this.createItem<Holiday>('holidays', holiday);
  }
  async deleteHoliday(id: string): Promise<void> {
    await this.deleteItem('holidays', id);
  }
}
