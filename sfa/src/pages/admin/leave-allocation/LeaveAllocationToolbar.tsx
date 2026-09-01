import React from 'react';

interface LeaveAllocationToolbarProps {
  selectedFY: string;
  setSelectedFY: (fy: string) => void;
  activeTab: 'BALANCES' | 'APPLICATIONS';
  setActiveTab: (tab: 'BALANCES' | 'APPLICATIONS') => void;
  balancesCount: number;
  applicationsCount: number;
  q: string;
  setQ: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

export function LeaveAllocationToolbar({
  selectedFY,
  setSelectedFY,
  activeTab,
  setActiveTab,
  balancesCount,
  applicationsCount,
  q,
  setQ,
  roleFilter,
  setRoleFilter,
}: LeaveAllocationToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 12px',
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* FY Selector */}
      <select
        value={selectedFY}
        onChange={(e) => setSelectedFY(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
          fontWeight: 700,
          background: '#f8fafc',
          color: '#0f172a',
        }}
      >
        <option value="2026-27">FY 2026-27 (Active)</option>
        <option value="2027-28">FY 2027-28 (Upcoming)</option>
        <option value="2025-26">FY 2025-26 (Past)</option>
      </select>

      {/* Tab Switcher Pills */}
      <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('BALANCES')}
          style={{
            padding: '4px 10px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'BALANCES' ? '#ffffff' : 'transparent',
            color: activeTab === 'BALANCES' ? '#0284c7' : '#64748b',
            boxShadow: activeTab === 'BALANCES' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          🏖️ Entitlements ({balancesCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('APPLICATIONS')}
          style={{
            padding: '4px 10px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'APPLICATIONS' ? '#ffffff' : 'transparent',
            color: activeTab === 'APPLICATIONS' ? '#0284c7' : '#64748b',
            boxShadow: activeTab === 'APPLICATIONS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          📝 Applications ({applicationsCount})
        </button>
      </div>

      {/* Search Input */}
      {activeTab === 'BALANCES' && (
        <>
          <input
            placeholder="Search representative name, code, role..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              flex: '1 1 200px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
            }}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              fontWeight: 600,
              background: '#ffffff',
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="MR">MR</option>
            <option value="ASM">ASM</option>
            <option value="RSM">RSM</option>
            <option value="ZSM">ZSM</option>
            <option value="NSM">NSM</option>
            <option value="VP">VP</option>
          </select>
        </>
      )}
    </div>
  );
}
