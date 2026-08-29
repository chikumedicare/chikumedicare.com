import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import { useGeographyStore, type TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area, Beat } from '../../../core/domain/hr/geography.types';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../../store/hr/useAuthSessionStore';
import { GeographyStatsBar } from './GeographyStatsBar';
import { GeographyTable, type TerritoryItem } from './GeographyTable';
import { GeographyFormModal } from './GeographyFormModal';

interface GeographyMasterProps {
  onAddTerritory?: (type: TerritoryType) => void;
  onEditTerritory?: (type: TerritoryType, item: TerritoryItem) => void;
}

export function GeographyMaster({ onAddTerritory, onEditTerritory }: GeographyMasterProps) {
  const [tab, setTab] = useState<TerritoryType>('HO');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [parentFilter, setParentFilter] = useState('ALL');

  // Internal modal state for seamless 1-click Add/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TerritoryType>('HO');
  const [editingItem, setEditingItem] = useState<TerritoryItem | null>(null);

  const { role, divisionId: sessionDivisionId } = useAuthSessionStore();
  const { divisions } = useHeadOfficeStore();
  const isAdminOrOwner = role === 'ADMIN' || role === 'OWNER';

  const [activeDivisionId, setActiveDivisionId] = useState(
    isAdminOrOwner ? '' : (sessionDivisionId || '')
  );

  const {
    zones,
    states,
    hqs,
    headOffices,
    fieldHqs,
    areas,
    beats,
    getZoneName,
    getStateName,
    getHqName,
    addOrUpdateTerritory,
    toggleTerritoryStatus,
  } = useGeographyStore();

  const map: Record<TerritoryType, TerritoryItem[]> = {
    HO: headOffices,
    Zone: zones,
    State: states,
    HQ: fieldHqs,
    Area: areas,
    Beat: beats,
  };

  const rawList = map[tab] || [];

  const filtered = rawList.filter((item) => {
    // Division filter
    if (activeDivisionId && item.divisionId && item.divisionId !== activeDivisionId) {
      return false;
    }
    // Search query
    const code = item.code || '';
    const name = item.name || '';
    const matchesQ =
      !q ||
      code.toLowerCase().includes(q.toLowerCase()) ||
      name.toLowerCase().includes(q.toLowerCase());
    if (!matchesQ) return false;

    // Status filter
    if (status === 'ACTIVE' && !item.isActive) return false;
    if (status === 'INACTIVE' && item.isActive) return false;

    // Parent filter
    if (parentFilter !== 'ALL') {
      if (tab === 'State' && (item as State).zoneId !== parentFilter) return false;
      if (tab === 'HQ' && (item as Headquarter).stateId !== parentFilter) return false;
      if (tab === 'Area' && (item as Area).hqId !== parentFilter) return false;
      if (tab === 'Beat' && (item as Beat).areaId !== parentFilter) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    if (onAddTerritory) {
      onAddTerritory(tab);
    } else {
      setEditingItem(null);
      setModalType(tab);
      setModalOpen(true);
    }
  };

  const handleOpenEdit = (item: TerritoryItem) => {
    if (onEditTerritory) {
      onEditTerritory(tab, item);
    } else {
      setEditingItem(item);
      setModalType(tab);
      setModalOpen(true);
    }
  };

  const tabs: Array<{ key: TerritoryType; label: string; icon: string; badge: number }> = [
    { key: 'HO', label: 'Head Office (HO)', icon: '🏢', badge: headOffices.length },
    { key: 'Zone', label: 'Zones', icon: '🌐', badge: zones.length },
    { key: 'State', label: 'States', icon: '🗺️', badge: states.length },
    { key: 'HQ', label: 'Field HQs', icon: '📍', badge: fieldHqs.length },
    { key: 'Area', label: 'Areas', icon: '🏙️', badge: areas.length },
    { key: 'Beat', label: 'Beats / Routes', icon: '🛣️', badge: beats.length },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      <Head
        title="Field Geography Master"
        sub="Manage complete organizational hierarchy: Corporate Head Office (HO), Zones, States, Field HQs, Areas, and Daily Beats."
      />

      {/* KPI Stats Bar */}
      <GeographyStatsBar
        currentTab={tab}
        onTabChange={(t) => { setTab(t); setParentFilter('ALL'); }}
        counts={{
          ho: headOffices.length,
          zone: zones.length,
          state: states.length,
          hq: fieldHqs.length,
          area: areas.length,
          beat: beats.length,
        }}
      />

      {/* Modern Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', overflowX: 'auto' }}>
        {tabs.map((t) => {
          const isSelected = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setParentFilter('ALL'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                background: isSelected ? '#0284c7' : 'transparent',
                color: isSelected ? '#ffffff' : '#64748b',
                fontWeight: isSelected ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isSelected ? '#ffffff' : '#475569',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {t.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modern Search & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            placeholder={`Search ${tab} by code or name...`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: '9px 14px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              minWidth: '240px',
              outline: 'none',
            }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">🟢 Active Only</option>
            <option value="INACTIVE">🔴 Inactive Only</option>
          </select>

          {divisions.length > 0 && (
            <select
              value={activeDivisionId}
              onChange={(e) => setActiveDivisionId(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
            >
              <option value="">Division: All</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
          }}
        >
          <span>➕</span>
          <span>{tab === 'HO' ? 'Create Head Office (HO)' : `Add New ${tab}`}</span>
        </button>
      </div>

      {/* Geography Data Table */}
      <GeographyTable
        tab={tab}
        items={filtered}
        getZoneName={getZoneName}
        getStateName={getStateName}
        getHqName={getHqName}
        onEdit={handleOpenEdit}
        onToggleStatus={(item) => toggleTerritoryStatus(tab, item)}
        onAdd={handleOpenAdd}
      />

      {/* Embedded Form Modal for 100% Reliable Add/Edit */}
      {modalOpen && (
        <GeographyFormModal
          type={modalType}
          item={editingItem}
          zones={zones}
          states={states}
          hqs={hqs}
          areas={areas}
          onSave={async (draft) => {
            const res = await addOrUpdateTerritory(modalType, draft);
            if (res.success) {
              setModalOpen(false);
            }
            return res;
          }}
          back={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
