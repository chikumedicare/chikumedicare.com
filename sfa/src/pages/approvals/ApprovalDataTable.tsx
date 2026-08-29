import React from 'react';
import type { ApprovalItem } from '../../core/domain/approvals/approvalEngine.types';

interface ApprovalDataTableProps {
  items: ApprovalItem[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenDetail: (item: ApprovalItem) => void;
  onQuickApprove: (id: string) => void;
  onQuickReject: (id: string) => void;
}

export function ApprovalDataTable({
  items,
  selectedIds,
  setSelectedIds,
  onOpenDetail,
  onQuickApprove,
  onQuickReject,
}: ApprovalDataTableProps) {
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) setSelectedIds([]);
    else setSelectedIds(items.map((i) => i.id));
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table>
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={items.length > 0 && selectedIds.length === items.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Requester / Employee</th>
            <th>Request Entity / Subject</th>
            <th>Base HQ & FY</th>
            <th>Submitted On</th>
            <th>Approval Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                />
              </td>
              <td>
                <b style={{ color: '#0f172a', fontSize: '14px' }}>{item.requestedByName}</b>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>{item.requesterRole || 'Field MR'}</div>
              </td>
              <td>
                <b style={{ color: '#0284c7', fontSize: '13.5px' }}>{item.entityTitle}</b>
                <div style={{ fontSize: '11.5px', color: '#475569' }}>{item.entitySubtitle}</div>
              </td>
              <td>
                <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                  📍 {item.requesterHqName || 'Bhopal'}
                </span>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                    FY {item.financialYear}
                  </span>
                </div>
              </td>
              <td>
                <span style={{ fontSize: '12px', color: '#64748b' }}>📅 {item.createdAt}</span>
              </td>
              <td>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    background:
                      item.status === 'APPROVED' ? '#ecfdf5' : item.status === 'PENDING' ? '#fffbeb' : '#fef2f2',
                    color:
                      item.status === 'APPROVED' ? '#059669' : item.status === 'PENDING' ? '#d97706' : '#dc2626',
                  }}
                >
                  ● {item.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(item)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                  >
                    👁️ Review
                  </button>
                  {item.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onQuickApprove(item.id)}
                        style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#059669', fontWeight: 800 }}
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickReject(item.id)}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#dc2626', fontWeight: 800 }}
                        title="Reject"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                No approval records found for this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
