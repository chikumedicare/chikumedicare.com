export interface SecondaryProductQtyItem {
  productId: string;
  productName: string;
  packSize: string;
  rate: number; // PTR (Price to Retailer / Chemist)
  quantity: number; // Secondary Units Sold
  freeQuantity?: number;
  amount: number; // qty * rate
}

export interface SecondarySalesEntryRecord {
  id: string;
  stockistId: string;
  stockistName: string;
  hqId?: string;
  hqName?: string;
  monthYear: string; // YYYY-MM e.g. 2026-08
  financialYear: string; // e.g. 2026-27
  items: SecondaryProductQtyItem[];
  totalQuantity: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'DRAFT';
  remarks?: string;
  createdAt?: string;
}
