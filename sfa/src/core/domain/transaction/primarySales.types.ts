export interface PrimaryProductQtyItem {
  productId: string;
  productName: string;
  packSize: string;
  rate: number; // PTS or Net Rate
  quantity: number; // Entered Billed Qty
  freeQuantity?: number;
  amount: number; // qty * rate
}

export interface PrimarySalesEntryRecord {
  id: string;
  stockistId: string;
  stockistName: string;
  hqId?: string;
  hqName?: string;
  monthYear: string; // YYYY-MM e.g. 2026-08
  financialYear: string; // e.g. 2026-27
  items: PrimaryProductQtyItem[];
  totalQuantity: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'DRAFT';
  remarks?: string;
  createdAt?: string;
}
