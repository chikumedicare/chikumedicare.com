import React, { useState, useEffect } from 'react';
import type { SecondarySalesEntryRecord, SecondaryProductQtyItem } from '../../../../core/domain/transaction/secondarySales.types';
import { SecondarySalesList } from './SecondarySalesList';
import { SecondarySalesContextModal } from './SecondarySalesContextModal';
import { SecondarySalesForm } from './SecondarySalesForm';
import type { FYMonthOption } from '../primary-sales/PrimarySalesForm';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';

const MOCK_STOCKISTS = [
  { id: 'STK-01', firmName: 'M/s Mahaveer Medi-Sales', proprietor: 'Rajendra Jain', hqId: 'HQ-01', hqName: 'Bhopal Central', phone: '9826012345' },
  { id: 'STK-02', firmName: 'Royal Pharma Distributors', proprietor: 'Sunil Sharma', hqId: 'HQ-02', hqName: 'Indore City', phone: '9827054321' },
  { id: 'STK-03', firmName: 'Apex Medical Agencies', proprietor: 'Vikas Dubey', hqId: 'HQ-01', hqName: 'Bhopal Central', phone: '9425098765' },
  { id: 'STK-04', firmName: 'Narmada Healthcare Distributors', proprietor: 'Manoj Patel', hqId: 'HQ-03', hqName: 'Jabalpur East', phone: '9826112233' },
];

const MOCK_PRODUCTS: { id: string; name: string; packSize: string; rate: number }[] = [
  { id: 'PRD-01', name: 'Chiku-Glow Face Wash (100ml)', packSize: '100 ml Tube', rate: 175.0 }, // PTR
  { id: 'PRD-02', name: 'Sun-Guard SPF 50+ Gel (50g)', packSize: '50 g Tube', rate: 250.0 },
  { id: 'PRD-03', name: 'D-Cal 500 Tablet (Calcium + D3)', packSize: '15 x 10 Strip', rate: 110.0 },
  { id: 'PRD-04', name: 'Fluka-150 Capsule (Fluconazole)', packSize: '1 x 1 Strip', rate: 30.0 },
  { id: 'PRD-05', name: 'Derma-Klenz Anti-Acne Serum (30ml)', packSize: '30 ml Bottle', rate: 390.0 },
  { id: 'PRD-06', name: 'Mome-Skin Cream (Mometasone 15g)', packSize: '15 g Tube', rate: 105.0 },
];

const INITIAL_ENTRIES: SecondarySalesEntryRecord[] = [
  {
    id: 'SS-2026-08-STK-01',
    stockistId: 'STK-01',
    stockistName: 'M/s Mahaveer Medi-Sales',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    monthYear: '2026-08',
    financialYear: '2026-27',
    totalQuantity: 1150,
    totalAmount: 201250,
    status: 'CONFIRMED',
    items: [
      { productId: 'PRD-01', productName: 'Chiku-Glow Face Wash (100ml)', packSize: '100 ml Tube', rate: 175.0, quantity: 480, freeQuantity: 48, amount: 84000 },
      { productId: 'PRD-02', productName: 'Sun-Guard SPF 50+ Gel (50g)', packSize: '50 g Tube', rate: 250.0, quantity: 380, freeQuantity: 38, amount: 95000 },
      { productId: 'PRD-03', productName: 'D-Cal 500 Tablet (Calcium + D3)', packSize: '15 x 10 Strip', rate: 110.0, quantity: 290, freeQuantity: 0, amount: 31900 },
    ],
  },
  {
    id: 'SS-2026-08-STK-02',
    stockistId: 'STK-02',
    stockistName: 'Royal Pharma Distributors',
    hqId: 'HQ-02',
    hqName: 'Indore City',
    monthYear: '2026-08',
    financialYear: '2026-27',
    totalQuantity: 1720,
    totalAmount: 358400,
    status: 'CONFIRMED',
    items: [
      { productId: 'PRD-01', productName: 'Chiku-Glow Face Wash (100ml)', packSize: '100 ml Tube', rate: 175.0, quantity: 950, freeQuantity: 95, amount: 166250 },
      { productId: 'PRD-05', productName: 'Derma-Klenz Anti-Acne Serum (30ml)', packSize: '30 ml Bottle', rate: 390.0, quantity: 480, freeQuantity: 0, amount: 187200 },
    ],
  },
];

export function SecondarySalesEntry() {
  const fyInfo = getFinancialYearInfo();
  const [viewMode, setViewMode] = useState<'LIST' | 'SELECT_MONTH' | 'FORM'>('LIST');
  const [entries, setEntries] = useState<SecondarySalesEntryRecord[]>(INITIAL_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [stockistFilter, setStockistFilter] = useState<string>('ALL');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const now = new Date();
  const curMonthVal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedStockistId, setSelectedStockistId] = useState<string>(MOCK_STOCKISTS[0].id);
  const [monthYear, setMonthYear] = useState<string>(curMonthVal);
  const [remarks, setRemarks] = useState<string>('');

  const initItems = (): SecondaryProductQtyItem[] =>
    MOCK_PRODUCTS.map((p) => ({
      productId: p.id,
      productName: p.name,
      packSize: p.packSize,
      rate: p.rate,
      quantity: 0,
      freeQuantity: 0,
      amount: 0,
    }));

  const [items, setItems] = useState<SecondaryProductQtyItem[]>(initItems());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentStockist = MOCK_STOCKISTS.find((s) => s.id === selectedStockistId) || MOCK_STOCKISTS[0];

  useEffect(() => {
    if (viewMode === 'FORM') {
      const existing = entries.find(
        (e) => e.stockistId === selectedStockistId && e.monthYear === monthYear
      );

      if (existing && existing.items && existing.items.length > 0) {
        const loadedItems = MOCK_PRODUCTS.map((p) => {
          const saved = existing.items.find((i) => i.productId === p.id);
          return {
            productId: p.id,
            productName: p.name,
            packSize: p.packSize,
            rate: p.rate,
            quantity: saved ? saved.quantity : 0,
            freeQuantity: saved ? saved.freeQuantity || 0 : 0,
            amount: saved ? saved.amount : 0,
          };
        });
        setItems(loadedItems);
        setRemarks(existing.remarks || '');
      } else {
        setItems(initItems());
        setRemarks('');
      }
    }
  }, [viewMode, selectedStockistId, monthYear]);

  const curStartYear = fyInfo.currentStartYear; // 2026
  const baseFYMonths = [
    { name: `April ${curStartYear}`, value: `${curStartYear}-04` },
    { name: `May ${curStartYear}`, value: `${curStartYear}-05` },
    { name: `June ${curStartYear}`, value: `${curStartYear}-06` },
    { name: `July ${curStartYear}`, value: `${curStartYear}-07` },
    { name: `August ${curStartYear}`, value: `${curStartYear}-08` },
    { name: `September ${curStartYear}`, value: `${curStartYear}-09` },
    { name: `October ${curStartYear}`, value: `${curStartYear}-10` },
    { name: `November ${curStartYear}`, value: `${curStartYear}-11` },
    { name: `December ${curStartYear}`, value: `${curStartYear}-12` },
    { name: `January ${curStartYear + 1}`, value: `${curStartYear + 1}-01` },
    { name: `February ${curStartYear + 1}`, value: `${curStartYear + 1}-02` },
    { name: `March ${curStartYear + 1}`, value: `${curStartYear + 1}-03` },
  ];

  const fyMonthOptions: FYMonthOption[] = baseFYMonths
    .filter((m) => m.value <= curMonthVal)
    .map((m) => {
      const existing = entries.find(
        (e) => e.stockistId === selectedStockistId && e.monthYear === m.value
      );
      const isCur = m.value === curMonthVal;
      const isEntered = !!existing;

      let label = `🗓️ ${m.name}`;
      if (isCur) label += ' (Current Month)';
      if (isEntered) label += ` — ✅ Already Entered (${existing.totalQuantity.toLocaleString('en-IN')} Units)`;
      else label += ' — ⚪ Not Entered (Pending)';

      return {
        label,
        value: m.value,
        isEntered,
        totalUnits: existing?.totalQuantity,
      };
    });

  const selectedMonthOption = fyMonthOptions.find((m) => m.value === monthYear) || fyMonthOptions[0];
  const isAlreadyEntered = !!selectedMonthOption?.isEntered;

  const handleQtyChange = (idx: number, qty: number) => {
    setItems((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], quantity: qty, amount: qty * clone[idx].rate };
      return clone;
    });
  };

  const handleFreeQtyChange = (idx: number, freeQty: number) => {
    setItems((prev) => {
      const clone = [...prev];
      clone[idx] = { ...clone[idx], freeQuantity: freeQty };
      return clone;
    });
  };

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalQuantity === 0) {
      alert('Please enter quantity for at least one product.');
      return;
    }

    const newRecord: SecondarySalesEntryRecord = {
      id: `SS-${monthYear}-${currentStockist.id}`,
      stockistId: currentStockist.id,
      stockistName: currentStockist.firmName,
      hqId: currentStockist.hqId,
      hqName: currentStockist.hqName,
      monthYear,
      financialYear: fyInfo.currentFY,
      items: items.filter((i) => i.quantity > 0),
      totalQuantity,
      totalAmount,
      status: 'CONFIRMED',
      remarks: remarks.trim() || undefined,
      createdAt: new Date().toLocaleString(),
    };

    setEntries((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    setViewMode('LIST');
    setAlertMsg(`✓ Secondary Sales of ${totalQuantity} units ${isAlreadyEntered ? 'updated' : 'saved'} for ${currentStockist.firmName} (${monthYear})!`);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const filteredEntries = entries.filter((ent) => {
    if (fyFilter !== 'ALL' && ent.financialYear !== fyFilter) return false;
    if (monthFilter !== 'ALL' && !ent.monthYear.endsWith(`-${monthFilter}`)) return false;
    if (stockistFilter !== 'ALL' && ent.stockistId !== stockistFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return `${ent.stockistName} ${ent.hqName || ''} ${ent.monthYear} ${ent.financialYear}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {alertMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '12px 18px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700 }}>
          <span>✨</span> {alertMsg}
        </div>
      )}

      {viewMode === 'LIST' && (
        <SecondarySalesList
          entries={filteredEntries}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fyFilter={fyFilter}
          setFyFilter={setFyFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          stockistFilter={stockistFilter}
          setStockistFilter={setStockistFilter}
          monthNames={monthNames}
          stockists={MOCK_STOCKISTS}
          onAddNew={() => setViewMode('SELECT_MONTH')}
          onEdit={(ent) => { setSelectedStockistId(ent.stockistId); setMonthYear(ent.monthYear); setViewMode('FORM'); }}
          onDelete={(id) => {
            if (!window.confirm('Delete this secondary sales entry?')) return;
            setEntries((prev) => prev.filter((e) => e.id !== id));
          }}
        />
      )}

      {viewMode === 'SELECT_MONTH' && (
        <SecondarySalesContextModal
          selectedStockistId={selectedStockistId}
          setSelectedStockistId={setSelectedStockistId}
          monthYear={monthYear}
          setMonthYear={setMonthYear}
          stockists={MOCK_STOCKISTS}
          currentStockist={currentStockist}
          currentFY={fyInfo.currentFY}
          fyMonthOptions={fyMonthOptions}
          isAlreadyEntered={isAlreadyEntered}
          existingUnits={selectedMonthOption?.totalUnits}
          onProceed={() => setViewMode('FORM')}
          onCancel={() => setViewMode('LIST')}
        />
      )}

      {viewMode === 'FORM' && (
        <SecondarySalesForm
          monthYear={monthYear}
          items={items}
          remarks={remarks}
          setRemarks={setRemarks}
          currentStockist={currentStockist}
          currentFY={fyInfo.currentFY}
          selectedMonthOption={selectedMonthOption}
          isAlreadyEntered={isAlreadyEntered}
          totalQuantity={totalQuantity}
          totalAmount={totalAmount}
          onQtyChange={handleQtyChange}
          onFreeQtyChange={handleFreeQtyChange}
          onChangeContext={() => setViewMode('SELECT_MONTH')}
          onCancel={() => setViewMode('LIST')}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
export default SecondarySalesEntry;
