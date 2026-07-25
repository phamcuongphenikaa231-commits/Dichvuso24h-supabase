export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'locked';

export interface AuthUser {
  id: string;
  username: string;
  phone: string;
  fullName?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  loginAt: string;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ALREADY_EXISTS'
  | 'SYSTEM_ERROR'
  | 'INVALID_OTP';

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser;
  errorCode?: AuthErrorCode;
}
