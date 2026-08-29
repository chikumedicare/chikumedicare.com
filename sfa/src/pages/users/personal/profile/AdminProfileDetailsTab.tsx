import React from 'react';
import type { Employee } from '../../../../core/domain/hr/employee.types';

interface AdminProfileDetailsTabProps {
  fullName: string;
  userId: string;
  userMobile: string;
  userEmail: string;
  linkedEmployee?: Employee | null;
  empCode: string;
  designation: string;
  joiningDate: string;
}

export function AdminProfileDetailsTab({
  fullName,
  userId,
  userMobile,
  userEmail,
  linkedEmployee,
  empCode,
  designation,
  joiningDate,
}: AdminProfileDetailsTabProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          📋 Personal Information
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Full Legal Name</span>
            <strong style={{ color: '#0f172a' }}>{fullName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Corporate User ID</span>
            <strong style={{ color: '#0f172a' }}>{userId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Mobile Number</span>
            <strong style={{ color: '#0f172a' }}>{userMobile}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Official Email</span>
            <strong style={{ color: '#0f172a' }}>{userEmail}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Gender</span>
            <strong style={{ color: '#0f172a' }}>{linkedEmployee?.gender || 'Male'}</strong>
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          💼 Corporate Position Details
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Employee Code</span>
            <strong style={{ color: '#0f172a' }}>{empCode}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Official Designation</span>
            <strong style={{ color: '#0f172a' }}>{designation}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Department</span>
            <strong style={{ color: '#0f172a' }}>{linkedEmployee?.department || 'Executive Board & Governance'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Date of Joining</span>
            <strong style={{ color: '#0f172a' }}>{joiningDate}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Account Status</span>
            <span style={{ color: '#059669', fontWeight: 700 }}>🟢 ACTIVE & VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
