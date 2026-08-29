import React, { useState } from 'react';
import { useGeographyStore, type TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area, Beat } from '../../../core/domain/hr/geography.types';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../../store/hr/useAuthSessionStore';
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
    { key: 'Beat', label: 'Beats', icon: '🛣️', badge: beats.length },
  ];

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Compact Row 1: Header Title & Action Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '10px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            Field Geography Master
          </h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            Apex Corporate Head Office (HO), Zones, States, Field HQs, Areas, and Daily Beats
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
          }}
        >
          <span>➕</span>
          <span>{tab === 'HO' ? 'Create Head Office (HO)' : `Add New ${tab}`}</span>
        </button>
      </div>

      {/* Compact Row 2: Unified Tabs on Left & Filters on Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        {/* Sleek Pills Navigation */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
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
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  background: isSelected ? '#0284c7' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span
                  style={{
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
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

        {/* Compact Filters Toolbar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '12.5px',
              width: '180px',
              outline: 'none',
            }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', background: '#fff' }}
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">🟢 Active</option>
            <option value="INACTIVE">🔴 Inactive</option>
          </select>

          {divisions.length > 0 && tab !== 'HO' && (
            <select
              value={activeDivisionId}
              onChange={(e) => setActiveDivisionId(e.target.value)}
              style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', background: '#fff' }}
            >
              <option value="">Divisions: All</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Geography Data Table - Starts immediately near the top */}
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

      {/* Embedded Form Modal */}
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
