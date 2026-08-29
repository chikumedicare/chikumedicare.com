import type { Doctor, Chemist, Stockist, Product, Holiday } from '../domain/master/fieldMaster.types';

export type MasterEntity = Doctor | Chemist | Stockist | Product | Holiday;

export interface IFieldMasterGateway {
  getCollection<T = MasterEntity>(collectionName: string): Promise<T[]>;
  createItem<T = MasterEntity>(collectionName: string, item: Partial<T>): Promise<T>;
  updateItem<T = MasterEntity>(collectionName: string, id: string, item: Partial<T>): Promise<T>;
  deleteItem(collectionName: string, id: string): Promise<void>;

  // Convenience Typed Methods
  getDoctors(): Promise<Doctor[]>;
  saveDoctor(doc: Partial<Doctor>): Promise<Doctor>;
  deleteDoctor(id: string): Promise<void>;

  getChemists(): Promise<Chemist[]>;
  saveChemist(chemist: Partial<Chemist>): Promise<Chemist>;
  deleteChemist(id: string): Promise<void>;

  getStockists(): Promise<Stockist[]>;
  saveStockist(stockist: Partial<Stockist>): Promise<Stockist>;
  deleteStockist(id: string): Promise<void>;

  getProducts(): Promise<Product[]>;
  saveProduct(prod: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  getHolidays(): Promise<Holiday[]>;
  saveHoliday(holiday: Partial<Holiday>): Promise<Holiday>;
  deleteHoliday(id: string): Promise<void>;
}
