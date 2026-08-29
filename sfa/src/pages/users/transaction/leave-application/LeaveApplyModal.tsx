import React, { useState, useEffect } from 'react';
import type { LeaveType, LeaveBalance, LeaveApplicationRecord } from '../../../../core/domain/transaction/leaveApplication.types';

interface LeaveApplyModalProps {
  initialRecord?: LeaveApplicationRecord | null;
  balance: LeaveBalance;
  currentFY: string;
  employees: any[];
  onSave: (data: Partial<LeaveApplicationRecord>) => void;
  onClose: () => void;
}

export function LeaveApplyModal({
  initialRecord,
  balance,
  currentFY,
  employees,
  onSave,
  onClose,
}: LeaveApplyModalProps) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialRecord?.employeeId || employees[0]?.id || 'EMP-01');
  const [leaveType, setLeaveType] = useState<LeaveType>(initialRecord?.leaveType || 'CL');
  const [fromDate, setFromDate] = useState<string>(initialRecord?.fromDate || new Date().toISOString().substring(0, 10));
  const [toDate, setToDate] = useState<string>(initialRecord?.toDate || new Date().toISOString().substring(0, 10));
  const [reason, setReason] = useState<string>(initialRecord?.reason || '');
  const [emergencyContact, setEmergencyContact] = useState<string>(initialRecord?.emergencyContact || '9826012345');

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Calculate total days
  const d1 = new Date(fromDate);
  const d2 = new Date(toDate);
  const diffTime = d2.getTime() - d1.getTime();
  const numDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;

  const getAvailableBalance = (type: LeaveType) => {
    switch (type) {
      case 'CL': return balance.clAvailable;
      case 'SL': return balance.slAvailable;
      case 'PL': return balance.plAvailable;
      case 'LWP': return 999;
    }
  };

  const availableBal = getAvailableBalance(leaveType);
  const isOverBalance = leaveType !== 'LWP' && numDays > availableBal;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numDays <= 0) {
      alert('To Date must be equal to or after From Date.');
      return;
    }
    if (!reason.trim()) {
      alert('Please provide a reason for leave.');
      return;
    }
    if (!emergencyContact.trim()) {
      alert('Please provide an emergency contact number.');
      return;
    }

    onSave({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      employeeRole: selectedEmp.role || 'Field MR',
      hqId: selectedEmp.hqId,
      hqName: selectedEmp.hqName,
      leaveType,
      fromDate,
      toDate,
      totalDays: numDays,
      reason: reason.trim(),
      emergencyContact: emergencyContact.trim(),
      financialYear: currentFY,
      monthYear: fromDate.substring(0, 7),
    });
  };

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
          maxWidth: '560px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              🌴 {initialRecord ? 'Edit Leave Application' : 'Apply for Leave'}
            </h3>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Submit leave request for manager approval • FY {currentFY}
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

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Applicant Employee *
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', fontWeight: 700 }}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role}) - {emp.hqName}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Leave Type *
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '2px solid #0284c7', fontSize: '13.5px', background: '#f0f9ff', fontWeight: 800, color: '#0369a1' }}
            >
              <option value="CL">🌴 Casual Leave (CL) — Available: {balance.clAvailable} Days</option>
              <option value="SL">💊 Sick Leave (SL) — Available: {balance.slAvailable} Days</option>
              <option value="PL">🏖️ Privilege Leave (PL) — Available: {balance.plAvailable} Days</option>
              <option value="LWP">⚠️ Leave Without Pay (LWP)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                From Date *
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                To Date *
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Days Preview & Warnings */}
          <div style={{ background: isOverBalance ? '#fef2f2' : '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: isOverBalance ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ color: '#334155' }}>Total Requested Days:</span>
              <span style={{ color: isOverBalance ? '#dc2626' : '#0284c7', fontSize: '14px', fontWeight: 900 }}>{numDays} Day(s)</span>
            </div>
            {isOverBalance && (
              <small style={{ color: '#dc2626', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                ⚠️ Requested days ({numDays}) exceed available {leaveType} balance ({availableBal}).
              </small>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Reason for Leave *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Attending family function, medical recovery..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Emergency Contact Number *
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13.5px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                cursor: 'pointer',
              }}
            >
              🚀 Submit Leave Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
