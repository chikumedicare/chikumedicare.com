import { useState, useCallback } from 'react';
import type { SfaUser } from '../../core/domain/hr/user.types';
import { GatewayContainer } from '../../core/container/GatewayContainer';
import { ApiClient } from '../../infrastructure/api/ApiClient';

export function useAuthSessionStore() {
  const [currentUser, setCurrentUser] = useState<SfaUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('chiku_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (userId: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const session = await GatewayContainer.getAuthGateway().login(userId, pass);
      setCurrentUser(session.user);
      sessionStorage.setItem('chiku_auth_user', JSON.stringify(session.user));
      return { success: true, user: session.user };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifySession = useCallback(async () => {
    setLoading(true);
    try {
      const liveUser = await GatewayContainer.getAuthGateway().verifySession();
      setCurrentUser(liveUser);
      sessionStorage.setItem('chiku_auth_user', JSON.stringify(liveUser));
      return { success: true, user: liveUser };
    } catch (err) {
      setCurrentUser(null);
      ApiClient.clearTokens();
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await GatewayContainer.getAuthGateway().logout();
    } finally {
      setCurrentUser(null);
      ApiClient.clearTokens();
    }
  }, []);

  return {
    currentUser,
    userId: currentUser?.userId || '',
    userName: currentUser?.fullName || '',
    role: currentUser?.role || 'MR',
    hqId: currentUser?.hqId,
    coveringHqIds: currentUser?.coveringHqIds || [],
    divisionId: currentUser?.divisionId,
    loading,
    error,
    login,
    verifySession,
    logout,
  };
}
