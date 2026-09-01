import React from 'react';

interface DaRatesToolbarProps {
  activeTab: 'DA' | 'TA';
  setActiveTab: (tab: 'DA' | 'TA') => void;
  q: string;
  setQ: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export function DaRatesToolbar({
  activeTab,
  setActiveTab,
  q,
  setQ,
  statusFilter,
  setStatusFilter,
}: DaRatesToolbarProps) {
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
      {/* Tab Switcher Pills */}
      <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('DA')}
          style={{
            padding: '4px 12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'DA' ? '#ffffff' : 'transparent',
            color: activeTab === 'DA' ? '#0284c7' : '#64748b',
            boxShadow: activeTab === 'DA' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          💰 Daily Allowance (DA Rates)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TA')}
          style={{
            padding: '4px 12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            background: activeTab === 'TA' ? '#ffffff' : 'transparent',
            color: activeTab === 'TA' ? '#7c3aed' : '#64748b',
            boxShadow: activeTab === 'TA' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          🚗 KM per Rupees (TA Policy)
        </button>
      </div>

      {/* Search Input */}
      <input
        placeholder="Filter by Designation Role (e.g. MR, ASM, RSM)..."
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

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          fontSize: '12.5px',
          fontWeight: 600,
          background: '#ffffff',
        }}
      >
        <option value="ALL">All Status</option>
        <option value="ACTIVE">Active Policy Slabs</option>
        <option value="INACTIVE">Inactive Slabs</option>
      </select>
    </div>
  );
}
