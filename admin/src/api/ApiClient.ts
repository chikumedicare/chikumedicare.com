export interface ApiErrorResponse {
  error: string;
  status: number;
}

export class ApiClient {
  static baseUrl = 'https://backend.ravishankar-clinic.workers.dev';

  static getAccessToken(): string | null {
    return localStorage.getItem('chiku_access_token');
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem('chiku_refresh_token');
  }

  static setTokens(token: string, refreshToken?: string): void {
    localStorage.setItem('chiku_access_token', token);
    if (refreshToken) {
      localStorage.setItem('chiku_refresh_token', refreshToken);
    }
  }

  static clearTokens(): void {
    localStorage.removeItem('chiku_access_token');
    localStorage.removeItem('chiku_refresh_token');
    localStorage.removeItem('chiku_admin_logged_in');
    localStorage.removeItem('chiku_auth_user');
  }

  static getActiveFY(): string {
    return localStorage.getItem('chiku_active_fy') || '2026-27';
  }

  static async getHeaders(): Promise<HeadersInit> {
    const token = this.getAccessToken();
    const activeFY = this.getActiveFY();

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Financial-Year': activeFY,
    };
  }

  static async fetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const defaultHeaders = await this.getHeaders();
    
    let res = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    });

    // 401 Session Expired -> Try Refresh Token
    if (res.status === 401) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${this.baseUrl}/api/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.token) {
              this.setTokens(data.token);
              const retryHeaders = await this.getHeaders();
              res = await fetch(url, {
                ...options,
                headers: { ...retryHeaders, ...options.headers },
              });
            }
          }
        } catch (e) {
          console.error('[ApiClient] Token refresh failed:', e);
        }
      }

      if (res.status === 401) {
        this.clearTokens();
        throw { error: 'Session expired. Please login again.', status: 401 };
      }
    }

    // Parse Response
    let data: any;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = data?.error || `Request failed with status ${res.status}`;
      throw { error: errorMsg, status: res.status } as ApiErrorResponse;
    }

    return data as T;
  }
}
