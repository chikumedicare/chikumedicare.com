import { useState, useCallback, useEffect } from 'react';
import type { Zone, State, Headquarter, Area, Beat } from '../../domain/hr/geography.types';
import { HrGateway } from '../../gateway/hr/hrGateway';

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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const divId = selectedDivisionId ?? undefined;
      const [zList, sList, hList, aList, bList] = await Promise.all([
        HrGateway.getZones(divId),
        HrGateway.getStates(divId),
        HrGateway.getHqs(divId),
        HrGateway.getAreas(divId),
        HrGateway.getBeats(divId),
      ]);
      setZones(zList);
      setStates(sList);
      setHqs(hList);
      setAreas(aList);
      setBeats(bList);
    } catch (e: any) {
      console.error('[useGeographyStore] Live geography fetch error:', e);
      setError(e?.error || e?.message || 'Failed to fetch geography data');
    } finally {
      setLoading(false);
    }
  }, [selectedDivisionId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setDivisionFilter = useCallback((divisionId: string | null) => {
    setSelectedDivisionId(divisionId);
  }, []);

  const addOrUpdateTerritory = useCallback(async (type: TerritoryType, draft: any) => {
    try {
      setLoading(true);
      if (draft.id) {
        // Edit Mode
        if (type === 'Zone') await HrGateway.updateZone(draft.id, draft);
        if (type === 'State') await HrGateway.updateState(draft.id, draft);
        if (type === 'HQ') await HrGateway.updateHq(draft.id, draft);
        if (type === 'Area') await HrGateway.updateArea(draft.id, draft);
        if (type === 'Beat') await HrGateway.updateBeat(draft.id, draft);
      } else {
        // Create Mode
        if (type === 'Zone') await HrGateway.createZone(draft);
        if (type === 'State') await HrGateway.createState(draft);
        if (type === 'HQ') await HrGateway.createHq(draft);
        if (type === 'Area') await HrGateway.createArea(draft);
        if (type === 'Beat') await HrGateway.createBeat(draft);
      }
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to save territory' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const toggleTerritoryStatus = useCallback(async (type: TerritoryType, item: any) => {
    try {
      setLoading(true);
      const newActive = !item.isActive;
      if (type === 'Zone') await HrGateway.updateZone(item.id, { isActive: newActive });
      if (type === 'State') await HrGateway.updateState(item.id, { isActive: newActive });
      if (type === 'HQ') await HrGateway.updateHq(item.id, { isActive: newActive });
      if (type === 'Area') await HrGateway.updateArea(item.id, { isActive: newActive });
      if (type === 'Beat') await HrGateway.updateBeat(item.id, { isActive: newActive });
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to update status' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const updateUserCoverage = useCallback(async (userId: string, coverage: { hqId?: string; coveringHqIds?: string[]; areaIds?: string[] }) => {
    try {
      setLoading(true);
      await HrGateway.updateUser(userId, coverage);
      await refresh();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.error || err?.message || 'Failed to update user coverage' };
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const getHqName = useCallback((id?: string) => {
    if (!id) return '-';
    return hqs.find((h) => h.id === id)?.name || id;
  }, [hqs]);

  const getStateName = useCallback((id?: string) => {
    if (!id) return '-';
    return states.find((s) => s.id === id)?.name || id;
  }, [states]);

  const getZoneName = useCallback((id?: string) => {
    if (!id) return '-';
    return zones.find((z) => z.id === id)?.name || id;
  }, [zones]);

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
