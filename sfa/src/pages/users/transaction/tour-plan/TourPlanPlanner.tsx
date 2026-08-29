import React from 'react';
import type { TourPlanDay } from '../../../../core/domain/transaction/tourPlan.types';

interface TourPlanPlannerProps {
  selectedEmployee: any;
  selectedEmpId: string;
  setSelectedEmpId: (id: string) => void;
  selectedMonth: number;
  setSelectedMonth: (m: number) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  currentFY: string;
  monthNames: string[];
  mockEmployees: any[];
  availableAreas: { id: string; name: string }[];
  days: TourPlanDay[];
  quickFillAreaId: string;
  setQuickFillAreaId: (a: string) => void;
  onQuickFill: () => void;
  onEditDay: (idx: number) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onSubmitApproval: () => void;
}

export function TourPlanPlanner({
  selectedEmployee,
  selectedEmpId,
  setSelectedEmpId,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  currentFY,
  monthNames,
  mockEmployees,
  availableAreas,
  days,
  quickFillAreaId,
  setQuickFillAreaId,
  onQuickFill,
  onEditDay,
  onBack,
  onSaveDraft,
  onSubmitApproval,
}: TourPlanPlannerProps) {
  const fieldDaysCount = days.filter((d) => d.workType === 'FIELD_WORK').length;
  const leavesHolidaysCount = days.filter((d) => ['LEAVE', 'HOLIDAY', 'WEEKLY_OFF'].includes(d.workType)).length;

  const getWorkTypeBadge = (w: string) => {
    switch (w) {
      case 'FIELD_WORK': return { bg: '#eff6ff', color: '#1e40af', label: '💼 Field Work' };
      case 'MEETING': return { bg: '#faf5ff', color: '#6b21a8', label: '👥 Meeting' };
      case 'TRANSIT': return { bg: '#fffbeb', color: '#92400e', label: '🚆 Transit' };
      case 'CAMP': return { bg: '#fef3c7', color: '#92400e', label: '🏕️ Camp' };
      case 'LEAVE': return { bg: '#fef2f2', color: '#991b1b', label: '🏖️ Leave' };
      case 'HOLIDAY': return { bg: '#ecfdf5', color: '#065f46', label: '🎉 Holiday' };
      case 'WEEKLY_OFF': return { bg: '#f1f5f9', color: '#475569', label: '🔴 Weekly Off' };
      default: return { bg: '#f8fafc', color: '#334155', label: w };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 14px', fontWeight: 800, fontSize: '13px', color: '#334155', cursor: 'pointer' }}
          >
            ← Back to TP List
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#0f172a' }}>
              Tour Plan Planner: {monthNames[selectedMonth - 1]} {selectedYear}
            </h3>
            <small style={{ color: '#64748b', fontSize: '11.5px' }}>
              Employee: <b>{selectedEmployee.name}</b> ({selectedEmployee.role}) • Base HQ: {selectedEmployee.hqName} • FY {currentFY}
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onSaveDraft}
            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
          >
            💾 Save Draft
          </button>
          <button
            type="button"
            onClick={onSubmitApproval}
            style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)' }}
          >
            🚀 Submit for Approval
          </button>
        </div>
      </div>

      {/* KPI Cards & Quick Fill */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={quickFillAreaId}
            onChange={(e) => setQuickFillAreaId(e.target.value)}
            style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            <option value="">Select Patch to Auto-Fill</option>
            {availableAreas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onQuickFill}
            style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', padding: '7px 12px', borderRadius: '6px', color: '#065f46', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
          >
            ⚡ Auto-Fill
          </button>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            💼
          </div>
          <div>
            <small style={{ fontSize: '11px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>Field Work Days</small>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{fieldDaysCount} Days</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            🏖️
          </div>
          <div>
            <small style={{ fontSize: '11px', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase' }}>Off / Holidays</small>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626' }}>{leavesHolidaysCount} Days</div>
          </div>
        </div>
      </div>

      {/* Schedule Table Matrix */}
      <div className="panel table" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Date & Day</th>
              <th style={{ width: '18%' }}>Work Type</th>
              <th style={{ width: '22%' }}>Target Patch / Area</th>
              <th style={{ width: '15%' }}>Working Mode</th>
              <th style={{ width: '20%' }}>Route Remarks</th>
              <th style={{ width: '10%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, idx) => {
              const badge = getWorkTypeBadge(day.workType);

              return (
                <tr key={day.date} style={{ background: day.workType === 'WEEKLY_OFF' ? '#fafafa' : day.workType === 'HOLIDAY' ? '#f0fdf4' : '#ffffff' }}>
                  <td>
                    <b style={{ color: day.workType === 'WEEKLY_OFF' ? '#dc2626' : '#0f172a', fontSize: '13px' }}>
                      {day.date.split('-')[2]} {day.dayName}
                    </b>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{day.date}</div>
                  </td>
                  <td>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </td>
                  <td>
                    {day.workType === 'FIELD_WORK' ? (
                      <b style={{ color: '#0f172a', fontSize: '13px' }}>
                        {day.workingAreaNames?.[0] || 'Default Area'}
                      </b>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    {day.workType === 'FIELD_WORK' ? (
                      <span style={{ fontSize: '12px', color: day.workWithMode === 'JOINT' ? '#7c3aed' : '#334155', fontWeight: 600 }}>
                        {day.workWithMode === 'JOINT' ? '👥 ' + (day.jointWithNames?.[0] || 'Joint Work') : 'Single'}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {day.remarks || '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onEditDay(idx)}
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
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
