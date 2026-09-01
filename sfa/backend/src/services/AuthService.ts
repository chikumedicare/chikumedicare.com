import * as jose from 'jose';
import { Env, AuthUser } from '../types';
import { AuthRepository } from '../repositories/AuthRepository';
import { UserRepository } from '../repositories/UserRepository';
import { parseArrayField, logAudit } from '../utils/helpers';
import { hashToken, extractCookie, buildSetCookieHeader, buildClearCookieHeader } from '../utils/cookieHelpers';

export class AuthService {
  async login(request: Request, env: Env) {
    const { userId, password, deviceId, deviceName, deviceModel, osVersion, appVersion, clientType } = (await request.json()) as any;

    if (!password || typeof password !== 'string' || password.length > 100) throw new Error('Invalid password');
    if (!userId || typeof userId !== 'string' || userId.length > 50) throw new Error('Invalid userId');

    const repo = new AuthRepository(env);
    const user: any = await repo.getUserByUserId(userId);

    if (!user) throw new Error('Invalid credentials');
    if (user.is_active === 0 || user.status === 'INACTIVE' || user.status === 'TERMINATED' || user.status === 'RESIGNED') {
      throw new Error('User is deactivated or inactive');
    }

    const now = new Date();
    if (user.locked_until && new Date(user.locked_until) > now) {
      throw new Error('Account locked due to excessive failed attempts. Try again later.');
    }

    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

    const lhId = `lh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const ipAddress = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || 'Browser / Client';

    if (user.password_hash !== passwordHash) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 5) lockedUntil = new Date(now.getTime() + 15 * 60000).toISOString();
      await repo.updateFailedLogin(user.id, attempts, lockedUntil, lhId, ipAddress, deviceId || null);
      throw new Error('Invalid credentials');
    }

    if (deviceId) {
      if (!user.device_id) {
        await repo.registerDevice(user.id, deviceId, deviceName || null, deviceModel || null, osVersion || null, appVersion || null);
      } else if (user.device_id !== deviceId) {
        await repo.logFailedDeviceLogin(user.id, lhId, ipAddress, deviceId);
        throw new Error('Unauthorized Device. Please contact Admin to reset.');
      } else {
        await repo.updateDevice(user.id, deviceName || user.device_name, deviceModel || user.device_model, osVersion || user.os_version, appVersion || user.app_version);
      }
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const sessionFamilyId = `fam_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
    const accessJti = `jti_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const token = await new jose.SignJWT({
      id: String(user.id),
      userId: user.user_id,
      role: user.role,
      fullName: user.full_name,
      reportsToId: user.reports_to_id || null,
      hqId: user.hq_id || null,
      coveringHqIds: parseArrayField(user.covering_hq_ids),
      deviceId: deviceId || null,
      sessionId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(accessJti)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    const refreshJti = `jti_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const refreshToken = await new jose.SignJWT({
      id: String(user.id),
      sessionId,
      sessionFamilyId,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(refreshJti)
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    const refreshTokenHash = await hashToken(refreshToken);
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    await env.chikusfa_db
      .prepare(
        `INSERT INTO user_sessions (
          id, user_id, session_family_id, refresh_token_hash, device_id, 
          user_agent, ip_address, created_at, last_active_at, expires_at, is_revoked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
      )
      .bind(sessionId, String(user.id), sessionFamilyId, refreshTokenHash, deviceId || null, userAgent, ipAddress, nowIso, nowIso, expiresAt)
      .run();

    await repo.updateSuccessfulLogin(user.id, lhId, ipAddress, deviceId || null);

    const ROLE_PERMISSIONS: Record<string, string[]> = {
      OWNER: ['ALL_ACCESS'], ADMIN: ['ALL_ACCESS'],
      VP: ['MANAGE_USERS', 'MANAGE_GEOGRAPHY', 'MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'MANAGE_LEAVES', 'MANAGE_EXPENSES', 'MANAGE_PAYROLL'],
      NSM: ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'MANAGE_LEAVES', 'MANAGE_EXPENSES'],
      ZSM: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'MANAGE_LEAVES', 'MANAGE_EXPENSES'],
      RSM: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'MANAGE_LEAVES', 'MANAGE_EXPENSES'],
      ASM: ['MANAGE_CUSTOMERS', 'MANAGE_PRODUCTS', 'MANAGE_TARGETS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'MANAGE_LEAVES', 'MANAGE_EXPENSES'],
      MR: ['MANAGE_CUSTOMERS', 'MANAGE_DCR', 'MANAGE_TOUR_PLANS', 'MANAGE_LEAVES', 'MANAGE_EXPENSES'],
    };

    const perms: string[] = ROLE_PERMISSIONS[user.role] || ['FIELD_ACCESS'];

    let hqName = '';
    if (user.hq_id) {
      try {
        const hqRow: any = await env.chikusfa_db
          .prepare('SELECT name, hq_name FROM hqs WHERE id = ? OR hq_code = ? LIMIT 1')
          .bind(user.hq_id, user.hq_id)
          .first();
        if (hqRow) hqName = hqRow.name || hqRow.hq_name || '';
      } catch (e) {}
    }

    let reportingToName = '';
    if (user.reports_to_id) {
      try {
        const mgrRow: any = await env.chikusfa_db
          .prepare('SELECT full_name, role FROM users WHERE id = ? OR user_id = ? LIMIT 1')
          .bind(user.reports_to_id, user.reports_to_id)
          .first();
        if (mgrRow) reportingToName = `${mgrRow.full_name} (${mgrRow.role})`;
      } catch (e) {}
    }

    const defaultHq = user.role === 'OWNER' || user.role === 'ADMIN' ? 'Head Office (Apex)' : (hqName || (user.hq_id ? user.hq_id : 'Unassigned HQ'));
    const defaultReporting = user.role === 'OWNER' || user.role === 'ADMIN' ? 'Apex Board' : (reportingToName || 'Apex Board (Owner & Admin)');

    const userResponse = {
      id: String(user.id),
      userId: user.user_id,
      fullName: user.full_name,
      role: user.role,
      empCode: user.emp_code || '',
      reportsToId: user.reports_to_id || null,
      reportingToName: defaultReporting,
      reportsToIds: user.reports_to_ids ? JSON.parse(user.reports_to_ids) : [],
      hqId: user.hq_id || null,
      hqName: defaultHq,
      coveringHqIds: parseArrayField(user.covering_hq_ids),
      areaIds: parseArrayField(user.area_ids),
      permissions: perms,
      isActive: true,
    };

    await logAudit(env, {
      module: 'auth',
      type: 'LOGIN',
      action: 'LOGIN',
      entityType: 'users',
      entityId: String(user.id),
      details: {
        sessionId,
        deviceId: deviceId || null,
        ip: ipAddress,
        clientType: clientType || (deviceId ? 'mobile-app' : 'web-admin'),
        userAgent,
      },
      userId: String(user.id),
      userName: user.full_name,
    });

    const cookieHeader = buildSetCookieHeader(refreshToken);

    return { token, refreshToken, user: userResponse, cookieHeader };
  }

  async refresh(request: Request, env: Env) {
    let refreshToken = extractCookie(request, 'chiku_refresh_token');
    if (!refreshToken) {
      try {
        const body = (await request.json()) as any;
        refreshToken = body?.refreshToken || null;
      } catch (e) {}
    }

    if (!refreshToken) throw new Error('Missing refresh token');

    const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);
    let payload: any;
    try {
      const verified = await jose.jwtVerify(refreshToken, JWT_SECRET);
      payload = verified.payload;
    } catch (e) {
      throw new Error('Invalid or expired refresh token');
    }

    if (!payload || payload.type !== 'refresh' || !payload.sessionId) {
      throw new Error('Invalid refresh token structure');
    }

    const presentedHash = await hashToken(refreshToken);

    const session: any = await env.chikusfa_db
      .prepare('SELECT * FROM user_sessions WHERE id = ?')
      .bind(payload.sessionId)
      .first();

    if (!session || session.is_revoked === 1 || session.refresh_token_hash !== presentedHash) {
      if (payload.sessionFamilyId) {
        await env.chikusfa_db
          .prepare(`UPDATE user_sessions SET is_revoked = 1, revoked_at = datetime('now'), revocation_reason = 'REUSE_DETECTED' WHERE session_family_id = ?`)
          .bind(payload.sessionFamilyId)
          .run();
      }

      await logAudit(env, {
        module: 'auth',
        type: 'SECURITY_ALERT',
        action: 'TOKEN_REUSE_DETECTED',
        entityType: 'users',
        entityId: String(payload.id),
        details: { sessionId: payload.sessionId, familyId: payload.sessionFamilyId },
        userId: String(payload.id),
        userName: 'Unknown',
      });

      throw new Error('401 Unauthorized: Session compromised or reused. Re-authentication required.');
    }

    const now = new Date();
    if (new Date(session.expires_at) < now) {
      throw new Error('401 Unauthorized: Session expired.');
    }

    const userRepo = new UserRepository(env);
    const user: any = await userRepo.findById(payload.id);
    if (!user || user.is_active === 0 || user.status === 'INACTIVE' || user.status === 'TERMINATED' || user.status === 'RESIGNED') {
      await env.chikusfa_db
        .prepare(`UPDATE user_sessions SET is_revoked = 1, revoked_at = datetime('now'), revocation_reason = 'USER_INACTIVE' WHERE id = ?`)
        .bind(session.id)
        .run();
      throw new Error('401 Unauthorized: User is inactive.');
    }

    const accessJti = `jti_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const token = await new jose.SignJWT({
      id: String(user.id),
      userId: user.user_id,
      role: user.role,
      fullName: user.full_name,
      reportsToId: user.reports_to_id || null,
      hqId: user.hq_id || null,
      coveringHqIds: parseArrayField(user.covering_hq_ids),
      deviceId: user.device_id || null,
      sessionId: session.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(accessJti)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    const refreshJti = `jti_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newRefreshToken = await new jose.SignJWT({
      id: String(user.id),
      sessionId: session.id,
      sessionFamilyId: session.session_family_id,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(refreshJti)
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(JWT_SECRET);

    const newHash = await hashToken(newRefreshToken);
    const newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await env.chikusfa_db
      .prepare(`UPDATE user_sessions SET refresh_token_hash = ?, last_active_at = datetime('now'), expires_at = ? WHERE id = ?`)
      .bind(newHash, newExpiresAt, session.id)
      .run();

    const cookieHeader = buildSetCookieHeader(newRefreshToken);

    return { token, refreshToken: newRefreshToken, cookieHeader };
  }

  async logout(request: Request, env: Env, authUser?: AuthUser) {
    let refreshToken = extractCookie(request, 'chiku_refresh_token');
    if (!refreshToken) {
      try {
        const body = (await request.json()) as any;
        refreshToken = body?.refreshToken || null;
      } catch (e) {}
    }

    const sessionId = (authUser as any)?.sessionId;

    if (sessionId) {
      await env.chikusfa_db
        .prepare(`UPDATE user_sessions SET is_revoked = 1, revoked_at = datetime('now'), revocation_reason = 'USER_LOGOUT' WHERE id = ?`)
        .bind(sessionId)
        .run();
    } else if (refreshToken) {
      const hash = await hashToken(refreshToken);
      await env.chikusfa_db
        .prepare(`UPDATE user_sessions SET is_revoked = 1, revoked_at = datetime('now'), revocation_reason = 'USER_LOGOUT' WHERE refresh_token_hash = ?`)
        .bind(hash)
        .run();
    }

    const clearCookieHeader = buildClearCookieHeader();
    return { success: true, clearCookieHeader };
  }
}
