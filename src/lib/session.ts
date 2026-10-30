export const shouldRedirectToLogin = (pathname: string): boolean => {
  if (pathname === '/login' || pathname.startsWith('/login/')) return false;
  if (pathname.startsWith('/reset-password')) return false;
  return true;
};

const AUTH_SKIP_REFRESH = ['/auth/login-email', '/auth/refresh-token', '/auth/logout'];

export const isAuthRequestUrl = (url: string): boolean =>
  AUTH_SKIP_REFRESH.some((path) => url.includes(path));

export const shouldAttemptTokenRefresh = (
  status: number | undefined,
  url: string,
  alreadyRetried: boolean,
): boolean => status === 401 && !alreadyRetried && !isAuthRequestUrl(url);

export type SessionGate = 'loading' | 'allow' | 'redirect-login' | 'redirect-home';

export const protectedSessionGate = (isLoading: boolean, isAuthenticated: boolean): SessionGate => {
  if (isLoading) return 'loading';
  if (!isAuthenticated) return 'redirect-login';
  return 'allow';
};

export const guestSessionGate = (isLoading: boolean, isAuthenticated: boolean): SessionGate => {
  if (isLoading) return 'loading';
  if (isAuthenticated) return 'redirect-home';
  return 'allow';
};
