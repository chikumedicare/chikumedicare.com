import React, { useState } from 'react';
import type { LeaveApplicationRecord, LeaveBalance } from '../../../../core/domain/transaction/leaveApplication.types';
import { LeaveApplicationBalanceCards } from './LeaveApplicationBalanceCards';
import { LeaveApplicationList } from './LeaveApplicationList';
import { LeaveApplyModal } from './LeaveApplyModal';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';

const MOCK_EMPLOYEES = [
  { id: 'EMP-01', name: 'Aman Sharma', role: 'Medical Representative (MR)', hqId: 'HQ-01', hqName: 'Bhopal Central' },
  { id: 'EMP-02', name: 'Pooja Verma', role: 'Area Sales Manager (ASM)', hqId: 'HQ-01', hqName: 'Bhopal Central' },
  { id: 'EMP-03', name: 'Rahul Joshi', role: 'Medical Representative (MR)', hqId: 'HQ-02', hqName: 'Indore City' },
];

const INITIAL_BALANCE: LeaveBalance = {
  clAllocated: 10,
  clUsed: 3,
  clAvailable: 7,
  slAllocated: 8,
  slUsed: 0,
  slAvailable: 8,
  plAllocated: 12,
  plUsed: 2,
  plAvailable: 10,
};

const INITIAL_LEAVES: LeaveApplicationRecord[] = [
  {
    id: 'LV-2026-001',
    employeeId: 'EMP-01',
    employeeName: 'Aman Sharma',
    employeeRole: 'Medical Representative (MR)',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    leaveType: 'CL',
    fromDate: '2026-08-28',
    toDate: '2026-08-29',
    totalDays: 2,
    reason: 'Family wedding function in hometown.',
    emergencyContact: '9826012345',
    financialYear: '2026-27',
    monthYear: '2026-08',
    status: 'APPROVED',
    approvedBy: 'Area Sales Manager (ASM)',
    appliedAt: '2026-08-22 10:30 AM',
  },
  {
    id: 'LV-2026-002',
    employeeId: 'EMP-01',
    employeeName: 'Aman Sharma',
    employeeRole: 'Medical Representative (MR)',
    hqId: 'HQ-01',
    hqName: 'Bhopal Central',
    leaveType: 'SL',
    fromDate: '2026-09-04',
    toDate: '2026-09-05',
    totalDays: 2,
    reason: 'Viral fever and physician recommended rest.',
    emergencyContact: '9826012345',
    financialYear: '2026-27',
    monthYear: '2026-09',
    status: 'PENDING_APPROVAL',
    appliedAt: '2026-08-27 04:15 PM',
  },
];

export function LeaveApplicationEntry() {
  const fyInfo = getFinancialYearInfo();
  const [leaves, setLeaves] = useState<LeaveApplicationRecord[]>(INITIAL_LEAVES);
  const [balance, setBalance] = useState<LeaveBalance>(INITIAL_BALANCE);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<LeaveApplicationRecord | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const pendingCount = leaves.filter((l) => l.status === 'PENDING_APPROVAL').length;

  const handleSaveLeave = (data: Partial<LeaveApplicationRecord>) => {
    const newRecord: LeaveApplicationRecord = {
      ...(editingRecord || {}),
      ...(data as LeaveApplicationRecord),
      id: editingRecord?.id || ('LV-' + Date.now()),
      status: 'PENDING_APPROVAL',
      appliedAt: new Date().toLocaleString(),
    };

    if (editingRecord) {
      setLeaves((prev) => prev.map((l) => (l.id === editingRecord.id ? newRecord : l)));
      setAlertMsg('✓ Leave application updated and re-submitted for approval!');
    } else {
      setLeaves((prev) => [newRecord, ...prev]);
      setAlertMsg('🚀 Leave application submitted successfully for Manager Approval!');
    }

    setIsApplyModalOpen(false);
    setEditingRecord(null);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const filteredLeaves = leaves.filter((item) => {
    if (fyFilter !== 'ALL' && item.financialYear !== fyFilter) return false;
    if (typeFilter !== 'ALL' && item.leaveType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const str = item.employeeName + ' ' + item.leaveType + ' ' + (item.hqName || '') + ' ' + item.reason;
      return str.toLowerCase().includes(q);
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

      {/* Balance Cards Header */}
      <LeaveApplicationBalanceCards balance={balance} pendingCount={pendingCount} />

      {/* Directory List View */}
      <LeaveApplicationList
        records={filteredLeaves}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        fyFilter={fyFilter}
        setFyFilter={setFyFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onAddNew={() => { setEditingRecord(null); setIsApplyModalOpen(true); }}
        onEdit={(rec) => { setEditingRecord(rec); setIsApplyModalOpen(true); }}
        onDelete={(id) => {
          if (!window.confirm('Cancel this leave application?')) return;
          setLeaves((prev) => prev.filter((l) => l.id !== id));
        }}
      />

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <LeaveApplyModal
          initialRecord={editingRecord}
          balance={balance}
          currentFY={fyInfo.currentFY}
          employees={MOCK_EMPLOYEES}
          onSave={handleSaveLeave}
          onClose={() => { setIsApplyModalOpen(false); setEditingRecord(null); }}
        />
      )}
    </div>
  );
}
export default LeaveApplicationEntry;
