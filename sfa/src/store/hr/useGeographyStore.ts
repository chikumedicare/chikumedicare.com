import { getErrorMessage } from '../../utils/dataIntegrity';
import { useState, useCallback, useEffect } from 'react';
import type { Zone, State, Headquarter, Area, Beat } from '../../core/domain/hr/geography.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';

export type TerritoryType = 'Zone' | 'State' | 'HQ' | 'Area' | 'Beat';

export function useGeographyStore() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [hqs, setHqs] = useState<Headquarter[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geoGateway = GatewayContainer.getGeographyGateway();
  const userGateway = GatewayContainer.getUserGateway();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [zList, sList, hList, aList, bList] = await Promise.all([
        geoGateway.getZones(),
        geoGateway.getStates(),
        geoGateway.getHqs(),
        geoGateway.getAreas(),
        geoGateway.getBeats(),
      ]);

      // If division filter is active, filter in memory
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
      setError((e as any)?.error || (e as any)?.message || 'Failed to fetch geography data');
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

  const addOrUpdateTerritory = useCallback(
    async (type: TerritoryType, draft: Partial<Zone | State | Headquarter | Area | Beat>) => {
      try {
        setLoading(true);
        if (draft.id) {
          // Edit Mode
          if (type === 'Zone') await geoGateway.updateZone(draft.id, draft);
          if (type === 'State') await geoGateway.updateState(draft.id, draft);
          if (type === 'HQ') await geoGateway.updateHq(draft.id, draft);
          if (type === 'Area') await geoGateway.updateArea(draft.id, draft);
          if (type === 'Beat') await geoGateway.updateBeat(draft.id, draft);
        } else {
          // Create Mode
          if (type === 'Zone') await geoGateway.createZone(draft);
          if (type === 'State') await geoGateway.createState(draft);
          if (type === 'HQ') await geoGateway.createHq(draft);
          if (type === 'Area') await geoGateway.createArea(draft);
          if (type === 'Beat') await geoGateway.createBeat(draft);
        }
        await refresh();
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
        if (type === 'Zone') await geoGateway.updateZone(item.id, { isActive: newActive });
        if (type === 'State') await geoGateway.updateState(item.id, { isActive: newActive });
        if (type === 'HQ') await geoGateway.updateHq(item.id, { isActive: newActive });
        if (type === 'Area') await geoGateway.updateArea(item.id, { isActive: newActive });
        if (type === 'Beat') await geoGateway.updateBeat(item.id, { isActive: newActive });
        await refresh();
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
      return hqs.find((h) => h.id === id)?.name || id;
    },
    [hqs]
  );

  const getStateName = useCallback(
    (id?: string) => {
      if (!id) return '-';
      return states.find((s) => s.id === id)?.name || id;
    },
    [states]
  );

  const getZoneName = useCallback(
    (id?: string) => {
      if (!id) return '-';
      return zones.find((z) => z.id === id)?.name || id;
    },
    [zones]
  );

  return {
    zones,
    states,
    hqs,
    areas,
    beats,
    selectedDivisionId,
    loading,
    error,
    refresh,
    setDivisionFilter,
    addOrUpdateTerritory,
    toggleTerritoryStatus,
    updateUserCoverage,
    getHqName,
    getStateName,
    getZoneName,
  };
}
