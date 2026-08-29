import React, { useState, useEffect } from 'react';
import type { TourPlan, TourPlanDay, WorkType } from '../../../../core/domain/transaction/tourPlan.types';
import { TourPlanList } from './TourPlanList';
import { TourPlanPlanner } from './TourPlanPlanner';
import { TourPlanDayEditorModal } from './TourPlanDayEditorModal';
import { getFinancialYearInfo, BASE_INDIAN_FESTIVALS } from '../../../../components/FestivalDatePicker';
import { useGeographyStore } from '../../../../store/hr/useGeographyStore';

interface MockEmployee {
  id: string;
  name: string;
  empCode: string;
  role: string;
  hqId: string;
  hqName: string;
}

const MOCK_EMPLOYEES: MockEmployee[] = [
  { id: 'EMP-001', name: 'Rahul Sharma', empCode: 'MR-0101', role: 'Medical Representative (MR)', hqId: 'HQ-01', hqName: 'Bhopal Central' },
  { id: 'EMP-002', name: 'Pooja Verma', empCode: 'MR-0102', role: 'Medical Representative (MR)', hqId: 'HQ-02', hqName: 'Indore City' },
  { id: 'EMP-003', name: 'Amit Singh', empCode: 'ASM-0201', role: 'Area Sales Manager (ASM)', hqId: 'HQ-01', hqName: 'Bhopal Central' },
  { id: 'EMP-004', name: 'Vikram Mehta', empCode: 'RSM-0301', role: 'Regional Sales Manager (RSM)', hqId: 'HQ-01', hqName: 'Bhopal Central' },
  { id: 'EMP-005', name: 'Sanjay Gupta', empCode: 'MR-0103', role: 'Medical Representative (MR)', hqId: 'HQ-03', hqName: 'Jabalpur East' },
];

const MOCK_MANAGERS = [
  { id: 'MGR-01', name: 'Amit Singh', role: 'ASM' },
  { id: 'MGR-02', name: 'Vikram Mehta', role: 'RSM' },
  { id: 'MGR-03', name: 'Rajesh Nair', role: 'ZSM' },
];

const INITIAL_TP_LIST: TourPlan[] = [
  {
    id: 'TP-2026-09-01',
    employeeId: 'EMP-001',
    employeeName: 'Rahul Sharma',
    employeeRole: 'MR',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    financialYear: '2026-27',
    monthYear: '2026-09',
    status: 'APPROVED',
    submittedAt: '2026-08-25 11:30 AM',
    details: [],
  },
  {
    id: 'TP-2026-09-02',
    employeeId: 'EMP-002',
    employeeName: 'Pooja Verma',
    employeeRole: 'MR',
    hqId: 'HQ-02',
    hqName: 'Indore City',
    financialYear: '2026-27',
    monthYear: '2026-09',
    status: 'PENDING_APPROVAL',
    submittedAt: '2026-08-27 06:45 PM',
    details: [],
  },
];

export function TourPlanEntry() {
  const { areas } = useGeographyStore();
  const [viewMode, setViewMode] = useState<'LIST' | 'PLANNER'>('LIST');

  const [tpList, setTpList] = useState<TourPlan[]>(INITIAL_TP_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const now = new Date();
  const [selectedEmpId, setSelectedEmpId] = useState<string>(MOCK_EMPLOYEES[0].id);
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [days, setDays] = useState<TourPlanDay[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [quickFillAreaId, setQuickFillAreaId] = useState<string>('');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentFY = selectedMonth >= 4
    ? `${selectedYear}-${String(selectedYear + 1).substring(2)}`
    : `${selectedYear - 1}-${String(selectedYear).substring(2)}`;

  const availableAreas = areas.length > 0
    ? areas.map((a: any) => ({ id: a.id, name: a.name || a.areaName || 'Area' }))
    : [
        { id: 'AREA-01', name: 'MP Nagar Zone 1' },
        { id: 'AREA-02', name: 'Arera Colony & 10 No. Market' },
        { id: 'AREA-03', name: 'New Market & TT Nagar' },
      ];

  const selectedEmployee = MOCK_EMPLOYEES.find((e) => e.id === selectedEmpId) || MOCK_EMPLOYEES[0];

  useEffect(() => {
    if (viewMode === 'PLANNER') {
      const daysCount = new Date(selectedYear, selectedMonth, 0).getDate();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const newDays: TourPlanDay[] = [];

      for (let i = 1; i <= daysCount; i++) {
        const dStr = String(i).padStart(2, '0');
        const mStr = String(selectedMonth).padStart(2, '0');
        const dateStr = `${selectedYear}-${mStr}-${dStr}`;
        const dObj = new Date(selectedYear, selectedMonth - 1, i);
        const dayOfWeek = dObj.getDay();
        const fest = BASE_INDIAN_FESTIVALS.find((f) => f.date === dateStr);

        let initialWorkType: WorkType = 'FIELD_WORK';
        if (dayOfWeek === 0) initialWorkType = 'WEEKLY_OFF';
        else if (fest) initialWorkType = 'HOLIDAY';

        newDays.push({
          date: dateStr,
          dayName: dayNames[dayOfWeek],
          workType: initialWorkType,
          workWithMode: 'ALONE',
          workingAreaIds: initialWorkType === 'FIELD_WORK' && availableAreas[0] ? [availableAreas[0].id] : [],
          workingAreaNames: initialWorkType === 'FIELD_WORK' && availableAreas[0] ? [availableAreas[0].name] : [],
          remarks: fest ? fest.name : undefined,
        });
      }
      setDays(newDays);
    }
  }, [viewMode, selectedMonth, selectedYear]);

  const handleQuickFillArea = () => {
    if (!quickFillAreaId) return;
    const targetArea = availableAreas.find((a: any) => a.id === quickFillAreaId);
    if (!targetArea) return;

    setDays((prev) =>
      prev.map((d) => (d.workType === 'FIELD_WORK' ? { ...d, workingAreaIds: [targetArea.id], workingAreaNames: [targetArea.name] } : d))
    );
    setAlertMsg(`✓ Auto-filled "${targetArea.name}" across all Field Work days!`);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleSaveDraftPlan = () => {
    const monthYearStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const newPlan: TourPlan = {
      id: `TP-${monthYearStr}-${selectedEmpId}`,
      employeeId: selectedEmpId,
      employeeName: selectedEmployee.name,
      employeeRole: selectedEmployee.role.includes('MR') ? 'MR' : 'ASM',
      hqId: selectedEmployee.hqId,
      hqName: selectedEmployee.hqName,
      financialYear: currentFY,
      monthYear: monthYearStr,
      status: 'DRAFT',
      details: days,
    };
    setTpList((prev) => [newPlan, ...prev.filter((p) => p.id !== newPlan.id)]);
    setViewMode('LIST');
    setAlertMsg('💾 Tour Plan Draft saved successfully in directory!');
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSubmitPlanForApproval = () => {
    const monthYearStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const newPlan: TourPlan = {
      id: `TP-${monthYearStr}-${selectedEmpId}`,
      employeeId: selectedEmpId,
      employeeName: selectedEmployee.name,
      employeeRole: selectedEmployee.role.includes('MR') ? 'MR' : 'ASM',
      hqId: selectedEmployee.hqId,
      hqName: selectedEmployee.hqName,
      financialYear: currentFY,
      monthYear: monthYearStr,
      status: 'PENDING_APPROVAL',
      submittedAt: new Date().toLocaleString(),
      details: days,
    };
    setTpList((prev) => [newPlan, ...prev.filter((p) => p.id !== newPlan.id)]);
    setViewMode('LIST');
    setAlertMsg('🚀 Tour Plan submitted successfully for Manager Approval!');
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const filteredPlans = tpList.filter((plan) => {
    if (fyFilter !== 'ALL' && plan.financialYear !== fyFilter) return false;
    if (statusFilter !== 'ALL' && plan.status !== statusFilter) return false;
    if (monthFilter !== 'ALL' && !plan.monthYear.endsWith(`-${monthFilter}`)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return `${plan.employeeName} ${plan.hqName} ${plan.monthYear} ${plan.financialYear}`.toLowerCase().includes(q);
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

      {viewMode === 'LIST' ? (
        <TourPlanList
          plans={filteredPlans}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fyFilter={fyFilter}
          setFyFilter={setFyFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          monthNames={monthNames}
          onAddNew={() => setViewMode('PLANNER')}
          onEdit={(p) => {
            setSelectedEmpId(p.employeeId);
            setViewMode('PLANNER');
          }}
          onDelete={(id) => setTpList((prev) => prev.filter((p) => p.id !== id))}
        />
      ) : (
        <TourPlanPlanner
          selectedEmployee={selectedEmployee}
          selectedEmpId={selectedEmpId}
          setSelectedEmpId={setSelectedEmpId}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          currentFY={currentFY}
          monthNames={monthNames}
          mockEmployees={MOCK_EMPLOYEES}
          availableAreas={availableAreas}
          days={days}
          quickFillAreaId={quickFillAreaId}
          setQuickFillAreaId={setQuickFillAreaId}
          onQuickFill={handleQuickFillArea}
          onEditDay={(idx) => setEditingIndex(idx)}
          onBack={() => setViewMode('LIST')}
          onSaveDraft={handleSaveDraftPlan}
          onSubmitApproval={handleSubmitPlanForApproval}
        />
      )}

      {editingIndex !== null && days[editingIndex] && (
        <TourPlanDayEditorModal
          day={days[editingIndex]}
          availableAreas={availableAreas}
          availableManagers={MOCK_MANAGERS}
          onSave={(u) => {
            setDays((prev) => { const c = [...prev]; c[editingIndex] = u; return c; });
            setEditingIndex(null);
          }}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
}
export default TourPlanEntry;
