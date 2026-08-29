import { Env, AuthUser } from '../types';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';

export class AuthController {
  static async login(request: Request, env: Env) {
    try {
      const authService = new AuthService();
      const result = await authService.login(request, env);

      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      if (result.cookieHeader) {
        headers.append('Set-Cookie', result.cookieHeader);
      }

      return new Response(
        JSON.stringify({
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.user,
        }),
        { headers }
      );
    } catch (err: any) {
      const status = err.message.includes('Invalid credentials')
        ? 401
        : err.message.includes('Unauthorized') || err.message.includes('locked') || err.message.includes('Access Denied')
        ? 403
        : 400;
      return new Response(JSON.stringify({ error: err.message }), { status });
    }
  }

  static async verify(request: Request, env: Env, authUser: AuthUser) {
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401 });
    }

    // Double check user in live D1 database
    const userRepo = new UserRepository(env);
    const liveUser: any = (await userRepo.findByUserId(authUser.userId || authUser.id)) || (await userRepo.findById(authUser.id));

    if (!liveUser || liveUser.is_active === 0 || liveUser.status === 'INACTIVE' || liveUser.status === 'TERMINATED') {
      return new Response(JSON.stringify({ error: 'User account is inactive or no longer exists' }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: true, user: liveUser }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  static async refresh(request: Request, env: Env) {
    try {
      const authService = new AuthService();
      const result = await authService.refresh(request, env);

      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      if (result.cookieHeader) {
        headers.append('Set-Cookie', result.cookieHeader);
      }

      return new Response(JSON.stringify({ token: result.token, refreshToken: result.refreshToken }), { headers });
    } catch (err: any) {
      const status = err.message.includes('Missing') ? 400 : 401;
      return new Response(JSON.stringify({ error: err.message }), { status });
    }
  }

  static async logout(request: Request, env: Env, authUser?: AuthUser) {
    try {
      const authService = new AuthService();
      const result = await authService.logout(request, env, authUser);

      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      if (result.clearCookieHeader) {
        headers.append('Set-Cookie', result.clearCookieHeader);
      }

      return new Response(JSON.stringify({ success: true }), { headers });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
}
