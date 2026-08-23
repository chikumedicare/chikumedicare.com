import React from 'react';
import { Badge } from '../../components/Badge';
import type { LeaveApplication } from '../../domain/hr/leave.types';
import type { SfaUser } from '../../domain/hr/user.types';

export function LeaveApplicationsTable({
  applications = [],
  users = [],
  loading = false,
  onApprove,
  onReject,
}: {
  applications: LeaveApplication[];
  users?: SfaUser[];
  loading?: boolean;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
}) {
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading leave applications from D1...</div>;
  }

  const getApplicantName = (app: LeaveApplication) => {
    if (app.employeeName) return app.employeeName;
    const user = users.find((u) => u.id === app.employeeId);
    return user ? user.fullName : app.employeeId;
  };

  const getApplicantRole = (app: LeaveApplication) => {
    const user = users.find((u) => u.id === app.employeeId);
    return user?.role || 'MR';
  };

  const getApproverName = (app: LeaveApplication) => {
    if ((app as any).approvedByName) return (app as any).approvedByName;
    if (!app.approvedBy) return null;
    const user = users.find((u) => u.id === app.approvedBy || u.userId === app.approvedBy);
    return user ? user.fullName : app.approvedBy;
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Application Date</th>
          <th>Employee & Role</th>
          <th>Leave Type</th>
          <th>Date Range</th>
          <th>Duration</th>
          <th>Reason & Emergency Contact</th>
          <th>Status & Approver</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => {
          const approverName = getApproverName(app);

          return (
            <tr key={app.id}>
              <td>
                <b>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}</b>
                <small style={{ color: '#64748b', display: 'block' }}>
                  {app.createdAt ? new Date(app.createdAt).toLocaleTimeString() : ''}
                </small>
              </td>
              <td>
                <b>{getApplicantName(app)}</b>
                <small style={{ display: 'block', color: '#64748b' }}>
                  <Badge v={getApplicantRole(app)} />
                </small>
              </td>
              <td>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background:
                      app.leaveType === 'CL'
                        ? '#e0f2fe'
                        : app.leaveType === 'SL'
                        ? '#fee2e2'
                        : '#fef3c7',
                    color:
                      app.leaveType === 'CL'
                        ? '#0284c7'
                        : app.leaveType === 'SL'
                        ? '#dc2626'
                        : '#d97706',
                  }}
                >
                  {app.leaveType} (
                  {app.leaveType === 'CL'
                    ? 'Casual'
                    : app.leaveType === 'SL'
                    ? 'Sick'
                    : 'Privilege'}
                  )
                </span>
              </td>
              <td>
                <b>{app.fromDate}</b> to <b>{app.toDate}</b>
              </td>
              <td>
                <b>{app.numDays} Days</b>
              </td>
              <td>
                <div style={{ maxWidth: '240px' }}>
                  <b style={{ color: '#0f172a' }}>{app.reason || 'No reason provided'}</b>
                  {app.emergencyContact && (
                    <small style={{ color: '#64748b', display: 'block', marginTop: '2px' }}>
                      📞 Contact: {app.emergencyContact}
                    </small>
                  )}
                </div>
              </td>
              <td>
                <Badge
                  v={
                    app.status === 'APPROVED'
                      ? 'ACTIVE'
                      : app.status === 'REJECTED'
                      ? 'INACTIVE'
                      : 'PENDING'
                  }
                />
                {app.status !== 'PENDING' && (
                  <small style={{ display: 'block', color: '#64748b', marginTop: '4px', fontSize: '11px' }}>
                    {app.status === 'APPROVED' ? '✅ Approved by: ' : '❌ Rejected by: '}
                    <b style={{ color: '#0f172a' }}>{approverName || 'Management / Admin'}</b>
                    {app.approvedAt && (
                      <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8' }}>
                        {new Date(app.approvedAt).toLocaleDateString()}
                      </span>
                    )}
                  </small>
                )}
              </td>
              <td>
                {app.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="primary"
                      onClick={() => onApprove?.(app.id)}
                      style={{ padding: '4px 8px', fontSize: '11px', background: '#16a34a', borderColor: '#16a34a' }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => onReject?.(app.id)}
                      style={{ padding: '4px 8px', fontSize: '11px', color: '#dc2626', borderColor: '#fca5a5' }}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <small style={{ color: '#64748b', fontWeight: 500 }}>
                    {app.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </small>
                )}
              </td>
            </tr>
          );
        })}
        {applications.length === 0 && (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              No leave applications found for this period.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
