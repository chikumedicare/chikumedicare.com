import React, { useState } from 'react';
import type { DoctorSalesEntryRecord, DoctorProductQtyItem } from '../../../../core/domain/transaction/doctorSales.types';
import { DoctorSalesList } from './DoctorSalesList';
import { DoctorSalesMonthModal } from './DoctorSalesMonthModal';
import { DoctorSalesSheet } from './DoctorSalesSheet';
import { DoctorProductEditorModal } from './DoctorProductEditorModal';
import type { FYMonthOption } from '../primary-sales/PrimarySalesForm';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';

const MOCK_DOCTORS = [
  { id: 'DOC-01', name: 'Dr. Rajesh Sharma', degree: 'MBBS, MD (Medicine)', specialty: 'Consultant Physician', hqId: 'HQ-01', hqName: 'Bhopal Central', patchName: 'MP Nagar Zone 1' },
  { id: 'DOC-02', name: 'Dr. Sunita Verma', degree: 'MBBS, DNB (Dermatology)', specialty: 'Dermatologist', hqId: 'HQ-01', hqName: 'Bhopal Central', patchName: 'Arera Colony' },
  { id: 'DOC-03', name: 'Dr. Alok Gupta', degree: 'MBBS, MS (Ortho)', specialty: 'Orthopedic Surgeon', hqId: 'HQ-02', hqName: 'Indore City', patchName: 'Vijay Nagar' },
  { id: 'DOC-04', name: 'Dr. Meenakshi Dubey', degree: 'MBBS, DGO', specialty: 'Gynecologist', hqId: 'HQ-03', hqName: 'Jabalpur East', patchName: 'Civic Centre' },
  { id: 'DOC-05', name: 'Dr. Sandeep Joshi', degree: 'MBBS, MD (Pediatrics)', specialty: 'Pediatrician', hqId: 'HQ-01', hqName: 'Bhopal Central', patchName: 'New Market' },
];

const MOCK_PRODUCTS: { id: string; name: string; packSize: string; rate: number }[] = [
  { id: 'PRD-01', name: 'Chiku-Glow Face Wash (100ml)', packSize: '100 ml Tube', rate: 175.0 },
  { id: 'PRD-02', name: 'Sun-Guard SPF 50+ Gel (50g)', packSize: '50 g Tube', rate: 250.0 },
  { id: 'PRD-03', name: 'D-Cal 500 Tablet (Calcium + D3)', packSize: '15 x 10 Strip', rate: 110.0 },
  { id: 'PRD-04', name: 'Fluka-150 Capsule (Fluconazole)', packSize: '1 x 1 Strip', rate: 30.0 },
  { id: 'PRD-05', name: 'Derma-Klenz Anti-Acne Serum (30ml)', packSize: '30 ml Bottle', rate: 390.0 },
  { id: 'PRD-06', name: 'Mome-Skin Cream (Mometasone 15g)', packSize: '15 g Tube', rate: 105.0 },
];

const INITIAL_ENTRIES: DoctorSalesEntryRecord[] = [
  {
    id: 'DRS-2026-08-DOC-01',
    doctorId: 'DOC-01',
    doctorName: 'Dr. Rajesh Sharma',
    degree: 'MBBS, MD (Medicine)',
    specialty: 'Consultant Physician',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    patchName: 'MP Nagar Zone 1',
    monthYear: '2026-08',
    financialYear: '2026-27',
    totalQuantity: 420,
    totalAmount: 51200,
    status: 'CONFIRMED',
    items: [
      { productId: 'PRD-03', productName: 'D-Cal 500 Tablet (Calcium + D3)', packSize: '15 x 10 Strip', rate: 110.0, quantity: 300, amount: 33000 },
      { productId: 'PRD-04', productName: 'Fluka-150 Capsule (Fluconazole)', packSize: '1 x 1 Strip', rate: 30.0, quantity: 120, amount: 3600 },
    ],
  },
  {
    id: 'DRS-2026-08-DOC-02',
    doctorId: 'DOC-02',
    doctorName: 'Dr. Sunita Verma',
    degree: 'MBBS, DNB (Dermatology)',
    specialty: 'Dermatologist',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    patchName: 'Arera Colony',
    monthYear: '2026-08',
    financialYear: '2026-27',
    totalQuantity: 380,
    totalAmount: 112500,
    status: 'CONFIRMED',
    items: [
      { productId: 'PRD-01', productName: 'Chiku-Glow Face Wash (100ml)', packSize: '100 ml Tube', rate: 175.0, quantity: 200, amount: 35000 },
      { productId: 'PRD-05', productName: 'Derma-Klenz Anti-Acne Serum (30ml)', packSize: '30 ml Bottle', rate: 390.0, quantity: 180, amount: 70200 },
    ],
  },
];

export function DoctorSalesEntry() {
  const fyInfo = getFinancialYearInfo();
  const [viewMode, setViewMode] = useState<'LIST' | 'DOCTOR_SHEET'>('LIST');
  const [showMonthModal, setShowMonthModal] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);

  const [entries, setEntries] = useState<DoctorSalesEntryRecord[]>(INITIAL_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const now = new Date();
  const curMonthVal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [monthYear, setMonthYear] = useState<string>(curMonthVal);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

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
      const isCur = m.value === curMonthVal;
      let label = m.name;
      if (isCur) label += ' (Current Month)';
      return { label, value: m.value, isEntered: false };
    });

  const handleSaveDoctorProducts = (items: DoctorProductQtyItem[], remarks?: string) => {
    if (!editingDoctor) return;

    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    const newRecord: DoctorSalesEntryRecord = {
      id: `DRS-${monthYear}-${editingDoctor.id}`,
      doctorId: editingDoctor.id,
      doctorName: editingDoctor.name,
      degree: editingDoctor.degree,
      specialty: editingDoctor.specialty,
      hqId: editingDoctor.hqId,
      hqName: editingDoctor.hqName,
      patchName: editingDoctor.patchName,
      monthYear,
      financialYear: fyInfo.currentFY,
      items,
      totalQuantity,
      totalAmount,
      status: 'CONFIRMED',
      remarks,
      createdAt: new Date().toLocaleString(),
    };

    setEntries((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    setEditingDoctor(null);
    setAlertMsg(`✓ Saved ${totalQuantity} units Rx support for ${editingDoctor.name} (${monthYear})!`);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const filteredEntries = entries.filter((ent: any) => {
    if (fyFilter !== 'ALL' && ent.financialYear !== fyFilter) return false;
    if (monthFilter !== 'ALL' && !ent.monthYear.endsWith(`-${monthFilter}`)) return false;
    if (doctorFilter !== 'ALL' && ent.doctorId !== doctorFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return `${ent.doctorName} ${ent.specialty || ''} ${ent.hqName || ''} ${ent.monthYear} ${ent.financialYear}`.toLowerCase().includes(q);
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
        <DoctorSalesList
          entries={filteredEntries}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fyFilter={fyFilter}
          setFyFilter={setFyFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
          monthNames={monthNames}
          doctors={MOCK_DOCTORS}
          onAddNew={() => setShowMonthModal(true)}
          onEdit={(ent: any) => {
            setMonthYear(ent.monthYear);
            const d = MOCK_DOCTORS.find((doc) => doc.id === ent.doctorId) || MOCK_DOCTORS[0];
            setEditingDoctor(d);
            setViewMode('DOCTOR_SHEET');
          }}
          onDelete={(id: any) => {
            if (!window.confirm('Delete this doctor sales entry?')) return;
            setEntries((prev) => prev.filter((e) => e.id !== id));
          }}
        />
      )}

      {viewMode === 'DOCTOR_SHEET' && (
        <DoctorSalesSheet
          monthYear={monthYear}
          currentFY={fyInfo.currentFY}
          doctors={MOCK_DOCTORS}
          entries={entries}
          onOpenProductEditor={(doc) => setEditingDoctor(doc)}
          onChangeMonth={() => setShowMonthModal(true)}
          onBackToDirectory={() => setViewMode('LIST')}
        />
      )}

      {showMonthModal && (
        <DoctorSalesMonthModal
          monthYear={monthYear}
          setMonthYear={setMonthYear}
          currentFY={fyInfo.currentFY}
          fyMonthOptions={fyMonthOptions}
          onProceed={() => {
            setShowMonthModal(false);
            setViewMode('DOCTOR_SHEET');
          }}
          onCancel={() => setShowMonthModal(false)}
        />
      )}

      {editingDoctor && (
        <DoctorProductEditorModal
          doctor={editingDoctor}
          monthYear={monthYear}
          currentFY={fyInfo.currentFY}
          initialItems={entries.find((e) => e.doctorId === editingDoctor.id && e.monthYear === monthYear)?.items || []}
          allProducts={MOCK_PRODUCTS}
          onSave={handleSaveDoctorProducts}
          onClose={() => setEditingDoctor(null)}
        />
      )}
    </div>
  );
}
export default DoctorSalesEntry;
