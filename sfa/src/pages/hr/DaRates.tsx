import React, { useState } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import type { DaRate, RoleDaSummary } from '../../core/domain/hr/leave.types';
import { DaRateFormModal } from './DaRateFormModal';
import { BulkDaModal } from './BulkDaModal';

export function DaRates({
  daRates,
  onSaveRoleRates,
  onDeleteRoleRates,
  onBulkAdjust,
}: {
  daRates: DaRate[];
  onSaveRoleRates?: (
    role: string,
    hq: number,
    exhq: number,
    outstation: number,
    transit: number,
    effectiveFrom?: string,
    isActive?: boolean,
    existingIds?: { hq?: string; exhq?: string; outstation?: string; transit?: string },
    taPolicy?: {
      fareType?: 'ONE_WAY' | 'TWO_WAY';
      kmRate0_199?: number;
      kmRate200_299?: number;
      travelMode299_599?: string;
      travelMode600Plus?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  onDeleteRoleRates?: (existingIds: string[]) => Promise<{ success: boolean; error?: string }>;
  onBulkAdjust?: (percent: number, fixed: number, targetRole?: string) => Promise<{ success: boolean; error?: string; count?: number }>;
}) {
  // Main Tab: 'DA' (Daily Allowance) vs 'TA' (KM per Rupees / Travel Allowance)
  const [activeTab, setActiveTab] = useState<'DA' | 'TA'>('DA');

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoleSummary, setEditingRoleSummary] = useState<RoleDaSummary | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Group all daRates by role
  const distinctRoles = Array.from(new Set(daRates.map((r) => r.role)));
  const standardRoles = ['MR', 'SR_MR', 'ASM', 'SR_ASM', 'RSM', 'ZSM', 'NSM', 'VP'];
  const allRoles = Array.from(new Set([...standardRoles, ...distinctRoles]));

  // Helper to pick the LATEST active rate for a given role and cityType
  const getLatestTierRate = (roleName: string, cityType: 'HQ' | 'EX_HQ' | 'OUTSTATION' | 'TRANSIT') => {
    const matching = daRates.filter((r) => r.role === roleName && r.cityType === cityType);
    if (matching.length === 0) return undefined;
    const activeRates = matching.filter((r) => r.isActive);
    if (activeRates.length > 0) return activeRates[activeRates.length - 1];
    return matching[matching.length - 1];
  };

  const roleSummaries: RoleDaSummary[] = allRoles.map((role) => {
    const hqRate = getLatestTierRate(role, 'HQ');
    const exhqRate = getLatestTierRate(role, 'EX_HQ');
    const outstationRate = getLatestTierRate(role, 'OUTSTATION');
    const transitRate = getLatestTierRate(role, 'TRANSIT');

    const active = [hqRate, exhqRate, outstationRate, transitRate].some((r) => r?.isActive);
    const effectiveFrom = hqRate?.effectiveFrom || exhqRate?.effectiveFrom || outstationRate?.effectiveFrom || '2024-04-01';

    const fareType = hqRate?.fareType || exhqRate?.fareType || outstationRate?.fareType || 'TWO_WAY';
    const kmRate0_199 = hqRate?.kmRate0_199 || exhqRate?.kmRate0_199 || outstationRate?.kmRate0_199 || 3.5;
    const kmRate200_299 = hqRate?.kmRate200_299 || exhqRate?.kmRate200_299 || outstationRate?.kmRate200_299 || 4.5;
    const travelMode299_599 = hqRate?.travelMode299_599 || exhqRate?.travelMode299_599 || outstationRate?.travelMode299_599 || 'required sleeper tickit';
    const travelMode600Plus = hqRate?.travelMode600Plus || exhqRate?.travelMode600Plus || outstationRate?.travelMode600Plus || 'required 3rd ac tickit';

    return {
      role,
      hq: hqRate?.amount || 0,
      exhq: exhqRate?.amount || 0,
      outstation: outstationRate?.amount || 0,
      transit: transitRate?.amount || 0,
      effectiveFrom,
      active: active || false,
      fareType,
      kmRate0_199,
      kmRate200_299,
      travelMode299_599,
      travelMode600Plus,
      ids: {
        hq: hqRate?.id,
        exhq: exhqRate?.id,
        outstation: outstationRate?.id,
        transit: transitRate?.id,
      },
    };
  });

  const filteredSummaries = roleSummaries.filter((r) => {
    if (statusFilter === 'ACTIVE' && !r.active) return false;
    if (statusFilter === 'INACTIVE' && r.active) return false;
    if (q.trim()) {
      if (!r.role.toLowerCase().includes(q.toLowerCase().trim())) return false;
    }
    return true;
  });

  // Summary KPI Calculations
  const activeSlabsCount = daRates.filter((r) => r.isActive).length;
  const avgHq = roleSummaries.length > 0 ? Math.round(roleSummaries.reduce((sum, r) => sum + r.hq, 0) / roleSummaries.length) : 0;
  const avgOutstation = roleSummaries.length > 0 ? Math.round(roleSummaries.reduce((sum, r) => sum + r.outstation, 0) / roleSummaries.length) : 0;
  const avgKmRate = roleSummaries.length > 0 ? (roleSummaries.reduce((sum, r) => sum + (r.kmRate0_199 || 3.5), 0) / roleSummaries.length).toFixed(2) : '3.50';

  const handleDelete = async (r: RoleDaSummary) => {
    const allRoleRateIds = daRates.filter((d) => d.role === r.role).map((d) => d.id);
    if (allRoleRateIds.length === 0) return;
    if (window.confirm(`Are you sure you want to reset and clear all DA/TA rate slabs for ${r.role}?`)) {
      if (onDeleteRoleRates) {
        await onDeleteRoleRates(allRoleRateIds);
      }
    }
  };

  const activeRolesWithSlabs = roleSummaries.filter((r) => r.active).map((r) => r.role);

  return (
    <>
      <Head
        title="DA & KM Rates Master (Allowance & Fare Policy)"
        sub="Configure separate Daily Allowance (DA Rates) & Travel Allowance (KM per Rupees) policies."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="secondary"
              onClick={() => setShowBulkModal(true)}
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              ⚡ Bulk Rate Adjustment
            </button>
            <button
              className="primary"
              onClick={() => setShowAddModal(true)}
              style={{ borderRadius: '8px', fontWeight: 600 }}
            >
              + ADD Role Policy Slab
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid4" style={{ marginBottom: '16px' }}>
        <div className="panel kpi">
          <b>{roleSummaries.length} Roles Defined</b>
          <small>{activeSlabsCount} Active Database Slabs</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#0284c7' }}>₹{avgHq} / Day</b>
          <small>Average Local HQ Daily Allowance</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#d97706' }}>₹{avgOutstation} / Day</b>
          <small>Average Outstation Daily Allowance</small>
        </div>
        <div className="panel kpi">
          <b style={{ color: '#16a34a' }}>₹{avgKmRate} / KM</b>
          <small>Average Base Travel Fare (0-199 KM)</small>
        </div>
      </div>

      {/* Main Tab Navigation Bar: SEPARATED DA RATE vs KM PER RUPEES */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('DA')}
          style={{
            padding: '10px 18px', borderRadius: '8px 8px 0 0', border: 'none', background: 'transparent',
            fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            borderBottom: activeTab === 'DA' ? '3px solid #0284c7' : '3px solid transparent',
            color: activeTab === 'DA' ? '#0284c7' : '#64748b'
          }}
        >
          💰 Daily Allowance (DA Rates)
        </button>
        <button
          onClick={() => setActiveTab('TA')}
          style={{
            padding: '10px 18px', borderRadius: '8px 8px 0 0', border: 'none', background: 'transparent',
            fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            borderBottom: activeTab === 'TA' ? '3px solid #7c3aed' : '3px solid transparent',
            color: activeTab === 'TA' ? '#7c3aed' : '#64748b'
          }}
        >
          🚗 KM per Rupees (Travel Allowance & Fare Policy)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          placeholder="Filter by Designation Role (e.g. MR, ASM)..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 240px' }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Policy Slabs</option>
          <option value="INACTIVE">Inactive Slabs</option>
        </select>
      </div>

      {/* Tab 1: Daily Allowance (DA Rates) */}
      {activeTab === 'DA' && (
        <div className="panel table">
          <table>
            <thead>
              <tr>
                <th>Designation Role</th>
                <th>Local HQ DA (₹/Day)</th>
                <th>EX-HQ DA (₹/Day)</th>
                <th>Outstation DA (₹/Day)</th>
                <th>Transit DA (₹/Day)</th>
                <th>Effective From</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummaries.map((r) => (
                <tr key={r.role}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{r.role}</b>
                  </td>
                  <td><b style={{ color: '#0284c7' }}>₹ {r.hq}</b></td>
                  <td><b style={{ color: '#0284c7' }}>₹ {r.exhq}</b></td>
                  <td><b style={{ color: '#d97706' }}>₹ {r.outstation}</b></td>
                  <td><b style={{ color: '#64748b' }}>₹ {r.transit}</b></td>
                  <td><b>{r.effectiveFrom}</b></td>
                  <td><Badge v={r.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="link" onClick={() => setEditingRoleSummary(r)} style={{ fontWeight: 600 }}>Edit DA Rates</button>
                      <button type="button" className="link" onClick={() => handleDelete(r)} style={{ color: '#ef4444' }}>Reset</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: KM per Rupees (Travel Allowance & Fare Policy) */}
      {activeTab === 'TA' && (
        <div className="panel table">
          <table>
            <thead>
              <tr>
                <th>Designation Role</th>
                <th>Fare Mode</th>
                <th>0 - 199 KM Rate (₹/KM)</th>
                <th>200 - 299 KM Rate (₹/KM)</th>
                <th>299 - 599 KM Policy</th>
                <th>600+ KM Policy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSummaries.map((r) => (
                <tr key={r.role}>
                  <td>
                    <b style={{ color: '#0f172a', fontSize: '15px' }}>{r.role}</b>
                  </td>
                  <td>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                      {r.fareType || 'TWO_WAY'}
                    </span>
                  </td>
                  <td><b style={{ color: '#7c3aed', fontSize: '15px' }}>₹ {r.kmRate0_199 || 3.5} / KM</b></td>
                  <td><b style={{ color: '#7c3aed', fontSize: '15px' }}>₹ {r.kmRate200_299 || 4.5} / KM</b></td>
                  <td><small style={{ color: '#475569', fontWeight: 600 }}>{r.travelMode299_599 || 'sleeper ticket'}</small></td>
                  <td><small style={{ color: '#475569', fontWeight: 600 }}>{r.travelMode600Plus || '3rd AC ticket'}</small></td>
                  <td><Badge v={r.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                  <td>
                    <button
                      type="button"
                      className="link"
                      onClick={() => setEditingRoleSummary(r)}
                      style={{ fontWeight: 600, color: '#7c3aed' }}
                    >
                      Edit KM Policy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {(showAddModal || editingRoleSummary) && (
        <DaRateFormModal
          roleSummary={editingRoleSummary}
          onSave={async (role, hq, exhq, outstation, transit, effectiveFrom, isActive, existingIds, taPolicy) => {
            if (onSaveRoleRates) {
              const res = await onSaveRoleRates(role, hq, exhq, outstation, transit, effectiveFrom, isActive, existingIds, taPolicy);
              if (res.success) {
                setShowAddModal(false);
                setEditingRoleSummary(null);
              }
              return res;
            }
            return { success: false, error: 'Save handler missing' };
          }}
          onClose={() => {
            setShowAddModal(false);
            setEditingRoleSummary(null);
          }}
        />
      )}

      {showBulkModal && (
        <BulkDaModal
          roleSummaries={roleSummaries}
          onBulkAdjust={async (pct: number, fix: number, role?: string) => {
            if (onBulkAdjust) {
              const res = await onBulkAdjust(pct, fix, role);
              if (res.success) setShowBulkModal(false);
              return res;
            }
            return { success: false, error: 'Bulk adjust handler missing' };
          }}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </>
  );
}
