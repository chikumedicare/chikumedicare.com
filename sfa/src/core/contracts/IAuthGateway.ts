import type { SfaUser } from '../domain/hr/user.types';

export interface AuthSession {
  token: string;
  user: SfaUser;
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export interface IAuthGateway {
  login(userId: string, password: string): Promise<AuthSession>;
  verifySession(): Promise<SfaUser>;
  logout(): Promise<void>;
}
