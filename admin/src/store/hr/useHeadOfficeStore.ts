import { useState, useCallback, useEffect } from 'react';
import { HeadOfficeGateway } from '../../gateway/hr/headOfficeGateway';
import type { HeadOfficeProfile, Division } from '../../domain/hr/headOffice.types';

export type HeadOfficeTab = 'profile' | 'statutory' | 'leadership' | 'divisions' | 'policies';

export function useHeadOfficeStore() {
  const [profile, setProfile] = useState<HeadOfficeProfile | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [activeTab, setActiveTab] = useState<HeadOfficeTab>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHeadOfficeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prof, divs] = await Promise.all([
        HeadOfficeGateway.getProfile(),
        HeadOfficeGateway.getDivisions(),
      ]);
      setProfile(prof);
      setDivisions(divs);
    } catch (err: any) {
      console.error('[useHeadOfficeStore] Live fetch error:', err);
      const msg = err?.error || err?.message || 'Failed to load Head Office data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHeadOfficeData();
  }, [loadHeadOfficeData]);

  const saveProfile = useCallback(async (updates: Partial<HeadOfficeProfile>) => {
    setSaving(true);
    setError(null);
    try {
      await HeadOfficeGateway.saveProfile(updates);
      const updated = await HeadOfficeGateway.getProfile();
      setProfile(updated);
      return { success: true };
    } catch (err: any) {
      const msg = err?.error || err?.message || 'Failed to save profile';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const saveDivision = useCallback(async (draft: Partial<Division>) => {
    setSaving(true);
    setError(null);
    try {
      if (draft.id) {
        await HeadOfficeGateway.updateDivision(draft.id, draft);
      } else {
        await HeadOfficeGateway.createDivision(draft);
      }
      const divs = await HeadOfficeGateway.getDivisions();
      setDivisions(divs);
      return { success: true };
    } catch (err: any) {
      const msg = err?.error || err?.message || 'Failed to save division';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const toggleDivisionStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      await HeadOfficeGateway.updateDivision(id, { isActive: !currentStatus });
      const divs = await HeadOfficeGateway.getDivisions();
      setDivisions(divs);
    } catch (err: any) {
      console.error('Failed to toggle division status:', err);
    }
  }, []);

  return {
    profile,
    divisions,
    activeTab,
    loading,
    saving,
    error,
    setActiveTab,
    loadHeadOfficeData,
    saveProfile,
    saveDivision,
    toggleDivisionStatus,
  };
}
