export interface UserSession {
  userId: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserSession | null;
  loading: boolean;
  error: string | null;
}