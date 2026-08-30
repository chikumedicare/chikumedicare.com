import { getErrorMessage } from '../../utils/dataIntegrity';
import { useState, useCallback, useEffect } from 'react';
import type { Zone, State, Headquarter, Area, Beat } from '../../core/domain/hr/geography.types';
import type { HeadOfficeRecord } from '../../core/domain/hr/headOfficeTerritory.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { ApiClient } from '../../infrastructure/api/ApiClient';

export type TerritoryType = 'HO' | 'Zone' | 'State' | 'HQ' | 'Area' | 'Beat';

let _cachedHo: HeadOfficeRecord[] | null = null;
let _cachedZones: Zone[] | null = null;
let _cachedStates: State[] | null = null;
let _cachedHqs: Headquarter[] | null = null;
let _cachedAreas: Area[] | null = null;
let _cachedBeats: Beat[] | null = null;
let _lastGeoFetch = 0;
const GEO_CACHE_TTL = 30000; // 30 seconds fresh cache

export function useGeographyStore() {
  const [headOffices, setHeadOffices] = useState<HeadOfficeRecord[]>(_cachedHo || []);
  const [zones, setZones] = useState<Zone[]>(_cachedZones || []);
  const [states, setStates] = useState<State[]>(_cachedStates || []);
  const [hqs, setHqs] = useState<Headquarter[]>(_cachedHqs || []);
  const [areas, setAreas] = useState<Area[]>(_cachedAreas || []);
  const [beats, setBeats] = useState<Beat[]>(_cachedBeats || []);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geoGateway = GatewayContainer.getGeographyGateway();
  const userGateway = GatewayContainer.getUserGateway();

  const refresh = useCallback(async (force = false) => {
    if (!force && _cachedHo && Date.now() - _lastGeoFetch < GEO_CACHE_TTL) {
      setHeadOffices(_cachedHo);
      setZones(_cachedZones || []);
      setStates(_cachedStates || []);
      setHqs(_cachedHqs || []);
      setAreas(_cachedAreas || []);
      setBeats(_cachedBeats || []);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [hoRows, zList, sList, hList, aList, bList] = await Promise.all([
        ApiClient.fetch<any[]>('/api/data/head_office?limit=100', { method: 'GET' }).catch(() => []),
        geoGateway.getZones(),
        geoGateway.getStates(),
        geoGateway.getHqs(),
        geoGateway.getAreas(),
        geoGateway.getBeats(),
      ]);

      const mappedHo: HeadOfficeRecord[] = (hoRows || []).map((r) => ({
          id: String(r.id || ''),
          code: String(r.code || r.cin_number || 'HO-BHO-01'),
          name: String(r.company_name || r.name || r.brand_name || 'Corporate Head Office'),
          city: r.city || '',
          state: r.state || r.state_name || '',
          address: r.address || r.address_line1 || '',
          pincode: r.pincode || r.pin_code || '',
          contact_person: r.contact_person || r.brand_name || '',
          contact_phone: r.contact_phone || r.helpline_number || r.phone || '',
          is_active: r.is_active === 1 || r.is_active === true,
          created_at: r.created_at || '',
          updated_at: r.updated_at || '',
        }));

      _cachedHo = mappedHo;
      _cachedZones = zList;
      _cachedStates = sList;
      _cachedHqs = hList;
      _cachedAreas = aList;
      _cachedBeats = bList;
      _lastGeoFetch = Date.now();

      setHeadOffices(mappedHo);
      if (selectedDivisionId) {
        setZones(zList.filter((z) => !z.divisionId || z.divisionId === selectedDivisionId));
        setStates(sList.filter((s) => !s.divisionId || s.divisionId === selectedDivisionId));
        setHqs(hList.filter((h) => !h.divisionId || h.divisionId === selectedDivisionId));
        setAreas(aList.filter((a) => !a.divisionId || a.divisionId === selectedDivisionId));
        setBeats(bList.filter((b) => !b.divisionId || b.divisionId === selectedDivisionId));
      } else {
        setZones(zList);
        setStates(sList);
        setHqs(hList);
        setAreas(aList);
        setBeats(bList);
      }
    } catch (e: unknown) {
      console.error('[useGeographyStore] Live geography fetch error:', e);
      setError((e as { error?: string; message?: string })?.error || (e as { message?: string })?.message || 'Failed to fetch geography data');
    } finally {
      setLoading(false);
    }
  }, [geoGateway, selectedDivisionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setDivisionFilter = useCallback((divisionId: string | null) => {
    setSelectedDivisionId(divisionId);
  }, []);

  // CRUD operations on dedicated D1 head_office table
  const addOrUpdateHeadOffice = useCallback(
    async (draft: Partial<HeadOfficeRecord>) => {
      try {
        setLoading(true);
        if (draft.id) {
          await ApiClient.fetch('/api/data/head_office/' + draft.id, {
            method: 'PUT',
            body: JSON.stringify({
              company_name: draft.name,
              brand_name: draft.name,
              city: draft.city || null,
              state_name: draft.state || null,
              address_line1: draft.address || null,
              pin_code: draft.pincode || null,
              helpline_number: draft.contact_phone || null,
              is_active: draft.is_active ? 1 : 0,
            }),
          });
        } else {
          const newId = 'hea_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
          await ApiClient.fetch('/api/data/head_office', {
            method: 'POST',
            body: JSON.stringify({
              id: newId,
              company_name: draft.name,
              brand_name: draft.name,
              city: draft.city || null,
              state_name: draft.state || null,
              address_line1: draft.address || null,
              pin_code: draft.pincode || null,
              helpline_number: draft.contact_phone || null,
              is_active: draft.is_active ? 1 : 0,
            }),
          });
        }
        await refresh(true);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const toggleHeadOfficeStatus = useCallback(
    async (item: HeadOfficeRecord) => {
      try {
        setLoading(true);
        const nextActive = !item.is_active;
        await ApiClient.fetch('/api/data/head_office/' + item.id, {
          method: 'PUT',
          body: JSON.stringify({ is_active: nextActive ? 1 : 0 }),
        });
        await refresh(true);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  // Field Geography CRUD operations
  const addOrUpdateTerritory = useCallback(
    async (type: TerritoryType, draft: Partial<Zone | State | Headquarter | Area | Beat>) => {
      try {
        setLoading(true);
        if (draft.id) {
          if (type === 'Zone') await geoGateway.updateZone(draft.id, draft);
          if (type === 'State') await geoGateway.updateState(draft.id, draft);
          if (type === 'HQ') await geoGateway.updateHq(draft.id, draft);
          if (type === 'Area') await geoGateway.updateArea(draft.id, draft);
          if (type === 'Beat') await geoGateway.updateBeat(draft.id, draft);
        } else {
          if (type === 'Zone') await geoGateway.createZone(draft);
          if (type === 'State') await geoGateway.createState(draft);
          if (type === 'HQ') await geoGateway.createHq(draft);
          if (type === 'Area') await geoGateway.createArea(draft);
          if (type === 'Beat') await geoGateway.createBeat(draft);
        }
        await refresh(true);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [geoGateway, refresh]
  );

  const toggleTerritoryStatus = useCallback(
    async (type: TerritoryType, item: Zone | State | Headquarter | Area | Beat) => {
      try {
        setLoading(true);
        const newActive = !item.isActive;
        if (type === 'HQ') await geoGateway.updateHq(item.id, { isActive: newActive });
        if (type === 'Zone') await geoGateway.updateZone(item.id, { isActive: newActive });
        if (type === 'State') await geoGateway.updateState(item.id, { isActive: newActive });
        if (type === 'Area') await geoGateway.updateArea(item.id, { isActive: newActive });
        if (type === 'Beat') await geoGateway.updateBeat(item.id, { isActive: newActive });
        await refresh(true);
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [geoGateway, refresh]
  );

  const updateUserCoverage = useCallback(
    async (userId: string, coverage: { hqId?: string; coveringHqIds?: string[]; areaIds?: string[] }) => {
      try {
        setLoading(true);
        await userGateway.updateUser(userId, coverage);
        await refresh();
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setLoading(false);
      }
    },
    [userGateway, refresh]
  );

  const getHqName = useCallback(
    (id?: string) => {
      if (!id) return '-';
      const found = hqs.find((h) => h.id === id);
      return found?.name || found?.hq_name || id;
    },
    [hqs]
  );

  const getStateName = useCallback(
    (id?: string) => {
      if (!id) return '-';
      const found = states.find((s) => s.id === id);
      return found?.name || found?.state_name || id;
    },
    [states]
  );

  const getZoneName = useCallback(
    (id?: string) => {
      if (!id) return '-';
      const found = zones.find((z) => z.id === id);
      return found?.name || found?.zone_name || id;
    },
    [zones]
  );

  return {
    headOffices,
    zones,
    states,
    hqs,
    areas,
    beats,
    loading,
    error,
    refresh,
    setDivisionFilter,
    addOrUpdateHeadOffice,
    toggleHeadOfficeStatus,
    addOrUpdateTerritory,
    toggleTerritoryStatus,
    updateUserCoverage,
    getHqName,
    getStateName,
    getZoneName,
  };
}
