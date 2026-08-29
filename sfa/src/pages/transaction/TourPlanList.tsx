import React from 'react';
import type { TourPlan } from '../../core/domain/transaction/tourPlan.types';
import { getFinancialYearInfo } from '../../components/FestivalDatePicker';

interface TourPlanListProps {
  plans: TourPlan[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fyFilter: string;
  setFyFilter: (fy: string) => void;
  monthFilter: string;
  setMonthFilter: (m: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  monthNames: string[];
  onAddNew: () => void;
  onEdit: (plan: TourPlan) => void;
  onDelete: (id: string) => void;
}

export function TourPlanList({
  plans,
  searchQuery,
  setSearchQuery,
  fyFilter,
  setFyFilter,
  monthFilter,
  setMonthFilter,
  statusFilter,
  setStatusFilter,
  monthNames,
  onAddNew,
  onEdit,
  onDelete,
}: TourPlanListProps) {
  const fyInfo = getFinancialYearInfo();

  return (
    <>
      {/* Top Filter & Action Toolbar */}
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
          placeholder="Search by Employee Name, HQ, Month (YYYY-MM), or FY..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: '200px' }}
        />

        {/* Financial Year Filter */}
        <select
          value={fyFilter}
          onChange={(e) => setFyFilter(e.target.value)}
          style={{
            flex: '0 0 auto',
            fontWeight: 800,
            color: '#059669',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
          }}
        >
          <option value="ALL">All Financial Years</option>
          <option value={fyInfo.currentFY}>🟢 Current FY ({fyInfo.currentFY})</option>
          <option value={fyInfo.nextFY}>🔵 Next FY ({fyInfo.nextFY})</option>
          <option value={fyInfo.previousFY}>🔒 Previous FY ({fyInfo.previousFY})</option>
        </select>

        {/* Month Filter */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{ flex: '0 0 auto', background: '#ffffff', border: '1px solid #cbd5e1' }}
        >
          <option value="ALL">All Months</option>
          {monthNames.map((m, idx) => {
            const mm = String(idx + 1).padStart(2, '0');
            return (
              <option key={mm} value={mm}>
                {m}
              </option>
            );
          })}
        </select>

        {/* Status Filter */}
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

        {/* Add Button */}
        <button
          type="button"
          className="primary"
          onClick={onAddNew}
          style={{
            marginLeft: 'auto',
            borderRadius: '10px',
            fontWeight: 700,
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>➕</span> Add New Tour Plan
        </button>
      </div>

      {/* Directory Table */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table>
          <thead>
            <tr>
              <th>Employee & Role</th>
              <th>HQ Territory</th>
              <th>Month & Year</th>
              <th>Financial Year</th>
              <th>Status</th>
              <th>Submitted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const [y, m] = plan.monthYear.split('-');
              const monthName = monthNames[parseInt(m, 10) - 1] || plan.monthYear;

              return (
                <tr key={plan.id}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '14px' }}>{plan.employeeName}</b>
                    <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                      {plan.employeeRole} • {plan.id}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                      📍 {plan.hqName}
                    </span>
                  </td>

                  <td>
                    <b style={{ color: '#0284c7', fontSize: '13.5px' }}>
                      🗓️ {monthName} {y}
                    </b>
                  </td>

                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      FY {plan.financialYear}
                    </span>
                  </td>

                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        background:
                          plan.status === 'APPROVED'
                            ? '#ecfdf5'
                            : plan.status === 'PENDING_APPROVAL'
                            ? '#eff6ff'
                            : plan.status === 'REJECTED'
                            ? '#fef2f2'
                            : '#fef3c7',
                        color:
                          plan.status === 'APPROVED'
                            ? '#059669'
                            : plan.status === 'PENDING_APPROVAL'
                            ? '#2563eb'
                            : plan.status === 'REJECTED'
                            ? '#dc2626'
                            : '#d97706',
                        border: '1px solid rgba(0,0,0,0.08)',
                      }}
                    >
                      ● {plan.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {plan.submittedAt || 'Draft (Not Submitted)'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => onEdit(plan)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#0f172a',
                        }}
                      >
                        ✏️ Edit / Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(plan.id)}
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#991b1b',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {plans.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No Tour Plans found matching your filter criteria. Click <strong>"➕ Add New Tour Plan"</strong> to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
