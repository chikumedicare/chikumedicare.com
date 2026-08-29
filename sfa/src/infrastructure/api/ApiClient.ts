import { API_CONFIG } from '../config/apiConfig';

export interface ApiErrorResponse {
  error: string;
  status: number;
}

export class ApiClient {
  static baseUrl = API_CONFIG.baseUrl;

  // In-Memory Token Storage (Protected from XSS / localStorage extraction)
  private static _accessToken: string | null = null;
  private static _isRefreshing = false;
  private static _refreshSubscribers: ((token: string | null) => void)[] = [];

  static getAccessToken(): string | null {
    return this._accessToken;
  }

  static setAccessToken(token: string | null): void {
    this._accessToken = token;
  }

  static clearTokens(): void {
    this._accessToken = null;
    localStorage.removeItem('chiku_access_token');
    localStorage.removeItem('chiku_refresh_token');
    localStorage.removeItem('chiku_admin_logged_in');
    localStorage.removeItem('chiku_auth_user');
    sessionStorage.clear();
  }

  static getActiveFY(): string {
    return localStorage.getItem('chiku_active_fy') || sessionStorage.getItem('chiku_active_fy') || '2026-27';
  }

  static getHeaders(): HeadersInit {
    const token = this.getAccessToken();
    const activeFY = this.getActiveFY();

    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF Defense-in-depth
      'X-CSRF-Protection': '1',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Financial-Year': activeFY,
    };
  }

  private static subscribeTokenRefresh(cb: (token: string | null) => void) {
    this._refreshSubscribers.push(cb);
  }

  private static onRefreshed(token: string | null) {
    this._refreshSubscribers.forEach((cb) => cb(token));
    this._refreshSubscribers = [];
  }

  static async fetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const defaultHeaders = this.getHeaders();

    let res = await fetch(url, {
      ...options,
      credentials: 'include', // Includes HttpOnly refresh token cookie
      headers: { ...defaultHeaders, ...options.headers },
    });

    // 401 Session Expired / Token Expired -> Trigger Secure Refresh with Cookie
    if (res.status === 401 && !path.startsWith('/api/login') && !path.startsWith('/api/refresh') && !path.startsWith('/api/logout')) {
      if (!this._isRefreshing) {
        this._isRefreshing = true;

        try {
          const refreshRes = await fetch(`${this.baseUrl}/api/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          });

          if (refreshRes.ok) {
            const data = (await refreshRes.json()) as { token?: string };
            if (data.token) {
              this.setAccessToken(data.token);
              this._isRefreshing = false;
              this.onRefreshed(data.token);

              // Retry original request
              const retryHeaders = this.getHeaders();
              res = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: { ...retryHeaders, ...options.headers },
              });
            } else {
              throw new Error('No access token returned from refresh');
            }
          } else {
            throw new Error('Refresh failed');
          }
        } catch (refreshErr) {
          this._isRefreshing = false;
          this.onRefreshed(null);
          this.clearTokens();
          window.dispatchEvent(new CustomEvent('chiku_auth_expired'));
        }
      } else {
        // Wait for active refresh to complete
        const retryToken = await new Promise<string | null>((resolve) => {
          this.subscribeTokenRefresh((token) => resolve(token));
        });

        if (retryToken) {
          const retryHeaders = this.getHeaders();
          res = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: { ...retryHeaders, ...options.headers },
          });
        }
      }
    }

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        errorMsg = (errorJson as any)?.error || errorMsg;
      } catch (e) {}

      const errorObj: ApiErrorResponse = {
        error: errorMsg,
        status: res.status,
      };
      throw errorObj;
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }
}
