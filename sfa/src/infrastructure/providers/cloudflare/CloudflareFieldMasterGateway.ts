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
    return await this.getCollection<Doctor>('doctors');
  }
  async saveDoctor(doc: Partial<Doctor>): Promise<Doctor> {
    if (doc.id) return await this.updateItem<Doctor>('doctors', doc.id, doc);
    return await this.createItem<Doctor>('doctors', doc);
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
