import React, { useState } from 'react';
import { useGeographyStore, type TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area, Beat } from '../../../core/domain/hr/geography.types';
import type { HeadOfficeRecord } from '../../../core/domain/hr/headOfficeTerritory.types';
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../../store/hr/useAuthSessionStore';
import { GeographyTable, type TerritoryItem } from './GeographyTable';
import { GeographyFormModal } from './GeographyFormModal';
import { HeadOfficeFormModal } from './HeadOfficeFormModal';
import { DeactivateConfirmModal } from './DeactivateConfirmModal';

interface GeographyMasterProps {
  onAddTerritory?: (type: TerritoryType) => void;
  onEditTerritory?: (type: TerritoryType, item: TerritoryItem) => void;
}

export function GeographyMaster({ onAddTerritory, onEditTerritory }: GeographyMasterProps) {
  const [tab, setTab] = useState<TerritoryType>('HO');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [parentFilter, setParentFilter] = useState('ALL');

  // Modals state
  const [hoModalOpen, setHoModalOpen] = useState(false);
  const [editingHoItem, setEditingHoItem] = useState<HeadOfficeRecord | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [fieldModalType, setFieldModalType] = useState<TerritoryType>('Zone');
  const [editingFieldItem, setEditingFieldItem] = useState<Zone | State | Headquarter | Area | Beat | null>(null);

  // Deactivate confirmation modal state
  const [deactivateTarget, setDeactivateTarget] = useState<TerritoryItem | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const { role, divisionId: sessionDivisionId } = useAuthSessionStore();
  const { divisions } = useHeadOfficeStore();
  const isAdminOrOwner = role === 'ADMIN' || role === 'OWNER';
  const [activeDivisionId, setActiveDivisionId] = useState(isAdminOrOwner ? '' : (sessionDivisionId || ''));

  const {
    headOffices, zones, states, hqs, areas, beats,
    getZoneName, getStateName, getHqName,
    addOrUpdateHeadOffice, toggleHeadOfficeStatus,
    addOrUpdateTerritory, toggleTerritoryStatus,
  } = useGeographyStore();

  const map: Record<TerritoryType, TerritoryItem[]> = {
    HO: headOffices, Zone: zones, State: states, HQ: hqs, Area: areas, Beat: beats,
  };

  const rawList = map[tab] || [];

  const filtered = rawList.filter((item) => {
    if (tab !== 'HO' && activeDivisionId && (item as Zone).divisionId && (item as Zone).divisionId !== activeDivisionId) return false;
    const code = item.code || '';
    const name = item.name || '';
    if (q && !code.toLowerCase().includes(q.toLowerCase()) && !name.toLowerCase().includes(q.toLowerCase())) return false;

    const isItemActive = tab === 'HO'
      ? Boolean((item as HeadOfficeRecord).is_active)
      : Boolean((item as Zone | State | Headquarter | Area | Beat).isActive);

    if (status === 'ACTIVE' && !isItemActive) return false;
    if (status === 'INACTIVE' && isItemActive) return false;

    if (parentFilter !== 'ALL') {
      if (tab === 'State' && (item as State).zoneId !== parentFilter) return false;
      if (tab === 'HQ' && (item as Headquarter).stateId !== parentFilter) return false;
      if (tab === 'Area' && (item as Area).hqId !== parentFilter) return false;
      if (tab === 'Beat' && (item as Beat).areaId !== parentFilter) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    if (tab === 'HO') {
      setEditingHoItem(null);
      setHoModalOpen(true);
    } else if (onAddTerritory) {
      onAddTerritory(tab);
    } else {
      setEditingFieldItem(null);
      setFieldModalType(tab);
      setFieldModalOpen(true);
    }
  };

  const handleOpenEdit = (item: TerritoryItem) => {
    if (tab === 'HO') {
      setEditingHoItem(item as HeadOfficeRecord);
      setHoModalOpen(true);
    } else if (onEditTerritory) {
      onEditTerritory(tab, item);
    } else {
      setEditingFieldItem(item as Zone | State | Headquarter | Area | Beat);
      setFieldModalType(tab);
      setFieldModalOpen(true);
    }
  };

  const handleToggleClick = (item: TerritoryItem) => {
    const isItemActive = tab === 'HO'
      ? Boolean((item as HeadOfficeRecord).is_active)
      : Boolean((item as Zone | State | Headquarter | Area | Beat).isActive);

    if (isItemActive) {
      setDeactivateTarget(item);
    } else {
      if (tab === 'HO') toggleHeadOfficeStatus(item as HeadOfficeRecord);
      else toggleTerritoryStatus(tab, item as Zone | State | Headquarter | Area | Beat);
    }
  };

  const handleConfirmDeactivation = async () => {
    if (!deactivateTarget) return;
    setDeactivateLoading(true);
    try {
      if (tab === 'HO') await toggleHeadOfficeStatus(deactivateTarget as HeadOfficeRecord);
      else await toggleTerritoryStatus(tab, deactivateTarget as Zone | State | Headquarter | Area | Beat);
      setDeactivateTarget(null);
    } finally {
      setDeactivateLoading(false);
    }
  };

  const tabs: Array<{ key: TerritoryType; label: string; icon: string; badge: number }> = [
    { key: 'HO', label: 'Head Office (HO)', icon: '🏢', badge: headOffices.length },
    { key: 'Zone', label: 'Zones', icon: '🌐', badge: zones.length },
    { key: 'State', label: 'States', icon: '🗺️', badge: states.length },
    { key: 'HQ', label: 'Field HQs', icon: '📍', badge: hqs.length },
    { key: 'Area', label: 'Areas', icon: '🏙️', badge: areas.length },
    { key: 'Beat', label: 'Beats', icon: '🛣️', badge: beats.length },
  ];

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Compact Row 1: Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Field Geography Master</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            {tab === 'HO' ? 'Apex Corporate Head Office (HO) Management' : 'Configure hierarchical field territories, parent linkages, and operating metadata'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer',
          }}
        >
          <span>➕</span> <span>{tab === 'HO' ? 'Create Head Office (HO)' : `Add New ${tab}`}</span>
        </button>
      </div>

      {/* Compact Row 2: Tabs & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {tabs.map((t) => {
            const isSelected = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => { setTab(t.key); setParentFilter('ALL'); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                  borderRadius: '8px', border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  background: isSelected ? '#0284c7' : '#ffffff', color: isSelected ? '#ffffff' : '#475569',
                  fontWeight: isSelected ? 700 : 600, fontSize: '12.5px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <span>{t.icon}</span> <span>{t.label}</span>
                <span style={{ background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9', color: isSelected ? '#ffffff' : '#64748b', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', width: '180px', outline: 'none' }}
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
              {divisions.map((d) => (<option key={d.id} value={d.id}>{d.code}</option>))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <GeographyTable
        tab={tab}
        items={filtered}
        getZoneName={getZoneName}
        getStateName={getStateName}
        getHqName={getHqName}
        onEdit={handleOpenEdit}
        onToggleStatus={handleToggleClick}
        onAdd={handleOpenAdd}
      />

      {/* Form Modals */}
      {hoModalOpen && (
        <HeadOfficeFormModal
          item={editingHoItem}
          onSave={async (draft) => {
            const res = await addOrUpdateHeadOffice(draft);
            if (res.success) setHoModalOpen(false);
            return res;
          }}
          back={() => setHoModalOpen(false)}
        />
      )}

      {fieldModalOpen && (
        <GeographyFormModal
          type={fieldModalType}
          item={editingFieldItem}
          zones={zones}
          states={states}
          hqs={hqs}
          areas={areas}
          onSave={async (draft) => {
            const res = await addOrUpdateTerritory(fieldModalType, draft);
            if (res.success) setFieldModalOpen(false);
            return res;
          }}
          back={() => setFieldModalOpen(false)}
        />
      )}

      {/* Deactivate Confirmation Popup Modal */}
      {deactivateTarget && (
        <DeactivateConfirmModal
          type={tab}
          item={deactivateTarget}
          loading={deactivateLoading}
          onConfirm={handleConfirmDeactivation}
          onCancel={() => setDeactivateTarget(null)}
        />
      )}
    </div>
  );
}
