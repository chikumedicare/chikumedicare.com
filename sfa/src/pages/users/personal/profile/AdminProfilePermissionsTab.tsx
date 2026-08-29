import React from 'react';

export function AdminProfilePermissionsTab() {
  return (
    <div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
        🛡️ System Permissions & Access Matrix
      </h3>
      <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
        Your role confers full executive privileges across the Chiku Medicare SFA platform.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#10b981', fontSize: '18px' }}>✅</span>
            <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>User & HR Governance</strong>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Create SFA users, edit designations, execute transfers, promote field staff and manage lockouts.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#10b981', fontSize: '18px' }}>✅</span>
            <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>Geography & Territory Master</strong>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Configure Zones, States, HQs, Areas, Beats and adjust SFC/DA rate matrices.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#10b981', fontSize: '18px' }}>✅</span>
            <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>Multi-Level Approval Engine</strong>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Approve or reject Doctor additions, Tour Plans, DCR entries, Leave requests and Expenses.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ color: '#10b981', fontSize: '18px' }}>✅</span>
            <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>Live D1 SQL Architecture</strong>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Full real-time binding to live Cloudflare D1 database (44 production tables).
          </p>
        </div>
      </div>
    </div>
  );
}
