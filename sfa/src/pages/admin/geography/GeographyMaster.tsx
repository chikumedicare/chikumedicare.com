import { DataIntegrityGuard } from '../../../utils/dataIntegrity';
import React, { useState } from 'react';
import { Head } from '../../../components/Head';
import { Badge } from '../../../components/Badge';
import { useGeographyStore, type TerritoryType } from '../../../store/hr/useGeographyStore';
import type { Zone, State, Headquarter, Area, Beat } from '../../../core/domain/hr/geography.types';

export type TerritoryItem = Zone | State | Headquarter | Area | Beat;
import { useHeadOfficeStore } from '../../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../../store/hr/useAuthSessionStore';

interface GeographyMasterProps {
  onAddTerritory?: (type: TerritoryType) => void;
  onEditTerritory?: (type: TerritoryType, item: TerritoryItem) => void;
}

export function GeographyMaster({ onAddTerritory, onEditTerritory }: GeographyMasterProps) {
  const [tab, setTab] = useState<TerritoryType>('Zone');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ALL');
  const [parentFilter, setParentFilter] = useState('ALL');

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
    areas,
    beats,
    getZoneName,
    getStateName,
    getHqName,
    toggleTerritoryStatus,
  } = useGeographyStore();

  const fieldHqs = hqs;

  const map: Record<TerritoryType, TerritoryItem[]> = {
    Zone: zones,
    State: states,
    HQ: fieldHqs,
    Area: areas,
    Beat: beats,
  };

  const tabIcons: Record<TerritoryType, string> = {
    Zone: '🌐',
    State: '🏛️',
    HQ: '🏢',
    Area: '📍',
    Beat: '🛣️',
  };

  const getParent = (item: TerritoryItem) => {
    if (tab === 'State') return getZoneName(item.zoneId);
    if (tab === 'HQ') return getStateName(item.stateId);
    if (tab === 'Area') return getHqName(item.hqId);
    if (tab === 'Beat') return areas.find((a) => a.id === item.areaId)?.name || '-';
    return '-';
  };

  // Smart Item Division Resolver
  const getItemDivisionId = (item: TerritoryItem, type: TerritoryType): string => {
    if (item.divisionId) return item.divisionId;
    if (type === 'Beat') {
      const area = areas.find((a) => a.id === item.areaId);
      if (area?.divisionId) return area.divisionId;
      const hq = hqs.find((h) => h.id === area?.hqId);
      return hq?.divisionId || '';
    }
    if (type === 'Area') {
      const hq = hqs.find((h) => h.id === item.hqId);
      return hq?.divisionId || '';
    }
    if (type === 'HQ') {
      const state = states.find((s) => s.id === item.stateId);
      return state?.divisionId || '';
    }
    if (type === 'State') {
      const zone = zones.find((z) => z.id === item.zoneId);
      return zone?.divisionId || '';
    }
    return '';
  };

  const getDivisionName = (divId?: string, hqType?: string) => {
    if (hqType === 'HO') return 'Apex / Universal HO';
    return DataIntegrityGuard.verifyDivisionDisplay(divId, undefined, divisions);
  };

  const isFiltersActive =
    q.trim() !== '' ||
    status !== 'ALL' ||
    activeDivisionId !== '' ||
    parentFilter !== 'ALL';

  const handleClearFilters = () => {
    setQ('');
    setStatus('ALL');
    setParentFilter('ALL');
    if (isAdminOrOwner) setActiveDivisionId('');
  };

  const currentTabItems = map[tab];

  const list = currentTabItems.filter((item: TerritoryItem) => {
    // 1. Division Filter
    if (activeDivisionId) {
      const itemDivId = getItemDivisionId(item, tab);
      if (itemDivId && itemDivId !== activeDivisionId) return false;
    }

    // 2. Status Filter
    if (status !== 'ALL') {
      const isActive = item.isActive;
      if (status === 'ACTIVE' && !isActive) return false;
      if (status === 'INACTIVE' && isActive) return false;
    }

    // 3. Parent Territory Filter
    if (parentFilter !== 'ALL') {
      if (tab === 'State' && item.zoneId !== parentFilter) return false;
      if (tab === 'HQ' && item.stateId !== parentFilter) return false;
      if (tab === 'Area' && item.hqId !== parentFilter) return false;
      if (tab === 'Beat' && item.areaId !== parentFilter) return false;
    }

    // 4. Search Filter
    if (q.trim()) {
      const parentName = getParent(item);
      const divName = getDivisionName(getItemDivisionId(item, tab));
      const haystack = `${item.code || ''} ${item.name || ''} ${parentName} ${divName}`.toLowerCase();
      if (!haystack.includes(q.toLowerCase().trim())) return false;
    }

    return true;
  });

  return (
    <>
      <Head
        title="Field Geography Master"
        sub="Field Territory Hierarchy Structure: Zone ➔ State ➔ Base HQ ➔ Area ➔ Beat"
        action={
          <button
            className="primary"
            onClick={() => onAddTerritory?.(tab)}
            style={{ padding: '10px 22px', fontSize: '13px', fontWeight: 700, borderRadius: '10px', background: '#0284c7', borderColor: '#0284c7' }}
          >
            + Add New {tab}
          </button>
        }
      />

      {/* Sleek Territory Level Pill Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {(['Zone', 'State', 'HQ', 'Area', 'Beat'] as const).map((t) => {
          const isActive = tab === t;
          const count = map[t].length;

          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setQ('');
                setParentFilter('ALL');
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#0284c7' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: isActive ? '#0284c7' : '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tabIcons[t]}</span>
              <span>{t}</span>
              <span style={{ fontSize: '11px', background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0', padding: '2px 7px', borderRadius: '10px' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {isAdminOrOwner && (
          <select value={activeDivisionId} onChange={(e) => setActiveDivisionId(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <option value="">All Marketing Divisions</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', background: '#f8fafc', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <span style={{ color: '#94a3b8' }}>🔍</span>
          <input
            placeholder={`Search ${tab} by code, name, parent or division...`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', padding: '8px 0', background: 'transparent', fontSize: '13px' }}
          />
        </div>

        {/* Dynamic Parent Filter */}
        {tab === 'State' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <option value="ALL">All Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.code} - {z.name}</option>
            ))}
          </select>
        )}
        {tab === 'HQ' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <option value="ALL">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        {tab === 'Area' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <option value="ALL">All Base HQs</option>
            {fieldHqs.map((h) => (
              <option key={h.id} value={h.id}>{h.code} - {h.name}</option>
            ))}
          </select>
        )}
        {tab === 'Beat' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <option value="ALL">All Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
            ))}
          </select>
        )}

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>

        {isFiltersActive && (
          <button
            type="button"
            className="secondary"
            onClick={handleClearFilters}
            style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px', fontSize: '12px', color: '#64748b' }}>
        <span>Showing <b>{list.length}</b> of <b>{currentTabItems.length}</b> {tab} records</span>
      </div>

      {/* Main Territory Table */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 18px' }}>Territory Code</th>
              <th style={{ padding: '14px 18px' }}>Territory Name</th>
              <th style={{ padding: '14px 18px' }}>Marketing Division</th>
              <th style={{ padding: '14px 18px' }}>Parent Level</th>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item: TerritoryItem) => {
              const itemDivId = getItemDivisionId(item, tab);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <b style={{ color: '#0284c7' }}>{item.code}</b>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <small style={{ color: '#0369a1', fontWeight: 600 }}>
                      {getDivisionName(itemDivId, item.hqType)}
                    </small>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>
                    {getParent(item)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      onClick={() => toggleTerritoryStatus(tab, item)}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle status"
                    >
                      <Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <button
                      className="link"
                      onClick={() => onEditTerritory?.(tab, item)}
                      style={{ color: '#0284c7', fontWeight: 600 }}
                    >
                      Edit {tab}
                    </button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>
                  No {tab} records found matching your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
