import React, { useState } from 'react';
import type { ApprovalCategory, ApprovalItem, ApprovalStatus } from '../../core/domain/approvals/approvalEngine.types';
import { ApprovalKpiBar } from './ApprovalKpiBar';
import { ApprovalDataTable } from './ApprovalDataTable';
import { ApprovalActionModal } from './ApprovalActionModal';
import { getFinancialYearInfo } from '../../components/FestivalDatePicker';

interface ApprovalsEngineContainerProps {
  category: ApprovalCategory;
  categoryTitle: string;
}

const INITIAL_MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: 'APP-TP-01',
    type: 'TOUR_PLAN',
    requestedBy: 'EMP-01',
    requestedByName: 'Aman Sharma',
    requesterRole: 'Medical Representative (MR)',
    requesterHqName: 'Bhopal Central',
    entityTitle: 'Tour Plan: September 2026',
    entitySubtitle: '22 Field Days Planned • 220 Doctor Call Targets',
    financialYear: '2026-27',
    createdAt: '2026-08-26 11:30 AM',
    status: 'PENDING',
    payload: { month: 9, year: 2026, fieldDays: 22, drCalls: 220 },
  },
  {
    id: 'APP-LV-01',
    type: 'LEAVE',
    requestedBy: 'EMP-01',
    requestedByName: 'Aman Sharma',
    requesterRole: 'Medical Representative (MR)',
    requesterHqName: 'Bhopal Central',
    entityTitle: 'Casual Leave (CL): 2 Days',
    entitySubtitle: 'From 2026-09-04 to 2026-09-05 • Reason: Family Function',
    financialYear: '2026-27',
    createdAt: '2026-08-27 04:15 PM',
    status: 'PENDING',
    payload: { leaveType: 'CL', fromDate: '2026-09-04', toDate: '2026-09-05', totalDays: 2 },
  },
  {
    id: 'APP-DR-ADD-01',
    type: 'DR_ADD',
    requestedBy: 'EMP-01',
    requestedByName: 'Aman Sharma',
    requesterRole: 'Medical Representative (MR)',
    requesterHqName: 'Bhopal Central',
    entityTitle: 'Add Doctor: Dr. Vivek Agrawal (MD Medicine)',
    entitySubtitle: 'Specialty: Consultant Physician • Patch: MP Nagar Zone 2',
    financialYear: '2026-27',
    createdAt: '2026-08-25 02:20 PM',
    status: 'PENDING',
    payload: { name: 'Dr. Vivek Agrawal', degree: 'MBBS, MD', specialty: 'Physician', patch: 'Zone 2' },
  },
  {
    id: 'APP-DR-EDIT-01',
    type: 'DR_EDIT',
    requestedBy: 'EMP-01',
    requestedByName: 'Aman Sharma',
    requesterRole: 'Medical Representative (MR)',
    requesterHqName: 'Bhopal Central',
    entityTitle: 'Edit Doctor: Dr. Rajesh Sharma (Update Patch & Timing)',
    entitySubtitle: 'Modified Clinic Timings to Evening 6-9 PM',
    financialYear: '2026-27',
    createdAt: '2026-08-24 01:10 PM',
    status: 'APPROVED',
    reviewedBy: 'Area Sales Manager (ASM)',
    managerRemarks: 'Verified and approved.',
    payload: { doctorId: 'DOC-01', timing: '6:00 PM - 9:00 PM' },
    oldData: { timing: '10:00 AM - 2:00 PM' },
  },
  {
    id: 'APP-DR-DEL-01',
    type: 'DR_DELETE',
    requestedBy: 'EMP-01',
    requestedByName: 'Aman Sharma',
    requesterRole: 'Medical Representative (MR)',
    requesterHqName: 'Bhopal Central',
    entityTitle: 'Delete Doctor: Dr. K. K. Mishra (Relocated)',
    entitySubtitle: 'Doctor permanently shifted practice to Jabalpur',
    financialYear: '2026-27',
    createdAt: '2026-08-23 09:40 AM',
    status: 'PENDING',
    payload: { doctorId: 'DOC-99', reason: 'Relocated out of territory' },
  },
  {
    id: 'APP-SPON-01',
    type: 'SPONSORSHIP',
    requestedBy: 'EMP-01',
    requestedByName: 'Aman Sharma',
    requesterRole: 'Medical Representative (MR)',
    requesterHqName: 'Bhopal Central',
    entityTitle: 'Sponsorship: 78th National Cardiology CME',
    entitySubtitle: 'Dr. Sunita Verma • Amount: ₹18,000.00 • Academic Grant',
    financialYear: '2026-27',
    createdAt: '2026-08-25 11:15 AM',
    status: 'PENDING',
    payload: { doctorName: 'Dr. Sunita Verma', amount: 18000, type: 'CME_CONFERENCE' },
  },
];

export function ApprovalsEngineContainer({ category, categoryTitle }: ApprovalsEngineContainerProps) {
  const fyInfo = getFinancialYearInfo();
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_MOCK_APPROVALS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeReviewItem, setActiveReviewItem] = useState<ApprovalItem | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const categoryItems = approvals.filter((a) => a.type === category);
  const pendingCount = categoryItems.filter((a) => a.status === 'PENDING').length;
  const approvedCount = categoryItems.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = categoryItems.filter((a) => a.status === 'REJECTED').length;

  const handleApprove = (id: string, remarks: string) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'APPROVED', managerRemarks: remarks, reviewedBy: 'You (Manager)', reviewedAt: new Date().toLocaleString() } : item
      )
    );
    setActiveReviewItem(null);
    setAlertMsg('✓ Request approved successfully!');
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleReject = (id: string, remarks: string) => {
    setApprovals((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'REJECTED', managerRemarks: remarks, reviewedBy: 'You (Manager)', reviewedAt: new Date().toLocaleString() } : item
      )
    );
    setActiveReviewItem(null);
    setAlertMsg('❌ Request rejected.');
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    setApprovals((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, status: 'APPROVED', managerRemarks: 'Batch Approved', reviewedBy: 'You (Manager)' } : item
      )
    );
    setSelectedIds([]);
    setAlertMsg(`✓ ${selectedIds.length} requests batch approved successfully!`);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const filteredItems = categoryItems.filter((item) => {
    if (fyFilter !== 'ALL' && item.financialYear !== fyFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return `${item.requestedByName} ${item.entityTitle} ${item.entitySubtitle} ${item.requesterHqName || ''}`.toLowerCase().includes(q);
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

      {/* KPI Bar */}
      <ApprovalKpiBar
        pendingCount={pendingCount}
        approvedCount={approvedCount}
        rejectedCount={rejectedCount}
        title={categoryTitle}
      />

      {/* Top Filter & Batch Toolbar */}
      <div
        className="toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 16px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <input
          placeholder="Search by Requester, Subject, HQ, or Keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: '200px' }}
        />

        <select
          value={fyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          style={{ flex: '0 0 auto', fontWeight: 800, color: '#059669', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Financial Years</option>
          <option value={fyInfo.currentFY}>🟢 Current FY ({fyInfo.currentFY})</option>
          <option value={fyInfo.nextFY}>🔵 Next FY ({fyInfo.nextFY})</option>
          <option value={fyInfo.previousFY}>🔒 Previous FY ({fyInfo.previousFY})</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">⏳ Pending Only</option>
          <option value="APPROVED">✅ Approved</option>
          <option value="REJECTED">❌ Rejected</option>
        </select>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={handleBatchApprove}
            style={{
              marginLeft: 'auto',
              borderRadius: '8px',
              fontWeight: 800,
              padding: '8px 16px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✅ Approve Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Approvals Table */}
      <ApprovalDataTable
        items={filteredItems}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onOpenDetail={(item) => setActiveReviewItem(item)}
        onQuickApprove={(id) => handleApprove(id, 'Quick Approved')}
        onQuickReject={(id) => handleReject(id, 'Quick Rejected')}
      />

      {/* Review & Action Modal */}
      {activeReviewItem && (
        <ApprovalActionModal
          item={activeReviewItem}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setActiveReviewItem(null)}
        />
      )}
    </div>
  );
}
