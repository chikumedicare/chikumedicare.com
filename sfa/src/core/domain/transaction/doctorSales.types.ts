export interface DoctorProductQtyItem {
  productId: string;
  productName: string;
  packSize: string;
  rate: number; // PTR or MRP
  quantity: number; // Doctor Prescribed / Supported Units
  amount: number; // qty * rate
}

export interface DoctorSalesEntryRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  degree?: string;
  hqId?: string;
  hqName?: string;
  patchName?: string;
  monthYear: string; // YYYY-MM e.g. 2026-08
  financialYear: string; // e.g. 2026-27
  items: DoctorProductQtyItem[];
  totalQuantity: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'DRAFT';
  remarks?: string;
  createdAt?: string;
}
