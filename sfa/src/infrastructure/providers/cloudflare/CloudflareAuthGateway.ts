import { IAuthGateway, AuthSession, AuthenticationError } from '../../../core/contracts/IAuthGateway';
import type { SfaUser } from '../../../core/domain/hr/user.types';
import { ApiClient } from '../../api/ApiClient';
import { mapUserFromDb } from '../../mappers/userMapper';

export class CloudflareAuthGateway implements IAuthGateway {
  async login(userId: string, password: string): Promise<AuthSession> {
    try {
      const data = await ApiClient.fetch<{ token: string; user: Record<string, unknown> }>(
        '/api/login',
        {
          method: 'POST',
          body: JSON.stringify({
            userId,
            password,
            clientType: 'web-admin',
          }),
        }
      );

      // In-Memory Access Token Set
      ApiClient.setAccessToken(data.token);

      const user = mapUserFromDb(data.user);
      return {
        token: data.token,
        user,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'error' in err ? String((err as { error: unknown }).error) : 'Invalid credentials or login failed';
      throw new AuthenticationError(msg);
    }
  }

  async verifySession(): Promise<SfaUser> {
    try {
      const response = await ApiClient.fetch<{ success: boolean; user: Record<string, unknown> }>('/api/verify', {
        method: 'GET',
      });
      return mapUserFromDb(response.user);
    } catch (err: unknown) {
      throw new AuthenticationError('Session expired or invalid token');
    }
  }

  async logout(): Promise<void> {
    try {
      await ApiClient.fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.warn('[CloudflareAuthGateway] Logout request error:', err);
    } finally {
      ApiClient.clearTokens();
    }
  }
}
