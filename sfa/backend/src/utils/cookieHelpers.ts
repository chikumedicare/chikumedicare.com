export async function hashToken(token: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function extractCookie(request: Request, cookieName: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const c of cookies) {
    const [name, ...valParts] = c.split('=');
    if (name === cookieName) {
      return decodeURIComponent(valParts.join('='));
    }
  }
  return null;
}

export function buildSetCookieHeader(token: string, maxAgeSeconds: number = 2592000): string {
  // 30 days default Max-Age, Path=/api/, HttpOnly, Secure, SameSite=Strict
  return `chiku_refresh_token=${encodeURIComponent(token)}; Path=/api/; Max-Age=${maxAgeSeconds}; HttpOnly; Secure; SameSite=Strict`;
}

export function buildClearCookieHeader(): string {
  return 'chiku_refresh_token=; Path=/api/; Max-Age=0; HttpOnly; Secure; SameSite=Strict';
}
