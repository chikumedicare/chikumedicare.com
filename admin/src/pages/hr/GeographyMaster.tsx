import React, { useState } from 'react';
import { Head } from '../../components/Head';
import { Badge } from '../../components/Badge';
import { useGeographyStore, type TerritoryType } from '../../store/hr/useGeographyStore';
import { useHeadOfficeStore } from '../../store/hr/useHeadOfficeStore';
import { useAuthSessionStore } from '../../store/hr/useAuthSessionStore';

interface GeographyMasterProps {
  onAddTerritory?: (type: TerritoryType) => void;
  onEditTerritory?: (type: TerritoryType, item: any) => void;
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

  const fieldHqs = hqs.filter((h) => !h.isSuperHq && h.code !== 'HQ000');

  const map: Record<TerritoryType, any[]> = {
    Zone: zones,
    State: states,
    HQ: fieldHqs,
    Area: areas,
    Beat: beats,
  };

  const getParent = (item: any) => {
    if (tab === 'State') return getZoneName(item.zoneId);
    if (tab === 'HQ') return getStateName(item.stateId);
    if (tab === 'Area') return getHqName(item.hqId);
    if (tab === 'Beat') return areas.find((a) => a.id === item.areaId)?.name || '-';
    return '-';
  };

  // Smart Item Division Resolver
  const getItemDivisionId = (item: any, type: TerritoryType): string => {
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

  const getDivisionName = (divId?: string) => {
    if (!divId) return '-';
    return divisions.find((d) => d.id === divId)?.name || divId;
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

  const list = currentTabItems.filter((item: any) => {
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
        sub="Field Territory Hierarchy: Zone ➔ State ➔ Field HQ ➔ Area ➔ Beat"
        action={
          <button
            className="primary"
            onClick={() => onAddTerritory?.(tab)}
          >
            + Add {tab}
          </button>
        }
      />

      <div className="tabs">
        {(['Zone', 'State', 'HQ', 'Area', 'Beat'] as const).map((t) => (
          <button
            className={tab === t ? 'on' : ''}
            onClick={() => {
              setTab(t);
              setQ('');
              setParentFilter('ALL');
            }}
            key={t}
          >
            {t} ({map[t].length})
          </button>
        ))}
      </div>

      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {isAdminOrOwner && (
          <select value={activeDivisionId} onChange={(e) => setActiveDivisionId(e.target.value)} style={{ flex: '0 0 auto' }}>
            <option value="">All Marketing Divisions</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
            ))}
          </select>
        )}

        <input
          placeholder={`Search ${tab} by code, name, parent or division...`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: '1 1 220px', minWidth: '180px' }}
        />

        {/* Dynamic Parent Filter */}
        {tab === 'State' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
            <option value="ALL">All Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.code} - {z.name}</option>
            ))}
          </select>
        )}
        {tab === 'HQ' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
            <option value="ALL">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        {tab === 'Area' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
            <option value="ALL">All Base HQs</option>
            {fieldHqs.map((h) => (
              <option key={h.id} value={h.id}>{h.code} - {h.name}</option>
            ))}
          </select>
        )}
        {tab === 'Beat' && (
          <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ flex: '0 0 auto' }}>
            <option value="ALL">All Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
            ))}
          </select>
        )}

        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ flex: '0 0 auto' }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>

        {isFiltersActive && (
          <button
            type="button"
            className="secondary"
            onClick={handleClearFilters}
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px', fontSize: '13px', color: '#64748b' }}>
        <span>Showing <b>{list.length}</b> of <b>{currentTabItems.length}</b> {tab} records</span>
      </div>

      <div className="panel table">
        <table>
          <thead>
            <tr>
              <th>Territory Code</th>
              <th>Name</th>
              <th>Division</th>
              <th>Parent Level</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item: any) => {
              const itemDivId = getItemDivisionId(item, tab);
              return (
                <tr key={item.id}>
                  <td><b>{item.code}</b></td>
                  <td>{item.name}</td>
                  <td>
                    <small style={{ color: '#0284c7', fontWeight: 500 }}>
                      {getDivisionName(itemDivId)}
                    </small>
                  </td>
                  <td>{getParent(item)}</td>
                  <td>
                    <span
                      onClick={() => toggleTerritoryStatus(tab, item)}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle status"
                    >
                      <Badge v={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </span>
                  </td>
                  <td>
                    <button
                      className="link"
                      onClick={() => onEditTerritory?.(tab, item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No {tab} records found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
