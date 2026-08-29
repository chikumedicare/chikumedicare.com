import React, { useState } from 'react';
import type { ApprovalItem } from '../../core/domain/approvals/approvalEngine.types';

interface ApprovalActionModalProps {
  item: ApprovalItem;
  onApprove: (id: string, remarks: string) => void;
  onReject: (id: string, remarks: string) => void;
  onClose: () => void;
}

export function ApprovalActionModal({
  item,
  onApprove,
  onReject,
  onClose,
}: ApprovalActionModalProps) {
  const [remarks, setRemarks] = useState<string>('');

  const isPending = item.status === 'PENDING';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              🔍 Review Request: {item.entityTitle}
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Category: <b>{item.type.replace('_', ' ')}</b> • Submitted by {item.requestedByName} ({item.requesterRole})
            </small>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, fontSize: '12px', color: '#475569', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Payload / Details Box */}
        <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: '#334155' }}>
            📍 Base HQ: <b>{item.requesterHqName || 'Bhopal'}</b> • Financial Year: <b>FY {item.financialYear}</b>
          </div>
          <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 700 }}>
            {item.entitySubtitle}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            📅 Submitted At: {item.createdAt}
          </div>

          {/* If edit: old vs new diff */}
          {item.oldData && (
            <div style={{ marginTop: '8px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
              <b style={{ color: '#dc2626' }}>Previous Values:</b> {JSON.stringify(item.oldData)}
            </div>
          )}
        </div>

        {/* Remarks Section */}
        {isPending ? (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Manager Review Remarks / Justification
            </label>
            <textarea
              rows={2}
              placeholder="Enter approval or rejection remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>
        ) : (
          <div style={{ background: item.status === 'APPROVED' ? '#ecfdf5' : '#fef2f2', padding: '12px', borderRadius: '8px', border: item.status === 'APPROVED' ? '1px solid #a7f3d0' : '1px solid #fecaca' }}>
            <b style={{ color: item.status === 'APPROVED' ? '#065f46' : '#991b1b', fontSize: '13px' }}>
              Status: {item.status} by {item.reviewedBy || 'Manager'}
            </b>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Remarks: {item.managerRemarks || 'No remarks provided.'}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Close
          </button>
          {isPending && (
            <>
              <button
                type="button"
                onClick={() => onReject(item.id, remarks || 'Rejected by Manager')}
                style={{ flex: 1.2, padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                ❌ Reject Request
              </button>
              <button
                type="button"
                onClick={() => onApprove(item.id, remarks || 'Approved by Manager')}
                style={{ flex: 1.5, padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 800, fontSize: '13px', cursor: 'pointer', boxShadow: '0 3px 10px rgba(5, 150, 105, 0.3)' }}
              >
                ✅ Approve Request
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
