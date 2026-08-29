
export type { Division, HeadOfficeProfile } from '../../core/domain/hr/headOffice.types';
export type HeadOfficeTab = 'PROFILE' | 'DIVISIONS' | 'LEADERSHIP';

import { useState, useEffect, useCallback } from 'react';
import type { Division, HeadOfficeProfile } from '../../core/domain/hr/headOffice.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { getErrorMessage } from '../../utils/dataIntegrity';

export function useHeadOfficeStore() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [profile, setProfile] = useState<HeadOfficeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeadOfficeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [divs, prof] = await Promise.all([
        GatewayContainer.getHeadOfficeGateway().getDivisions(),
        GatewayContainer.getHeadOfficeGateway().getHeadOfficeProfile(),
      ]);
      setDivisions(divs || []);
      setProfile(prof || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeadOfficeData();
  }, [fetchHeadOfficeData]);

  const saveDivision = async (div: Partial<Division>) => {
    setLoading(true);
    try {
      const saved = await GatewayContainer.getHeadOfficeGateway().saveDivision(div);
      await fetchHeadOfficeData();
      return { success: true, division: saved };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  };

  const deleteDivision = async (id: string) => {
    setLoading(true);
    try {
      await GatewayContainer.getHeadOfficeGateway().deleteDivision(id);
      await fetchHeadOfficeData();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (prof: Partial<HeadOfficeProfile>) => {
    setLoading(true);
    try {
      const saved = await GatewayContainer.getHeadOfficeGateway().updateHeadOfficeProfile(prof);
      setProfile(saved);
      return { success: true, profile: saved };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setLoading(false);
    }
  };

  return {
    divisions,
    profile,
    loading,
    error,
    fetchHeadOfficeData,
    saveDivision,
    deleteDivision,
    saveProfile,
  };
}
