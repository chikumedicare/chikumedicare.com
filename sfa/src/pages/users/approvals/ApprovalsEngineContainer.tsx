import React, { useState, useEffect, useCallback } from 'react';
import type { ApprovalCategory, ApprovalItem } from '../../../core/domain/approvals/approvalEngine.types';
import { getFinancialYearInfo } from '../../../components/FestivalDatePicker';
import { getErrorMessage } from '../../../utils/dataIntegrity';
import { GatewayContainer } from '../../../core/container/GatewayContainer';
import { useGeographyStore } from '../../../store/hr/useGeographyStore';
import { ApprovalKpiBar } from './ApprovalKpiBar';
import { ApprovalDataTable } from './ApprovalDataTable';
import { ApprovalActionModal } from './ApprovalActionModal';

interface ApprovalsEngineContainerProps {
  category: ApprovalCategory;
  categoryTitle: string;
}

export function ApprovalsEngineContainer({ category, categoryTitle }: ApprovalsEngineContainerProps) {
  const fyInfo = getFinancialYearInfo();
  const { hqs, refresh: refreshGeo } = useGeographyStore();

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeReviewItem, setActiveReviewItem] = useState<ApprovalItem | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const getHqName = (hqId?: string) => {
    if (!hqId) return 'Corporate HQ';
    const h = hqs.find((item) => item.id === hqId);
    return h ? (h.name || (h as any).hq_name) : hqId;
  };

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRows, myRows] = await Promise.all([
        GatewayContainer.getApprovalGateway().getPendingApprovals(),
        GatewayContainer.getApprovalGateway().getMyApprovals().catch(() => []),
      ]);

      const allRowsMap = new Map<string, any>();
      (pendingRows || []).forEach((r) => allRowsMap.set(r.id, r));
      (myRows || []).forEach((r) => {
        if (!allRowsMap.has(r.id)) allRowsMap.set(r.id, r);
      });

      const formatted: ApprovalItem[] = Array.from(allRowsMap.values()).map((r) => {
        const payload: Record<string, any> = r.payload || {};
        const pName = payload.doctorName || payload.name || payload.shopName || payload.firmName || 'Entity';
        const pQual = payload.qualification ? ` (${payload.qualification})` : '';
        const pSpeciality = payload.speciality || 'General';
        const pClass = payload.doctorClass || payload.category || 'B';
        const pClinic = payload.clinicAddress || payload.clinic_address || 'Clinic';
        const pMobile = payload.mobile || '';

        let title = `${r.entityType}: ${pName}`;
        let subtitle = `Specialty: ${pSpeciality} • Class ${pClass} • ${pClinic}`;

        if (r.entityType === 'DR_ADD') {
          title = `Add Doctor: ${pName}${pQual}`;
          subtitle = `Speciality: ${pSpeciality} • Class ${pClass} • Mobile: ${pMobile} • ${pClinic}`;
        } else if (r.entityType === 'DR_EDIT') {
          title = `Edit Doctor: ${pName}`;
          subtitle = `Modification request for Doctor profile • Mobile: ${pMobile}`;
        } else if (r.entityType === 'DR_DELETE') {
          title = `Delete Doctor: ${pName}`;
          subtitle = `Deactivation request for Doctor • ${payload.reason || 'Territory relocation'}`;
        } else if (r.entityType === 'TOUR_PLAN') {
          title = `Tour Plan: ${payload.monthYear || 'Month Plan'}`;
          subtitle = `Employee: ${payload.employeeName || 'Field Rep'} • FY: ${payload.fy || '2026-27'}`;
        } else if (r.entityType === 'LEAVE') {
          title = `Leave Request: ${payload.leaveType || 'Leave'} (${payload.numDays || 1} Days)`;
          subtitle = `From: ${payload.fromDate || ''} To: ${payload.toDate || ''} • Reason: ${payload.reason || 'Personal'}`;
        } else if (r.entityType === 'SPONSORSHIP') {
          title = `Sponsorship: ${payload.doctorName || 'Doctor Grant'} (₹${payload.amount || 0})`;
          subtitle = `Event: ${payload.eventDate || ''} • Reason: ${payload.reason || 'Academic Grant'}`;
        }

        return {
          id: r.id,
          type: (r.entityType || 'DR_ADD') as ApprovalCategory,
          requestedBy: r.requestedBy,
          requestedByName: r.requestedByName || r.requestedBy || 'Field Representative',
          requesterRole: payload.requesterRole || 'Medical Representative (MR)',
          requesterHqName: getHqName(payload.hqId || payload.hq_id),
          entityTitle: title,
          entitySubtitle: subtitle,
          financialYear: payload.fy || fyInfo.currentFY,
          createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : 'Recently',
          status: r.status,
          managerRemarks: r.remarks,
          payload,
        };
      });

      setApprovals(formatted);
    } catch (err: unknown) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [hqs, fyInfo.currentFY]);

  useEffect(() => {
    refreshGeo(true);
    loadApprovals();
  }, [refreshGeo, loadApprovals]);

  const categoryItems = approvals.filter((a) => a.type === category || (category === 'DR_ADD' && a.type?.startsWith('DR_')));
  const pendingCount = categoryItems.filter((a) => a.status === 'PENDING').length;
  const approvedCount = categoryItems.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = categoryItems.filter((a) => a.status === 'REJECTED').length;

  const handleApprove = async (id: string, remarks: string) => {
    try {
      await GatewayContainer.getApprovalGateway().processAction(id, 'APPROVED', remarks);
      await loadApprovals();
      setActiveReviewItem(null);
      setAlertMsg('✓ Request approved and activated in live database!');
      setTimeout(() => setAlertMsg(null), 3500);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleReject = async (id: string, remarks: string) => {
    try {
      await GatewayContainer.getApprovalGateway().processAction(id, 'REJECTED', remarks);
      await loadApprovals();
      setActiveReviewItem(null);
      setAlertMsg('❌ Request rejected.');
      setTimeout(() => setAlertMsg(null), 3500);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await GatewayContainer.getApprovalGateway().batchProcessAction(selectedIds, 'APPROVED', 'Batch Approved by Manager');
      await loadApprovals();
      setSelectedIds([]);
      setAlertMsg(`✓ ${selectedIds.length} requests batch approved successfully!`);
      setTimeout(() => setAlertMsg(null), 3500);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {alertMsg && (
        <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700 }}>
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
          gap: '8px',
          alignItems: 'center',
          background: '#ffffff',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <input
          placeholder="Search by Requester, Doctor Name, Speciality, HQ, or Keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: '180px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
        />

        <select
          value={fyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          style={{ flex: '0 0 auto', fontWeight: 700, color: '#059669', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px' }}
        >
          <option value="ALL">All Financial Years</option>
          <option value={fyInfo.currentFY}>🟢 Current FY ({fyInfo.currentFY})</option>
          <option value={fyInfo.nextFY}>🔵 Next FY ({fyInfo.nextFY})</option>
          <option value={fyInfo.previousFY}>🔒 Previous FY ({fyInfo.previousFY})</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px' }}
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
              borderRadius: '6px',
              fontWeight: 700,
              padding: '6px 14px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12.5px',
            }}
          >
            ✅ Approve Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Approvals Table */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          Loading live approval queue from Cloudflare D1...
        </div>
      ) : (
        <ApprovalDataTable
          items={filteredItems}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onOpenDetail={(item) => setActiveReviewItem(item)}
          onQuickApprove={(id) => handleApprove(id, 'Quick Approved')}
          onQuickReject={(id) => handleReject(id, 'Quick Rejected')}
        />
      )}

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
