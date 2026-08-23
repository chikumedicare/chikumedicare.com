import { useState, useMemo } from 'react';
import type { SfaRole, SfaUser } from '../../domain/hr/user.types';
import { getHrCapabilities, type HrCapabilities } from '../../security/hr/hrRbac';

export function calculateSystemFY(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const startYr = month >= 4 ? year : year - 1;
  const endYr = (startYr + 1).toString().slice(-2);
  return `${startYr}-${endYr}`;
}

export function useAuthSessionStore() {
  const [currentUser, setCurrentUser] = useState<Partial<SfaUser> | null>(() => {
    try {
      const saved = localStorage.getItem('chiku_auth_user');
      const user = saved ? JSON.parse(saved) : null;
      if (user && user.role !== 'ADMIN' && user.role !== 'OWNER') {
        localStorage.removeItem('chiku_auth_user');
        localStorage.removeItem('chiku_access_token');
        localStorage.removeItem('chiku_refresh_token');
        localStorage.removeItem('chiku_admin_logged_in');
        return null;
      }
      return user;
    } catch {
      return null;
    }
  });

  const systemFY = useMemo(() => calculateSystemFY(), []);
  const [activeFY, setActiveFYState] = useState<string>(() => {
    return localStorage.getItem('chiku_active_fy') || calculateSystemFY();
  });

  const role: SfaRole = (currentUser?.role as SfaRole) || 'ADMIN';
  const userName = currentUser?.fullName || 'System Administrator';
  const divisionId: string | undefined = (currentUser as any)?.division_id || (currentUser as any)?.divisionId || undefined;

  const capabilities: HrCapabilities = useMemo(() => getHrCapabilities(role), [role]);
  const isReadOnly = activeFY !== systemFY;

  const setActiveFY = (fy: string) => {
    setActiveFYState(fy);
    localStorage.setItem('chiku_active_fy', fy);
  };

  const updateUserSession = (user: Partial<SfaUser> | null) => {
    if (user && user.role !== 'ADMIN' && user.role !== 'OWNER') {
      setCurrentUser(null);
      localStorage.removeItem('chiku_auth_user');
      localStorage.removeItem('chiku_access_token');
      localStorage.removeItem('chiku_refresh_token');
      localStorage.removeItem('chiku_admin_logged_in');
      return;
    }
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('chiku_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chiku_auth_user');
    }
  };

  return {
    role,
    userName,
    divisionId,
    currentUser,
    systemFY,
    activeFY,
    setActiveFY,
    capabilities,
    isReadOnly,
    updateUserSession,
  };
}
