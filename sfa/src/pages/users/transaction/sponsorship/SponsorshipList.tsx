import React from 'react';
import type { SponsorshipRecord } from '../../../../core/domain/transaction/sponsorship.types';
import { getFinancialYearInfo } from '../../../../components/FestivalDatePicker';

interface SponsorshipListProps {
  records: SponsorshipRecord[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fyFilter: string;
  setFyFilter: (fy: string) => void;
  typeFilter: string;
  setTypeFilter: (t: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onAddNew: () => void;
  onEdit: (rec: SponsorshipRecord) => void;
  onDelete: (id: string) => void;
}

export function SponsorshipList({
  records,
  searchQuery,
  setSearchQuery,
  fyFilter,
  setFyFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  onAddNew,
  onEdit,
  onDelete,
}: SponsorshipListProps) {
  const fyInfo = getFinancialYearInfo();

  const totalCount = records.length;
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  const approvedCount = records.filter((r) => r.status === 'APPROVED').length;

  return (
    <>
      {/* Top Filter Toolbar */}
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
          placeholder="Search by Doctor Name, Degree, HQ, Category, or FY..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Sponsorship Types</option>
          <option value="Financial Support">Financial Support</option>
          <option value="Product Scheme">Product Scheme</option>
          <option value="Educational Support">Educational Support</option>
          <option value="Travel Support">Travel Support</option>
          <option value="Accommodation Support">Accommodation Support</option>
          <option value="Registration Support">Registration Support</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="DRAFT">Draft</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <button
          type="button"
          className="primary"
          onClick={onAddNew}
          style={{
            marginLeft: 'auto',
            borderRadius: '10px',
            fontWeight: 700,
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>➕</span> Add / Request Sponsorship
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🤝
          </div>
          <div>
            <small style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>Total Requests</small>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>{totalCount} Sponsorships</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            💰
          </div>
          <div>
            <small style={{ fontSize: '11.5px', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase' }}>Total Support Value</small>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#dc2626' }}>₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            ✅
          </div>
          <div>
            <small style={{ fontSize: '11.5px', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>Approved Requests</small>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{approvedCount} / {totalCount} Approved</div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table>
          <thead>
            <tr>
              <th>Doctor Name & Reg No</th>
              <th>Sponsorship Category</th>
              <th>HQ Territory</th>
              <th>Date & FY</th>
              <th>Support Value (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>
                  <b style={{ color: '#0f172a', fontSize: '14px' }}>{item.doctorName}</b>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {item.doctorDegree || 'MBBS'} • Reg: {item.doctorRegNo || 'N/A'}
                  </div>
                </td>
                <td>
                  <b style={{ color: '#0284c7', fontSize: '13.5px' }}>{item.sponsorshipType}</b>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {item.programName || item.remark}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                    📍 {item.hqName || 'Bhopal'}
                  </span>
                </td>
                <td>
                  <b style={{ color: '#0f172a', fontSize: '13px' }}>📅 {item.sponsorshipDate}</b>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                      FY {item.financialYear}
                    </span>
                  </div>
                </td>
                <td>
                  <b style={{ color: '#dc2626', fontSize: '14px' }}>
                    ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </b>
                </td>
                <td>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      background:
                        item.status === 'APPROVED' ? '#ecfdf5' : item.status === 'PENDING_APPROVAL' ? '#eff6ff' : item.status === 'DRAFT' ? '#f1f5f9' : '#fef2f2',
                      color:
                        item.status === 'APPROVED' ? '#059669' : item.status === 'PENDING_APPROVAL' ? '#2563eb' : item.status === 'DRAFT' ? '#475569' : '#dc2626',
                    }}
                  >
                    ● {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#991b1b' }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No Sponsorship requests found. Click <strong>"➕ Add / Request Sponsorship"</strong> to create a new entry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
