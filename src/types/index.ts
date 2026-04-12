export const REFRESH_TOKEN = 'refreshToken';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
  refreshToken?: string | null;
  jti?: string | null;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  refreshToken?: string | null;
  jti?: string | null;
}
