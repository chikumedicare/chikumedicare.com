import React from 'react';
import type { Employee } from '../../../../core/domain/hr/employee.types';
import type { SfaUser } from '../../../../core/domain/hr/user.types';

interface ProfileDetailsAndTerritoryTabsProps {
  activeTab: 'details' | 'territory' | 'security' | 'permissions';
  fullName: string;
  userId: string;
  userMobile: string;
  userEmail: string;
  linkedEmployee: Employee | null;
  empCode: string;
  designation: string;
  joiningDate: string;
  hqName: string;
  divisionName: string;
  currentUser: SfaUser | null;
  reportingTo: string;
}

export function ProfileDetailsAndTerritoryTabs({
  activeTab,
  fullName,
  userId,
  userMobile,
  userEmail,
  linkedEmployee,
  empCode,
  designation,
  joiningDate,
  hqName,
  divisionName,
  currentUser,
  reportingTo,
}: ProfileDetailsAndTerritoryTabsProps) {
  return (
    <>
      {/* TAB 1: Personal & Employment Details */}
      {activeTab === 'details' && (
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
      )}

      {/* TAB 2: Territory & Hierarchy Scope */}
      {activeTab === 'territory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              🗺️ Geography Alignment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Headquarters (HQ)</span>
                <strong style={{ color: '#0f172a' }}>{hqName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Division Assignment</span>
                <strong style={{ color: '#0f172a' }}>{divisionName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Covering HQs Count</span>
                <strong style={{ color: '#0f172a' }}>
                  {currentUser?.coveringHqIds?.length ? `${currentUser.coveringHqIds.length} Permitted HQs` : 'All Geographies (Pan-India)'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Territory Boundary Scope</span>
                <strong style={{ color: '#059669' }}>Enterprise National Authority</strong>
              </div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              🌳 Reporting Chain
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Direct Reporting To</span>
                <strong style={{ color: '#0f172a' }}>{reportingTo}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Approval Chain Level</span>
                <strong style={{ color: '#0f172a' }}>Apex Authority (Final Approval)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Hierarchy Tree Position</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>Level 0 (Root Level)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
